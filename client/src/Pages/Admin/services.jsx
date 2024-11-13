// services/apiService.js
import axios from "axios";

const API_URL = "http://localhost:8000/api"; // Replace with your actual API endpoint

export const apiService = {
  getStatistics: async () => {
    console.log(token);
    const response = await axios.get(`${API_URL}/statistics`, {
      withCredentials: true,
    });
    return response.data;
  },
  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getAllGroups: async () => {
    const response = await axios.get(`${API_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getAllMeetings: async () => {
    const response = await axios.get(`${API_URL}/meetings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getActivityLogs: async () => {
    const response = await axios.get(`${API_URL}/activity-logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  deleteUser: async (userId) => {
    await axios.delete(`${API_URL}/users/${userId}`);
  },
  deleteGroup: async (groupId) => {
    await axios.delete(`${API_URL}/groups/${groupId}`);
  },
  // Add more API calls as needed
};
