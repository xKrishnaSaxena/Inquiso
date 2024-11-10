import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { User } from "@/types";

interface UserContextType {
  user: User | null;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);
  const fetchUserData = async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        "http://ec2-15-206-89-86.ap-south-1.compute.amazonaws.com:3000/user-profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      localStorage.setItem("userId", response.data.id);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const value = {
    user,
    fetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
