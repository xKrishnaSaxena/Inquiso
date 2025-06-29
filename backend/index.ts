import express, { Request, Response, NextFunction } from "express";
import { Server } from "socket.io";
import mongoose from "mongoose";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Room from "./models/Room";
import Question from "./models/Question";
import User from "./models/User";
import { Post } from "./models/Post";
import { Comment } from "./models/Post";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
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
    origin: ["https://inquiso.onrender.com", "http://localhost:5173"],
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
  socket.on("close-room", async (roomId: string) => {
    const room = await Room.findOne({ roomId });
    if (!room) {
      socket.emit("error", { message: "Room not found or has been deleted" });
      return;
    }

    io.to(roomId).emit("room-closed");

    await Room.findOneAndDelete({ roomId });

    socket.leave(roomId);
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

app.get("/", (req, res) => {
  res.send("Hello from Express and WebSocket Server!");
});

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

//Post Routes
app.post("/posts", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { content, title, section } = req.body;
    const userId = (req as any).user.userId;
    const newPost = new Post({
      user: userId,
      content,
      title,
      section,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create post" });
  }
});
app.get("/posts/:section", async (req: Request, res: Response) => {
  try {
    const sectionParam = req.params.section;
    const posts = await Post.find({ section: sectionParam })
      .populate("user", "username")
      .sort({
        votes: -1,
        createdAt: -1,
      });

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await Comment.find({
          postId: post._id,
          parentId: null,
        }).populate("user", "username");

        const commentsWithReplies = await Promise.all(
          comments.map(async (comment) => {
            const replies = await Comment.find({
              parentId: comment._id,
            }).populate("user", "username");
            return { comment, replies };
          })
        );

        return { ...post.toObject(), comments: commentsWithReplies };
      })
    );

    res.status(200).json(postsWithComments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
app.delete(
  "/posts/:id",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      if (post.user.toString() !== (req as any).user.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await post.deleteOne();
      res.status(200).json({ message: "Post deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  }
);
app.patch(
  "/posts/:id/upvote",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      if (post.upvotedBy.includes((req as any).user.userId)) {
        return res.status(400).json({ error: "Already upvoted" });
      }

      post.votes += 1;
      post.upvotedBy.push((req as any).user.userId);
      await post.save();

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to upvote post" });
    }
  }
);
app.post(
  "/posts/:id/comments",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      const post = await Post.findById(req.params.id);
      const userId = (req as any).user.userId;
      if (!post) return res.status(404).json({ error: "Post not found" });

      const newComment = new Comment({
        postId: req.params.id,
        user: userId,
        description,
        parentId: null,
      });

      await newComment.save();

      res.status(201).json(newComment);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);
app.get("/posts/:postId/comments", async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find({
      postId: req.params.postId,
    })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    const commentWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .populate("user", "username")
          .sort({ createdAt: -1 });
        return { comment, replies };
      })
    );

    res.status(200).json(commentWithReplies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      if (comment.user.toString() !== (req as any).user.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await Comment.deleteOne({ _id: req.params.commentId });
      res.status(200).json({ message: "Comment deleted" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);
app.put(
  "/posts/:postId/comments/:commentId/upvote",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const comment = await Comment.findById(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      if (comment.upvotedBy.includes((req as any).user.userId)) {
        return res.status(400).json({ error: "Already upvoted" });
      }

      comment.votes += 1;
      comment.upvotedBy.push((req as any).user.userId);

      await comment.save();
      res.status(200).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to upvote comment" });
    }
  }
);
// Reply to a comment
app.post(
  "/posts/:postId/comments/:commentId/reply",
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ error: "Post not found" });
      const userId = (req as any).user.userId;

      const parentComment = await Comment.findById(req.params.commentId);
      if (!parentComment)
        return res.status(404).json({ error: "Comment not found" });

      const newReply = new Comment({
        postId: req.params.postId,
        parentId: req.params.commentId,
        user: userId,
        description,
      });

      await newReply.save();

      res.status(201).json({ message: "Reply added successfully", newReply });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add reply" });
    }
  }
);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
