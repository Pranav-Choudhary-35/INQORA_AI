import { io } from "socket.io-client";

// Get socket URL from environment variables or use default
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

// Create socket instance with proper configuration
export const socket = io(SOCKET_URL, {
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
});

export default socket;
