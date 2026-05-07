import "dotenv/config";
import app from "./src/app.js";
import http from "http";
import connectDB from "./src/config/database.js";
import { initSocket } from "./src/sockets/server.socket.js";

// Environment variables validation
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "NODE_ENV",
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
  process.exit(1);
}

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || "development";

const httpServer = http.createServer(app);

initSocket(httpServer);

// Connect to MongoDB
connectDB()
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

const server = httpServer.listen(PORT, () => {
  console.log(
    `✓ Server running on port ${PORT} in ${NODE_ENV} mode`
  );
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log("✓ HTTP server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});