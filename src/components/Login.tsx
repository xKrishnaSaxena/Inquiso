import React from "react";

interface LoginProps {
  onLogin: (userType: "user" | "admin") => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
        Login
      </h1>
      <div className="flex space-x-4">
        <button
          onClick={() => onLogin("user")}
          className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Login as User
        </button>
        <button
          onClick={() => onLogin("admin")}
          className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Login as Admin
        </button>
      </div>
    </div>
  );
};

export default Login;
