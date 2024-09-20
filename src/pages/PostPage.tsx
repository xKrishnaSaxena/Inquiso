import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MessageSquareIcon,
  ShareIcon,
  TrashIcon,
  PlusIcon,
} from "lucide-react";

const sections = ["Web3", "WebDev", "DevOps"];

interface Comment {
  id: string;
  content: string;
  author: string;
  votes: number;
  replies: Comment[];
}

interface Post {
  id: string;
  title: string;
  content: string;
  votes: number;
  comments: Comment[];
  section: string;
}

const dummyPosts: Post[] = [
  {
    id: "1",
    title: "Understanding Blockchain",
    content: "Blockchain is a decentralized...",
    votes: 10,
    comments: [
      {
        id: "c1",
        content: "Great explanation!",
        author: "user1",
        votes: 5,
        replies: [
          {
            id: "c1r1",
            content: "Thanks! Glad you found it helpful.",
            author: "OP",
            votes: 2,
            replies: [],
          },
        ],
      },
      {
        id: "c2",
        content: "Could you elaborate on smart contracts?",
        author: "user2",
        votes: 3,
        replies: [],
      },
    ],
    section: "Web3",
  },
  {
    id: "2",
    title: "React Hooks Explained",
    content: "Hooks are a new addition in React...",
    votes: 15,
    comments: [
      {
        id: "c3",
        content: "useState is my favorite!",
        author: "user3",
        votes: 7,
        replies: [],
      },
    ],
    section: "WebDev",
  },
  {
    id: "3",
    title: "Kubernetes Best Practices",
    content: "When working with Kubernetes...",
    votes: 12,
    comments: [],
    section: "DevOps",
  },
];

export default function PostPage() {
  const [posts, setPosts] = useState(dummyPosts);

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <CreatePostDialog onCreatePost={handleCreatePost} />
      </div>
      <Tabs defaultValue="Web3" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {sections.map((section) => (
            <TabsTrigger key={section} value={section}>
              {section}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent key={section} value={section}>
            <div className="space-y-4">
              {posts
                .filter((post) => post.section === section)
                .map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function PostCard({
  post,
  onDelete,
}: {
  post: Post;
  onDelete: (postId: string) => void;
}) {
  const [votes, setVotes] = useState(post.votes);
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState("");

  const handleUpvote = () => setVotes(votes + 1);
  const handleDownvote = () => setVotes(votes - 1);
  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: `c${Date.now()}`,
        content: newComment,
        author: "currentUser",
        votes: 0,
        replies: [],
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex justify-between w-full mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleUpvote}>
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
            <span>{votes}</span>
            <Button variant="ghost" size="sm" onClick={handleDownvote}>
              <ArrowDownIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            {comments.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <ShareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(post.id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-full space-y-2">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
        <div className="flex w-full mt-4">
          <Input
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleAddComment}>Comment</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  const [votes, setVotes] = useState(comment.votes);
  const [replies, setReplies] = useState(comment.replies);
  const [newReply, setNewReply] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleUpvote = () => setVotes(votes + 1);
  const handleDownvote = () => setVotes(votes - 1);

  const handleAddReply = () => {
    if (newReply.trim()) {
      const newReplyObj: Comment = {
        id: `r${Date.now()}`,
        content: newReply,
        author: "currentUser",
        votes: 0,
        replies: [],
      };
      setReplies([...replies, newReplyObj]);
      setNewReply("");
      setShowReplyInput(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <p className="font-semibold">{comment.author}</p>
        <p>{comment.content}</p>
        <div className="flex items-center space-x-2 mt-2">
          <Button variant="ghost" size="sm" onClick={handleUpvote}>
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
          <span>{votes}</span>
          <Button variant="ghost" size="sm" onClick={handleDownvote}>
            <ArrowDownIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            Reply
          </Button>
        </div>
        {showReplyInput && (
          <div className="flex mt-2">
            <Input
              placeholder="Write a reply..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              className="mr-2"
            />
            <Button onClick={handleAddReply}>Reply</Button>
          </div>
        )}
        <div className="ml-4 mt-2 space-y-2">
          {replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreatePostDialog({
  onCreatePost,
}: {
  onCreatePost: (post: Post) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState("Web3");

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      const newPost: Post = {
        id: `p${Date.now()}`,
        title,
        content,
        votes: 0,
        comments: [],
        section,
      };
      onCreatePost(newPost);
      setTitle("");
      setContent("");
      setSection("Web3");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {sections.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button onClick={handleSubmit}>Create Post</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
