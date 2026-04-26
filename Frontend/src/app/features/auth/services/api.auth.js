import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function register({ email, username, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      email,
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);

    throw new Error(
      error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Network error",
    );
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error.response ? error.response.data : new Error("Network error");
  }
}
