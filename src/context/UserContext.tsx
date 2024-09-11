// src/context/UserContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Define the shape of UserContext
interface User {
  email: string;
  role: "user" | "admin";
}

interface UserContextType {
  user: User | null;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// UserProvider component to fetch and store user details
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const response = await axios.get("/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  const value = {
    user,
    fetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
