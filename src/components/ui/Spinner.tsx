import { useTheme } from "@/context/ThemeContext";

export default function Spinner() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex items-center justify-center ${
        darkMode ? "bg-black bg-opacity-50" : "bg-white bg-opacity-50"
      }`}
    >
      <div
        className={`loader ${darkMode ? "loader-dark" : "loader-light"}`}
      ></div>
    </div>
  );
}
