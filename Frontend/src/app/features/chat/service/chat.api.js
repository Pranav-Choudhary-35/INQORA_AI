import apiClient from "../../../utils/axios.js";

export const sendMessage = async ({ message, chatId }) => {
  try {
    const response = await apiClient.post("/api/chats/message", {
      message,
      chat: chatId,
    });
    return response.data;
  } catch (error) {
    console.error("Send message error:", error);
    throw error.response?.data || new Error("Failed to send message");
  }
};

export const getChats = async () => {
  try {
    const response = await apiClient.get("/api/chats");
    return response.data;
  } catch (error) {
    console.error("Get chats error:", error);
    throw error.response?.data || new Error("Failed to fetch chats");
  }
};

export const getMessages = async (chatId, page = 1, limit = 50) => {
  try {
    const response = await apiClient.get(`/api/chats/${chatId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Get messages error:", error);
    throw error.response?.data || new Error("Failed to fetch messages");
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await apiClient.delete(`/api/chats/delete/${chatId}`);
    return response.data;
  } catch (error) {
    console.error("Delete chat error:", error);
    throw error.response?.data || new Error("Failed to delete chat");
  }
};
