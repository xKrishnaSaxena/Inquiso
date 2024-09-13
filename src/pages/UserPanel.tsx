import React from "react";
import QuestionForm from "../components/QuestionForm";
import QuestionList from "../components/QuestionList";
import { Question } from "@/types";

interface UserPanelProps {
  userName: string;
  questions: Question[];
  onSubmitQuestion: (questionText: string) => void;
  onUpvote: (id: string, userName: string) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({
  userName,
  questions,
  onSubmitQuestion,
  onUpvote,
}) => {
  return (
    <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg transition-all duration-300">
      <h1 className="text-3xl font-bold mb-6 text-black dark:text-white">
        Welcome, {userName}
      </h1>
      <div className="mb-6">
        <QuestionForm onSubmit={onSubmitQuestion} />
      </div>
      <QuestionList
        questions={questions}
        userName={userName}
        onUpvote={onUpvote}
      />
    </div>
  );
};

export default UserPanel;
