import React from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
        Login
      </h1>
      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/user-register")}
          className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Register as User
        </button>
        <button
          onClick={() => navigate("/user-login")}
          className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Login as User
        </button>

        <button
          onClick={() => navigate("/admin-login")}
          className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
};

export default Login;
