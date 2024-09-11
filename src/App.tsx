import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import ThemeToggle from "./components/ThemeToggle";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import UserLoginForm from "./components/UserLoginForm";
import AdminLoginForm from "./components/AdminLoginForm";
import UserRegisterForm from "./components/UserRegisterForm";
import { ThemeProvider } from "./context/ThemeContext";
import { Question } from "@/types";
import { useAuth } from "./context/AuthContext";
import { useUser } from "./context/UserContext";

const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const App: React.FC = () => {
  const { user } = useUser();
  const { token } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userType, setUserType] = useState<"user" | "admin" | null>(null);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      setUserName(user.username);
    }
  }, [user, token]);

  // WebSocket functions
  useEffect(() => {
    socket.on("load-questions", (questions: Question[]) => {
      setQuestions(questions);
    });

    socket.on("question-posted", (question: Question) => {
      setQuestions((prevQuestions) => [...prevQuestions, question]);
    });

    socket.on("question-updated", (updatedQuestion: Question) => {
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === updatedQuestion._id ? updatedQuestion : q
        )
      );
    });

    socket.on("question-answered", (questionId: string) => {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q._id !== questionId)
      );
    });

    socket.on("question-removed", (questionId: string) => {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q._id !== questionId)
      );
    });

    socket.on("all-questions-removed", () => {
      setQuestions([]);
    });

    return () => {
      socket.off("load-questions");
      socket.off("question-posted");
      socket.off("question-updated");
      socket.off("question-answered");
      socket.off("question-removed");
      socket.off("all-questions-removed");
    };
  }, [socket]);

  const handleSubmitQuestion = (text: string) => {
    socket.emit("new-question", { text, userName });
  };

  const handleUpvote = (id: string) => {
    socket.emit("upvote-question", id, userName);
  };

  const handleAdminAction = (id: string, action: "answered" | "remove") => {
    socket.emit("admin-action", { action, questionId: id });
  };

  const handleRemoveAll = () => {
    socket.emit("remove-all");
  };

  return (
    <ThemeProvider>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/user-login" element={<UserLoginForm />} />
        <Route path="/user-register" element={<UserRegisterForm />} />
        <Route path="/admin-login" element={<AdminLoginForm />} />
        <Route
          path="/user-live"
          element={
            <UserPanel
              userName={userName}
              questions={questions}
              onSubmitQuestion={handleSubmitQuestion}
              onUpvote={handleUpvote}
            />
          }
        />
        <Route
          path="/admin-live"
          element={
            <AdminPanel
              questions={questions}
              onAdminAction={handleAdminAction}
              onRemoveAll={handleRemoveAll}
            />
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
