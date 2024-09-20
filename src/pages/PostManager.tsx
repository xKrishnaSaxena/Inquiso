import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
// import { useTheme } from "next-themes";
import { ArrowUpIcon } from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { PostList } from "./PostList";

interface Post {
  _id: string;
  title: string;
  content: string;
  votes: number;
  comments: Comment[];
}

interface Comment {
  _id: string;
  description: string;
  votes: number;
  reply: Comment[];
}

const PostManager = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  console.log(posts);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    section: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get("/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handlePostCreate = async () => {
    try {
      await axios.post("/posts", newPost);
      toast.success("Post created successfully!");
      setIsModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post.");
    }
  };

  // const handlePostDelete = async (postId: string) => {
  //   try {
  //     await axios.delete(`/posts/${postId}`);
  //     toast.success("Post deleted successfully!");
  //     fetchPosts();
  //   } catch (error) {
  //     console.error("Error deleting post:", error);
  //     toast.error("Failed to delete post.");
  //   }
  // };

  // const handleUpvotePost = async (postId: string) => {
  //   try {
  //     await axios.put(`/posts/${postId}/upvote`);
  //     fetchPosts();
  //   } catch (error) {
  //     console.error("Error upvoting post:", error);
  //     toast.error("Failed to upvote post.");
  //   }
  // };

  // const handleSharePost = (postId: string) => {
  //   const postUrl = `${window.location.origin}/posts/${postId}`;
  //   navigator.clipboard.writeText(postUrl);
  //   toast.success("Post URL copied to clipboard!");
  // };

  // const toggleTheme = () => {
  //   setTheme(theme === "light" ? "dark" : "light");
  // };

  return (
    <div className="container mx-auto p-4">
      <Button className="mb-4" onClick={() => setIsModalOpen(true)}>
        Add New Post
      </Button>

      {/* Add Post Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>Create a New Post</DialogHeader>
          <Input
            className="mb-2"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <Input
            placeholder="Content"
            value={newPost.content}
            onChange={(e) =>
              setNewPost({ ...newPost, content: e.target.value })
            }
          />
          <Input
            placeholder="Section"
            value={newPost.section}
            onChange={(e) =>
              setNewPost({ ...newPost, section: e.target.value })
            }
          />
          <DialogFooter>
            <Button onClick={handlePostCreate}>Submit</Button>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PostList />
    </div>
  );
};

const CommentSection = ({
  postId,
  comments,
}: {
  postId: string;
  comments: Comment[];
}) => {
  const [newComment, setNewComment] = useState("");

  const handleCommentCreate = async () => {
    try {
      await axios.post(`/posts/${postId}/comments`, {
        description: newComment,
      });
      setNewComment("");
      // fetch comments again if necessary
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    try {
      await axios.put(`/posts/${postId}/comments/${commentId}/upvote`);
      // fetch comments again if necessary
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold">Comments</h4>
      <ul className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <li className="py-4 flex justify-between items-center">
            <div className="flex justify-between">
              <p>{comment.description}</p>
              <Button onClick={() => handleUpvoteComment(comment._id)}>
                <ArrowUpIcon className="w-5 h-5 mr-2" />
                {comment.votes}
              </Button>
            </div>
            {comment.reply && comment.reply.length > 0 && (
              <div className="pl-4">
                <CommentSection postId={postId} comments={comment.reply} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add Comment Input */}
      <div className="mt-4 flex">
        <Input
          placeholder="Add a comment"
          value={newComment}
          onChange={(e: any) => setNewComment(e.target.value)}
          className="flex-1"
        />
        <Button className="ml-2" onClick={handleCommentCreate}>
          Comment
        </Button>
      </div>
    </div>
  );
};

export default PostManager;
