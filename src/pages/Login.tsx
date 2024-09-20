import { useUser } from "@/context/UserContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 dark:text-gray-100">
        Inquiso
      </h1>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => navigate("/user-register")}
          className="px-6 py-3 rounded-md bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 shadow transition-all duration-300"
        >
          Register as User
        </button>
        <button
          onClick={() => navigate("/user-login")}
          className="px-6 py-3 rounded-md bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 shadow transition-all duration-300"
        >
          Login as User
        </button>
      </div>
    </div>
  );
};

export default Login;
