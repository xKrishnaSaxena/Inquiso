import mongoose, { Schema } from "mongoose";
import { IComment, IPost } from "./../types";
enum Section {
  Web3 = "web3",
  Dev = "dev",
  DevOps = "devops",
}

const CommentSchema: Schema<IComment> = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const PostSchema: Schema<IPost> = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  section: { type: String, enum: Object.values(Section), required: true },
  upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
});
CommentSchema.index({ postId: 1, parentId: 1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export const Post = mongoose.model<IPost>("Post", PostSchema);
