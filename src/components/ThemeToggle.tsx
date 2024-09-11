import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Button } from "@/components/ui/button";

const ThemeToggle: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className="absolute top-4 right-4 p-2 border border-black rounded bg-white dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </Button>
  );
};

export default ThemeToggle;
