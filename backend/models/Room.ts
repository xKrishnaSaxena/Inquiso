import mongoose, { Schema } from "mongoose";
import { IRoom } from "../types";

const roomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true },
  password: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
});
const Room = mongoose.model<IRoom>("Room", roomSchema);
export default Room;
