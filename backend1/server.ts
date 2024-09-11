import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import mongoose, { Document, Schema } from "mongoose";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";

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
  created_at: Date;
}

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  userName: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [String],
  created_at: { type: Date, default: Date.now },
});

const Question = mongoose.model<IQuestion>("Question", questionSchema);

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
      const questions = await Question.find({}).sort({
        votes: -1,
        created_at: -1,
      });
      io.emit("load-questions", questions);
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
        const questions = await Question.find({}).sort({ votes: -1 });
        io.emit("load-questions", questions);
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
