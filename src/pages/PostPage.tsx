import { useState, useEffect } from "react";
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
import { IComment, IPost } from "@/types";
import { usePost } from "../context/PostContext";
import { useUser } from "../context/UserContext";

const sections = ["web", "dev", "devops"];

export default function PostPage() {
  const { posts, fetchPosts, createPost, deletePost } = usePost();
  const [selectedSection, setSelectedSection] = useState("Web3");

  useEffect(() => {
    fetchPosts(selectedSection);
  }, [selectedSection]);

  const handleCreatePost = async (newPost: IPost) => {
    await createPost(newPost.content, newPost.title, newPost.section);
  };

  const handleDeletePost = async (postId: string) => {
    await deletePost(postId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <CreatePostDialog onCreatePost={handleCreatePost} />
      </div>
      <Tabs
        defaultValue="Web3"
        className="w-full"
        onValueChange={setSelectedSection}
      >
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
                    key={post._id}
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
  post: IPost;
  onDelete: (postId: string) => void;
}) {
  const { upvotePost, addComment } = usePost();
  const { user } = useUser();
  const votes = post.votes;
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState("");

  const handleUpvote = () => upvotePost(post._id);
  const handleShare = () => {
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: IComment = {
        _id: `c${Date.now()}`,
        description: newComment,
        votes: 0,
        user: user,
        upvotedBy: [],
        createdAt: new Date(),
        reply: [],
      };
      addComment(post._id, newCommentObj);
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
            <span>{votes}</span>\
          </div>
          <Button variant="ghost" size="sm">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            {comments.length}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <ShareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(post._id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-full space-y-2">
          {comments.map((comment) => (
            <CommentCard post={post} key={comment._id} comment={comment} />
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

function CommentCard({ post, comment }: { post: IPost; comment: IComment }) {
  const votes = comment.votes;
  const [replies, setReplies] = useState(comment.reply);
  const [newReply, setNewReply] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { user } = useUser();
  const handleUpvote = () => upvoteComment(post._id, comment._id);
  const { upvoteComment, addReply } = usePost();
  const handleAddReply = () => {
    if (newReply.trim()) {
      const newReplyObj: IComment = {
        _id: `r${Date.now()}`,
        description: newReply,
        votes: 0,
        user: user,
        upvotedBy: [],
        createdAt: new Date(),
        reply: [],
      };
      addReply(post._id, comment._id, newReplyObj);
      setReplies([...replies, newReplyObj]);
      setNewReply("");
      setShowReplyInput(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <p className="font-semibold">{comment.user?.username}</p>
        <p>{comment.description}</p>
        <div className="flex items-center space-x-2 mt-2">
          <Button variant="ghost" size="sm" onClick={handleUpvote}>
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
          <span>{votes}</span>

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
            <CommentCard post={post} key={reply._id} comment={reply} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CreatePostDialog({
  onCreatePost,
}: {
  onCreatePost: (post: IPost) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState("Web3");
  const { user } = useUser();
  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      const newPost: IPost = {
        _id: `p${Date.now()}`,
        title,
        content,
        user: user,
        votes: 0,
        upvotedBy: [],
        createdAt: new Date(),
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
