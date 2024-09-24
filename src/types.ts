export interface Question {
  _id: string;
  text: string;
  userName: string;
  votes: number;
}

export interface User {
  _id: string;
  email?: string;
  username: string;
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

export interface IComment {
  _id: string;
  postId: string;
  parentId: string | null;
  user: User | null;
  description: string;
  votes: number;
  upvotedBy: string[];
  createdAt: Date;
  replies?: IComment[];
}

export interface IPost {
  _id: string;
  user: User | null;
  section: string;
  title: string;
  content: string;
  votes: number;
  upvotedBy: string[];
  createdAt: Date;
  comments: {
    comment: IComment;
    replies: IComment[];
  }[];
}
