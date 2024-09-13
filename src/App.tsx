import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ThemeToggle from "./components/ThemeToggle";
import AdminPanel from "./pages/AdminPanel";
import UserPanel from "./pages/UserPanel";
import UserLoginForm from "./pages/UserLoginForm";
import AdminLoginForm from "./pages/AdminLoginForm";
import UserRegisterForm from "./pages/UserRegisterForm";
import { ThemeProvider } from "./context/ThemeContext";
import { Question } from "@/types";
import { useUser } from "./context/UserContext";
import RoomCreation from "./pages/RoomCreation";
import JoinRoom from "./pages/JoinRoom";
import Dashboard from "./pages/Dashboard";
import { useRoom } from "./context/RoomContext";

const token = localStorage.getItem("token");
const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"],
  auth: {
    token,
  },
});

const App: React.FC = () => {
  const { user } = useUser();
  const { roomId } = useRoom();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      setUserName(user.username);
    }
  }, [user, token]);

  useEffect(() => {
    if (roomId) {
      socket.emit("join-room-socket", roomId);
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
    }
  }, [roomId]);

  const handleSubmitQuestion = (text: string) => {
    if (roomId) {
      socket.emit("new-question", { text, userName, roomId });
    }
  };
  const handleUpvote = (id: string) => {
    console.log("question id ->", id);
    if (roomId) {
      socket.emit("upvote-question", id, userName, roomId);
    }
  };
  const handleAdminAction = (_id: string, action: "answered" | "remove") => {
    if (roomId) {
      socket.emit("admin-action", {
        action,
        questionId: _id,
        roomId,
        userId: user?._id,
      });
    }
  };
  const handleRemoveAll = () => {
    if (roomId) {
      socket.emit("remove-all", { roomId });
    }
  };
  const handleCloseRoom = async () => {
    try {
      const response = await fetch(`http://localhost:3000/room/${roomId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        alert("Room closed successfully.");
        navigate("/dashboard");
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error closing room:", error);
      alert("Failed to close room.");
    }
  };

  return (
    <ThemeProvider>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard username={userName} />} />
        <Route path="/user-login" element={<UserLoginForm />} />
        <Route path="/user-register" element={<UserRegisterForm />} />
        <Route path="/admin-login" element={<AdminLoginForm />} />
        <Route path="/room-create" element={<RoomCreation />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route
          path="/user/:roomId"
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
          path="/admin/:roomId"
          element={
            <AdminPanel
              questions={questions}
              onAdminAction={handleAdminAction}
              onRemoveAll={handleRemoveAll}
              onCloseRoom={handleCloseRoom}
            />
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
