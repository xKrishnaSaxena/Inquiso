enum Section {
  Web3 = "web3",
  Dev = "dev",
  DevOps = "devops",
}

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
  postId: mongoose.Schema.Types.ObjectId;
  parentId: mongoose.Schema.Types.ObjectId | null;
  user: mongoose.Schema.Types.ObjectId;
  description: string;
  votes: number;
  upvotedBy: string[];
  createdAt: Date;
}

export interface IPost extends Document {
  user: mongoose.Schema.Types.ObjectId;
  content: string;
  title: string;
  createdAt: Date;
  section: Section;
  votes: number;
  upvotedBy: string[];
}
