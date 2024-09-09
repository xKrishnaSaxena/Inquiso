import express from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const app = express();

dotenv.config();

app.use(cors());

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

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userName: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [String],
});

const Question = mongoose.model("Question", questionSchema);

io.on("connection", async (socket) => {
  console.log("A user connected");

  try {
    const questions = await Question.find({});
    socket.emit("load-questions", questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
  }

  socket.on("new-question", async (data) => {
    const question = new Question({ text: data.text, userName: data.userName });
    await question.save();
    io.emit("question-posted", question);
  });

  socket.on("upvote-question", async (questionId, userName) => {
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
      }
    }
  });

  socket.on("admin-action", async ({ action, questionId }) => {
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
