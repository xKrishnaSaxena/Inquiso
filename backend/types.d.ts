export interface IQuestion extends Document {
  text: string;
  userName: string;
  votes: number;
  upvotedBy: string[];
  created_at: Date;
  roomId: string;
}
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

export interface IRoom extends Document {
  roomId: string;
  password: string;
  admin: mongoose.Schema.Types.ObjectId;
}
