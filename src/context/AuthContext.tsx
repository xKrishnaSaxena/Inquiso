import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";
import { User } from "@/types";

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
  user: User | null;
  fetchUserData: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      localStorage.setItem("userId", response.data.id);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUserData();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setUser(null);
    }
  }, [token]);

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/register", {
        email,
        password,
        username,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      setLoading(false);
      // fetchUserData will be triggered by useEffect when token changes
    } catch (error) {
      console.error("Error registering:", error);
      setLoading(false);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem("token", newToken);
      setLoading(false);
      // fetchUserData will be triggered by useEffect when token changes
    } catch (error) {
      console.error("Error logging in:", error);
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setLoading(true);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const value = {
    token,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    loading,
    user,
    fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
