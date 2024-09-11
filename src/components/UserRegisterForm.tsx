import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UserRegisterForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register(email, password, userName); // Call the register function
      navigate("/user-login"); // Redirect to login after successful registration
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <h1 className="text-4xl font-bold mb-8 text-black dark:text-white">
        Register
      </h1>
      <form className="flex flex-col space-y-4 w-80" onSubmit={handleRegister}>
        <Input
          placeholder="Username"
          value={userName}
          required
          onChange={(e) => setUserName(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg"
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg"
        />
        <Input
          placeholder="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg"
        />
        <Button
          type="submit"
          className="bg-black text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all duration-300"
        >
          Register
        </Button>
      </form>
    </div>
  );
};

export default UserRegisterForm;
