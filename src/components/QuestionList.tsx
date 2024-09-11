import React from "react";
import { Button } from "@/components/ui/button";
import { Question } from "@/types";

interface QuestionListProps {
  questions: Question[];
  userName: string;
  onUpvote: (id: string, userName: string) => void;
  onAdminAction?: (id: string, action: "answered" | "remove") => void;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  userName,
  onUpvote,
  onAdminAction,
}) => {
  return (
    <div className="space-y-6">
      {questions.map((question) => (
        <div
          key={question._id}
          className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-black dark:text-white  ">
                {question.text}
              </p>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {question.userName}
              </p>
            </div>
            <div className="flex space-x-2 items-center">
              <Button
                onClick={() => onUpvote(question._id, userName)}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white transition-all duration-300"
              >
                Upvote ({question.votes})
              </Button>
              {onAdminAction && (
                <>
                  <Button
                    variant="destructive"
                    className="bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                    onClick={() => onAdminAction(question._id, "answered")}
                  >
                    Mark as Answered
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-500 text-white hover:bg-red-600 transition-all duration-300"
                    onClick={() => onAdminAction(question._id, "remove")}
                  >
                    Remove
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
