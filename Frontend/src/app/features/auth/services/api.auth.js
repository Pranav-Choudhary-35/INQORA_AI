import apiClient from "../../../utils/axios.js";

export async function register({ email, username, password }) {
  try {
    const response = await apiClient.post("/api/auth/register", {
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
        "Registration failed"
    );
  }
}

export async function login({ email, password }) {
  try {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || new Error("Login failed");
  }
}

export async function logout() {
  try {
    const response = await apiClient.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error.response?.data || new Error("Logout failed");
  }
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get("/api/auth/get-me");
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error.response?.data || new Error("Failed to fetch user");
  }
}

export async function checkVerified(email) {
  try {
    const response = await apiClient.get("/api/auth/check-verified", {
      params: { email },
    });
    return response.data;
  } catch (error) {
    console.error("Check verified error:", error);
    throw error.response?.data || new Error("Failed to check verification");
  }
}
