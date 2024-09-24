import { useTheme } from "@/context/ThemeContext";

export default function Spinner() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`bg flex items-center justify-center min-h-screen ${
        darkMode ? "bg-black" : "bg-white"
      }`}
    >
      <div
        className={`loader ${darkMode ? "loader-dark" : "loader-light"}`}
      ></div>
    </div>
  );
}
