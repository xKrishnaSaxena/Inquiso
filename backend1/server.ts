import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import mongoose, { Document, Schema } from "mongoose";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const mongoUri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

interface IQuestion extends Document {
  text: string;
  userName: string;
  votes: number;
  upvotedBy: string[];
}

interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  userName: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [String],
});

const Question = mongoose.model<IQuestion>("Question", questionSchema);

const userSchema = new Schema<IUser>({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model<IUser>("User", userSchema);

app.post("/register", async (req: Request, res: Response) => {
  const { email, password, role, userName } = req.body;

  try {
    const user = new User({ email, password, role, userName });
    await user.save();
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, message: "Registration successful" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user" });
  }
});

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/protected", authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.status(200).json({ message: "Access granted", user });
});

io.on("connection", async (socket) => {
  console.log("A user connected");

  try {
    const questions = await Question.find({}).sort({ votes: -1 });
    socket.emit("load-questions", questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
  }

  socket.on(
    "new-question",
    async (data: { text: string; userName: string }) => {
      const question = new Question({
        text: data.text,
        userName: data.userName,
      });
      await question.save();
      io.emit("question-posted", question);
      const questions = await Question.find({}).sort("votes");
      console.log(questions);
      socket.emit("load-questions", questions);
    }
  );

  socket.on("upvote-question", async (questionId: string, userName: string) => {
    const question = await Question.findById(questionId);

    if (question) {
      if (
        question.userName !== userName &&
        !question.upvotedBy.includes(userName)
      ) {
        question.votes += 1;
        question.upvotedBy.push(userName);
        await question.save();
        io.emit("question-updated", question);
        const questions = await Question.find({}).sort("votes");
        console.log(questions);
        socket.emit("load-questions", questions);
      }
    }
  });

  socket.on("admin-action", async ({ action, questionId }: any) => {
    if (action === "answered" || action === "remove") {
      await Question.findByIdAndDelete(questionId);
      io.emit(
        action === "answered" ? "question-answered" : "question-removed",
        questionId
      );
    }
  });

  socket.on("remove-all", async () => {
    await Question.deleteMany({});
    io.emit("all-questions-removed");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
