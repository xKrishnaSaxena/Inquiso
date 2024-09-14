import mongoose, { Schema } from "mongoose";
import { IComment, IPost } from "../types";

const CommentSchema: Schema<IComment> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  reply: [{ type: Schema.Types.Mixed }],
  file: { type: String },
});

const PostSchema: Schema<IPost> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: CommentSchema }],
  file: { type: String },
});

export const Post = mongoose.model<IPost>("Post", PostSchema);
