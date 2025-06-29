import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { RoomProvider } from "./context/RoomContext";
import { PostProvider } from "./context/PostContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <PostProvider>
        <Router>
          <RoomProvider>
            <App />
          </RoomProvider>
        </Router>
      </PostProvider>
    </AuthProvider>
  </React.StrictMode>
);
