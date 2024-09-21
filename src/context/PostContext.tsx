import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { IPost, IComment } from "@/types";

interface PostContextType {
  posts: IPost[];
  fetchPosts: (section: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  createPost: (
    content: string,
    title: string,
    section: string
  ) => Promise<void>;
  upvotePost: (id: string) => Promise<void>;
  addComment: (postId: string, commentData: Partial<IComment>) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  upvoteComment: (postId: string, commentId: string) => Promise<void>;
  addReply: (
    postId: string,
    commentId: string,
    replyData: Partial<IComment>
  ) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<IPost[]>([]);
  useEffect(() => {
    fetchPosts("web3"); // Replace "defaultSection" with your default section
  }, []);
  const fetchPosts = async (section: string) => {
    try {
      const response = await axios.get(`/posts/${section}`);
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };
  const createPost = async (
    content: string,
    title: string,
    section: string
  ) => {
    try {
      const response = await axios.post(`/posts`, { content, title, section });
      setPosts((prevPosts) => [response.data, ...prevPosts]);
    } catch (error) {
      console.error("Failed to create post", error);
    }
  };

  // Delete a post
  const deletePost = async (id: string) => {
    try {
      await axios.delete(`/posts/${id}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  // Upvote a post
  const upvotePost = async (id: string) => {
    try {
      const response = await axios.put(`/posts/${id}/upvote`);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id ? { ...post, votes: response.data.votes } : post
        )
      );
    } catch (error) {
      console.error("Failed to upvote post", error);
    }
  };

  // Add a comment to a post
  const addComment = async (postId: string, commentData: Partial<IComment>) => {
    try {
      const response = await axios.post(
        `/posts/${postId}/comments`,
        commentData
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  // Delete a comment from a post
  const deleteComment = async (postId: string, commentId: string) => {
    try {
      const response = await axios.delete(
        `/posts/${postId}/comments/${commentId}`
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to delete comment", error);
    }
  };

  // Upvote a comment on a post
  const upvoteComment = async (postId: string, commentId: string) => {
    try {
      const response = await axios.put(
        `/posts/${postId}/comments/${commentId}/upvote`
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: response.data.comments }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to upvote comment", error);
    }
  };

  // Add a reply to a comment
  const addReply = async (
    postId: string,
    commentId: string,
    replyData: Partial<IComment>
  ) => {
    try {
      const response = await axios.post(
        `/posts/${postId}/comments/${commentId}/reply`,
        replyData
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment._id === commentId ? response.data.comment : comment
                ),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Failed to add reply", error);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        fetchPosts,
        deletePost,
        createPost,
        upvotePost,
        addComment,
        deleteComment,
        upvoteComment,
        addReply,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

// Custom hook to use the Post context
export const usePost = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};
