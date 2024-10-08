import { createContext, useState, useContext, ReactNode } from "react";
import axios from "axios";

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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [loading, setLoading] = useState(false);

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://inquiso-backend.onrender.com/register",
        {
          email,
          password,
          username,
        }
      );
      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);
      setLoading(false);
    } catch (error) {
      console.error("Error registering:", error);
      setLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        "https://inquiso-backend.onrender.com/login",
        {
          email,
          password,
        }
      );
      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);
      setLoading(false);
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem("token");
    setToken(null);
    setLoading(false);
  };

  const value = {
    token,
    register,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
