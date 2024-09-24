import { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { IPost, IComment } from "@/types";
import { useAuth } from "./AuthContext";
interface PostContextType {
  posts: IPost[];
  comments: IComment[] | null;
  replies: IComment[] | null;
  fetchPosts: (section: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  fetchComments: (postId: string) => Promise<void>;
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
  loading: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<IComment[] | null>([]);

  const [replies, setReplies] = useState<IComment[] | null>([]);
  const [posts, setPosts] = useState<IPost[]>([]);

  const fetchPosts = async (section: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/posts/${section}`
      );

      const posts = response.data;

      const allComments: IComment[] = [];
      const allReplies: IComment[] = [];

      posts.forEach((post: IPost) => {
        post.comments.forEach((comment) => {
          allComments.push(comment.comment);
          comment.replies.forEach((reply) => {
            allReplies.push(reply);
          });
        });
      });

      setPosts(posts);
      setComments(allComments);
      setReplies(allReplies);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch posts", error);
      setLoading(false);
    }
  };

  const createPost = async (
    content: string,
    title: string,
    section: string
  ) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `http://localhost:3000/posts`,
        {
          content,
          title,
          section,
        },
        { headers }
      );
      setPosts((prevPosts) => [response.data, ...prevPosts]);
      fetchPosts(section);
      setLoading(false);
    } catch (error) {
      console.error("Failed to create post", error);
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`http://localhost:3000/posts/${id}`, { headers });
      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
      setLoading(false);
    } catch (error) {
      console.error("Failed to delete post", error);
      setLoading(false);
    }
  };

  const upvotePost = async (id: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.patch(
        `http://localhost:3000/posts/${id}/upvote`,
        {},
        { headers }
      );
      console.log(response.data);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === id ? { ...post, votes: response.data.votes } : post
        )
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to upvote post", error);
      setLoading(false);
    }
  };

  const addComment = async (postId: string, commentData: Partial<IComment>) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `http://localhost:3000/posts/${postId}/comments`,
        commentData,
        { headers }
      );

      const newComment = response.data;

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  { comment: newComment, replies: [] },
                ],
              }
            : post
        )
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to add comment", error);
      setLoading(false);
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(
        `http://localhost:3000/posts/${postId}/comments/${commentId}`,
        { headers }
      );
      fetchComments(postId);
      setLoading(false);
    } catch (error) {
      console.error("Failed to delete comment", error);
      setLoading(false);
    }
  };

  const upvoteComment = async (postId: string, commentId: string) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `http://localhost:3000/posts/${postId}/comments/${commentId}/upvote`,
        {},
        { headers }
      );
      fetchComments(postId);
      setLoading(false);
    } catch (error) {
      console.error("Failed to upvote comment", error);
      setLoading(false);
    }
  };
  const fetchComments = async (postId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/posts/${postId}/comments`
      );

      const commentsData = response.data;
      const allReplies = commentsData.flatMap(
        (comment: IComment) => comment.replies
      );

      setComments(commentsData);
      setReplies(allReplies);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch comments", error);
      setLoading(false);
    }
  };

  const addReply = async (
    postId: string,
    commentId: string,
    replyData: Partial<IComment>
  ) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `http://localhost:3000/posts/${postId}/comments/${commentId}/reply`,
        replyData,
        { headers }
      );

      const newReply = response.data;

      // Update the replies within the comment
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.comment._id === commentId
                    ? { ...comment, replies: [...comment.replies, newReply] }
                    : comment
                ),
              }
            : post
        )
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to add reply", error);
      setLoading(false);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        comments,
        replies,
        fetchPosts,
        loading,
        deletePost,
        fetchComments,
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

export const usePost = (): PostContextType => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePost must be used within a PostProvider");
  }
  return context;
};
