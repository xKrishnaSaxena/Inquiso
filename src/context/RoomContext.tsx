import axios from "axios";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

interface RoomContextType {
  roomId: string | null;
  setRoomId: (roomId: string) => void;
  handleJoinRoom: (
    e: React.FormEvent,
    password: string,
    roomIdbyUser: string
  ) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleRoomCreation: (e: React.FormEvent, password: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [roomId, setRoomId] = useState<string | null>(
    localStorage.getItem("roomId")
  );
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const handleRoomCreation = async (e: React.FormEvent, password: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://ec2-15-206-89-86.ap-south-1.compute.amazonaws.com:3000/create-room",
        {
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const roomId = response.data.roomId;
      setRoomId(roomId);
      localStorage.setItem("roomId", roomId);
      console.log(response.data.message);
      console.log("Room ID:", response.data.roomId);
      navigate(`/admin/${roomId}`);
    } catch (error: any) {
      console.error(
        "Error creating room:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };
  const handleJoinRoom = async (
    e: React.FormEvent,
    password: string,
    roomIdbyUser: string
  ) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://ec2-15-206-89-86.ap-south-1.compute.amazonaws.com:3000/join-room",
        {
          roomId: roomIdbyUser,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.message);
      console.log("Room ID:", response.data.roomId);
      setRoomId(roomIdbyUser);
      localStorage.setItem("roomId", roomIdbyUser);
      navigate(`/user/${roomId}`);
    } catch (error: any) {
      console.error(
        "Error creating room:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoomContext.Provider
      value={{
        roomId,
        setRoomId,
        handleJoinRoom,
        loading,
        setLoading,
        handleRoomCreation,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
};
