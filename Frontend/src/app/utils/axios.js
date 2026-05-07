import axios from "axios";

// Get API base URL from environment variables or use default
const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true, // Enable cookies
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state if needed
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
