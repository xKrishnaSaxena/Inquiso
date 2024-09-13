import React from "react";
import QuestionList from "../components/QuestionList";
import { Button } from "@/components/ui/button";
import { Question } from "@/types";

interface AdminPanelProps {
  questions: Question[];
  onAdminAction: (id: string, action: "answered" | "remove") => void;
  onRemoveAll: () => void;
  onCloseRoom: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  questions,
  onAdminAction,
  onRemoveAll,
  onCloseRoom,
}) => {
  return (
    <div className="p-6 bg-white dark:bg-black text-black dark:text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <QuestionList
        questions={questions}
        userName=""
        onUpvote={() => {}}
        onAdminAction={onAdminAction}
      />
      <div className="mt-6">
        <Button
          variant="destructive"
          className="bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
          onClick={onRemoveAll}
        >
          Remove All Questions
        </Button>
        <Button
          variant="destructive"
          className="bg-red-500 text-white hover:bg-red-600 transition-all duration-300 ml-5"
          onClick={onCloseRoom}
        >
          Close Room
        </Button>
      </div>
    </div>
  );
};

export default AdminPanel;