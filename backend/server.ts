import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import mongoose, { Document, Schema } from "mongoose";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { IQuestion, IRoom, IUser } from "./types";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const mongoUri = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

app.use(cors());
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

//SCHEMAS
const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  userName: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [String],
  created_at: { type: Date, default: Date.now },
  roomId: { type: String, required: true },
});

const roomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

//MODELS
const Room = mongoose.model<IRoom>("Room", roomSchema);
const Question = mongoose.model<IQuestion>("Question", questionSchema);
const User = mongoose.model<IUser>("User", userSchema);

//SOCKET FUNCTIONS
io.on("connection", async (socket) => {
  console.log("A user connected");

  socket.on("join-room-socket", async (roomId: string) => {
    const room = await Room.findOne({ roomId: roomId });
    if (!room) {
      socket.emit("error", { message: "Room not found or has been deleted" });
      return;
    }
    socket.join(roomId);
    console.log(`User joined room ${roomId}`);
    try {
      const questions = await Question.find({ roomId }).sort({ votes: -1 });
      socket.emit("load-questions", questions);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  });

  socket.on(
    "new-question",
    async (data: { text: string; userName: string; roomId: string }) => {
      const question = new Question({
        text: data.text,
        userName: data.userName,
        roomId: data.roomId,
      });
      await question.save();
      io.emit("question-posted", question);

      const questions = await Question.find({ roomId: data.roomId }).sort({
        votes: -1,
        created_at: -1,
      });
      io.emit("load-questions", questions);
    }
  );
  socket.on(
    "upvote-question",
    async (questionId: string, userName: string, roomId: string) => {
      const question = await Question.findById(questionId);
      if (question) {
        if (
          question.userName !== userName &&
          !question.upvotedBy.includes(userName)
        ) {
          question.votes += 1;
          question.upvotedBy.push(userName);
          await question.save();
          io.to(roomId).emit("question-updated", question);
          const questions = await Question.find({ roomId }).sort({ votes: -1 });
          io.to(roomId).emit("load-questions", questions);
        }
      }
    }
  );
  socket.on(
    "admin-action",
    async ({ action, questionId, roomId, userId }: any) => {
      const room = await Room.findOne({ roomId }).populate("admin");

      if (!room) {
        socket.emit("Error", "Room not found");
        return;
      }
      console.log(String(room.admin._id), "===", userId);
      if (String(room.admin._id) !== userId) {
        socket.emit("error", "You are not the admin of this room");
        return;
      }
      if (action === "answered" || action === "remove") {
        await Question.findByIdAndDelete(questionId);
        io.emit(
          action === "answered" ? "question-answered" : "question-removed",
          questionId
        );
      }
    }
  );
  socket.on("remove-all", async () => {
    await Question.deleteMany({});
    io.emit("all-questions-removed");
  });
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

//MIDDLEWARE
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

//ROUTES
app.post("/register", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    const user = new User({ email, password, username });
    await user.save();
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
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
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Error logging in user" });
  }
});
app.post(
  "/create-room",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { password } = req.body;
    const userId = (req as any).user.userId;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const roomId = uuidv4();

      const newRoom = new Room({
        roomId,
        password: hashedPassword,
        admin: userId,
      });

      await newRoom.save();

      res.status(201).json({ roomId, message: "Room created successfully" });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ message: "Error creating room" });
    }
  }
);
app.post("/join-room", async (req: Request, res: Response) => {
  const { roomId, password } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid room credentials" });
    }

    res.status(200).json({ message: "Joined room successfully", roomId });
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ message: "Error joining room" });
  }
});
app.delete("/room/:roomId", authMiddleware, async (req, res) => {
  const { roomId } = req.params;
  const userId = (req as any).user.userId;

  try {
    const room = await Room.findOne({ roomId: roomId });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.admin.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You are not authorized to close this room" });
    }

    await Room.deleteOne({ roomId: roomId });

    return res.status(200).json({ message: "Room closed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get(
  "/user-profile",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error fetching user profile" });
    }
  }
);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
