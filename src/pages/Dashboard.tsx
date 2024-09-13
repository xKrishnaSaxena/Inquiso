import React from "react";
import { useNavigate } from "react-router-dom";
interface DashboardProps {
  username: string;
}
const Dashboard: React.FC<DashboardProps> = ({ username }) => {
  const navigate = useNavigate();

  if (!username) {
    return;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        Hello , {username}
      </h1>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => navigate("/room-create")}
          className="px-6 py-3 rounded-md bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 shadow transition-all duration-300"
        >
          Create A Room
        </button>
        <button
          onClick={() => navigate("/join-room")}
          className="px-6 py-3 rounded-md bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 shadow transition-all duration-300"
        >
          Join A Room
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
