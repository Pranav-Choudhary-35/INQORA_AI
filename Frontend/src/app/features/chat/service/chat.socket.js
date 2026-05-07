import socket from "../../../utils/socket.js";

export const initializeSocketConnection = () => {
  socket.on("connect", () => {
    console.log("✓ Connected to Socket.IO server");
  });

  socket.on("disconnect", () => {
    console.log("✗ Disconnected from Socket.IO server");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};