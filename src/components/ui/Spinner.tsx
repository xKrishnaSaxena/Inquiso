import { useTheme } from "@/context/ThemeContext";

export default function Spinner() {
  const { darkMode } = useTheme();

  return (
    <div className="flex items-center justify-center">
      {darkMode ? (
        <div>
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
        </div>
      ) : (
        <div>
          <div className="block_light"></div>
          <div className="block_light"></div>
          <div className="block_light"></div>
        </div>
      )}
    </div>
  );
}
