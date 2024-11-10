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
  MessageSquareIcon,
  ShareIcon,
  TrashIcon,
  PlusIcon,
} from "lucide-react";
import { IComment, IPost } from "@/types";
import { usePost } from "../context/PostContext";
import { useUser } from "../context/UserContext";
import Spinner from "@/components/ui/Spinner";

const sections = ["web3", "dev", "devops"];

export default function PostPage() {
  const { posts, fetchPosts, createPost, deletePost } = usePost();
  const { user } = useUser();
  const [selectedSection, setSelectedSection] = useState("web3");

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
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Posts</h1>
          {user && <CreatePostDialog onCreatePost={handleCreatePost} />}
        </div>
        <Tabs
          defaultValue="web3"
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
              <div className="space-y-4 mt-6">
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
  const { upvotePost, addComment, loading } = usePost();

  const { user } = useUser();
  const votes = post.votes;

  const [newComment, setNewComment] = useState("");
  const createdAt = new Date(post.createdAt);
  const username = post.user?.username;
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
        postId: post._id,
        parentId: null,
        votes: 0,
        user: user,
        upvotedBy: [],
        createdAt: new Date(),
      };
      addComment(post._id, newCommentObj);
      setNewComment("");
    }
  };

  return loading ? (
    <Spinner />
  ) : (
    <Card className="w-full ">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold ">
              {post.title}
            </CardTitle>
            <span className=" text-sm text-gray-600">
              {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
            </span>
          </div>
          <span className="font-medium">Author: {username}</span>
        </div>
      </CardHeader>
      <CardContent className="leading-relaxed">
        <p>{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleUpvote}>
              <ArrowUpIcon className="h-4 w-4" />
            </Button>
            <span>{votes}</span>
          </div>
          <Button variant="ghost" size="sm">
            <MessageSquareIcon className="h-4 w-4 mr-2" />
            {post.comments ? <> {post.comments.length}</> : <>0</>}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <ShareIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(post._id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-full space-y-2">
          {post.comments &&
            post.comments.map(({ comment, replies }) => (
              <CommentCard
                post={post}
                key={comment._id}
                comment={comment}
                replies={replies}
              />
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

function CommentCard({
  comment,
  replies,
  post,
}: {
  post: IPost;
  comment: IComment;
  replies: IComment[];
}) {
  const votes = comment.votes;
  const [newReply, setNewReply] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { user } = useUser();
  const username = comment.user?.username;

  const createdAt = new Date(comment.createdAt);
  const handleUpvote = () => upvoteComment(post._id, comment._id);
  const { upvoteComment, addReply, deleteComment } = usePost();
  const handleAddReply = () => {
    if (newReply.trim()) {
      const newReplyObj: IComment = {
        _id: `r${Date.now()}`,
        description: newReply,
        postId: post._id,
        parentId: comment._id,
        votes: 0,
        user: user,
        upvotedBy: [],
        createdAt: new Date(),
      };
      addReply(post._id, comment._id, newReplyObj);
      setNewReply("");
      setShowReplyInput(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="flex justify-between">
          <p className="font-semibold">{username}</p>
          <span className="text-gray-600">
            {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
          </span>
        </div>

        <p className="mt-2">{comment.description}</p>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteComment(post._id, comment._id)}
          >
            <TrashIcon className="h-4 w-4" />
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
          {replies &&
            replies.map((reply) => (
              <CommentReplyCard post={post} key={reply._id} comment={reply} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
function CommentReplyCard({
  comment,
  post,
}: {
  post: IPost;
  comment: IComment;
}) {
  const votes = comment.votes;

  const username = comment.user?.username;

  const createdAt = new Date(comment.createdAt);
  const handleUpvote = () => upvoteComment(post._id, comment._id);
  const { upvoteComment, deleteComment } = usePost();

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="flex justify-between">
          <p className="font-semibold">{username}</p>
          <span className="text-gray-600">
            {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
          </span>
        </div>

        <p className="mt-2">{comment.description}</p>
        <div className="flex items-center space-x-2 mt-2">
          <Button variant="ghost" size="sm" onClick={handleUpvote}>
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
          <span>{votes}</span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteComment(post._id, comment._id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
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
  const [section, setSection] = useState("web3");
  const [isOpen, setIsOpen] = useState(false);
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
        section,
        comments: [],
      };
      onCreatePost(newPost);
      setTitle("");
      setContent("");
      setSection(section);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
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
