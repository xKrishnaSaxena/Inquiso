import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "../components/ui/Spinner";

import { useRoom } from "@/context/RoomContext";

const JoinRoom: React.FC = () => {
  const [password, setPassword] = useState("");
  const [roomId, setRoomId] = useState("");
  const { handleJoinRoom, loading } = useRoom();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      {loading ? (
        <Spinner />
      ) : (
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              Join A Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinRoom(e, password, roomId);
              }}
            >
              <Input
                placeholder="Room Id"
                type="id"
                value={roomId}
                required
                onChange={(e) => setRoomId(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md transition-all duration-200"
              />
              <Input
                placeholder="password"
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md transition-all duration-200"
              />

              <Button
                type="submit"
                className="w-full py-2 rounded-md text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Join
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JoinRoom;
