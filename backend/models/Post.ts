import mongoose, { Schema } from "mongoose";
import { IComment, IPost } from "./../types";
enum Section {
  Web3 = "web3",
  Dev = "dev",
  DevOps = "devops",
}

const CommentSchema: Schema<IComment> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  reply: [{ type: Schema.Types.Mixed }],
});

const PostSchema: Schema<IPost> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  section: { type: String, enum: Object.values(Section), required: true },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: CommentSchema }],
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
