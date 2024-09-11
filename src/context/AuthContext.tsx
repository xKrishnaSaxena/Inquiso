import React, { createContext, useState, useContext, ReactNode } from "react";
import axios from "axios";

// Define the shape of our AuthContext
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  register: (
    email: string,
    password: string,
    userName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider component to wrap around parts of the app that need authentication
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  // Register user and store token in localStorage
  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      const response = await axios.post("http://localhost:4000/register", {
        email,
        password,
        username,
      });
      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error registering:", error);
      throw error;
    }
  };

  // Login user and store token in localStorage
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("http://localhost:4000/login", {
        email,
        password,
      });
      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const value = {
    token,
    register,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
