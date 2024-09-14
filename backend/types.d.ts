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
export interface IComment extends Document {
  user: mongoose.Schema.Types.ObjectId;
  description: string;
  votes: number;
  upvotedBy: string[];
  createdAt: Date;
  reply: IComment[];
  file?: string;
}
export interface IPost extends Document {
  user: mongoose.Schema.Types.ObjectId;
  content: string;
  title: string;
  createdAt: Date;
  votes: number;
  upvotedBy: string[];
  comments: IComment[];
  file: string;
}
