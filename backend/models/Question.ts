import mongoose, { Schema } from "mongoose";
import { IQuestion } from "../types";

const questionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  userName: { type: String, required: true },
  votes: { type: Number, default: 0 },
  upvotedBy: [String],
  created_at: { type: Date, default: Date.now },
  roomId: { type: String, required: true },
});
const Question = mongoose.model<IQuestion>("Question", questionSchema);
export default Question;
