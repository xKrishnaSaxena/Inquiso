import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { UserProvider } from "./context/UserContext";
import { RoomProvider } from "./context/RoomContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <Router>
          <RoomProvider>
            <App />
          </RoomProvider>
        </Router>
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
);
