import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuestionFormProps {
  onSubmit: (questionText: string) => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ onSubmit }) => {
  const [questionText, setQuestionText] = useState<string>("");
  const questionInputRef = useRef<HTMLInputElement | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = () => {
    if (questionText.trim()) {
      onSubmit(questionText);
      setQuestionText("");
      handleDisabled();
      questionInputRef.current?.focus();
    }
  };
  const handleDisabled = () => {
    setIsDisabled(true);
    localStorage.setItem("isDisabled", "true");
    setTimeout(() => {
      setIsDisabled(false);
      localStorage.setItem("isDisabled", "false");
    }, 30000);
  };
  useEffect(() => {
    const storedIsDisabled = localStorage.getItem("isDisabled");
    if (storedIsDisabled === "true") {
      setIsDisabled(true);
    }
  }, []);

  return (
    <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg transition-all duration-300">
      <Input
        ref={questionInputRef}
        placeholder="Ask your question"
        disabled={isDisabled}
        title={
          isDisabled ? `Please wait 30 seconds to ask the question again` : ""
        }
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        className="mb-4 w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 transition-all duration-300"
      />
      <Button
        onClick={handleSubmit}
        disabled={isDisabled}
        className="w-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-300"
      >
        Post Question
      </Button>
    </div>
  );
};

export default QuestionForm;
