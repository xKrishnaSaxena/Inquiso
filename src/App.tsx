import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { Input } from "./components/ui/input";

interface Question {
  _id: string;
  text: string;
  userName: string;
  votes: number;
}

interface AdminAction {
  action: "answered" | "remove";
  questionId: string;
}

const socket: Socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const questionInputRef = useRef<HTMLInputElement | null>(null);

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
  }, []);

  const handleSubmit = () => {
    if (questionText.trim() && userName.trim()) {
      socket.emit("new-question", { text: questionText, userName });
      setQuestionText("");
      questionInputRef.current?.focus();
    }
  };

  const handleUpvote = (id: string, userName: string) => {
    socket.emit("upvote-question", id, userName);
  };

  const handleAdminAction = (id: string, action: AdminAction["action"]) => {
    socket.emit("admin-action", { action, questionId: id });
  };

  const handleRemoveAll = () => {
    socket.emit("remove-all");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-4">Realtime Q&A App</h1>
        <div className="mb-6">
          <Input
            ref={questionInputRef}
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mb-2"
          />
          <Input
            placeholder="Ask your question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleSubmit}>Post Question</Button>
        </div>
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question._id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{question.userName}</p>
                  <p>{question.text}</p>
                </div>
                <div className="flex items-center">
                  <Button
                    onClick={() => handleUpvote(question._id, userName)}
                    className="mr-2"
                  >
                    Upvote ({question.votes})
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleAdminAction(question._id, "answered")}
                  >
                    Mark as Answered
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="destructive" onClick={handleRemoveAll}>
            Remove All Questions (Admin)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
