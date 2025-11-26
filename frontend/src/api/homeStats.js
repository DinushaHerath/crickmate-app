import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const getHomeStats = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/home-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching home stats:', error.response?.data || error.message);
    throw error;
  }
};
