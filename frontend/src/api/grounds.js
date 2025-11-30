import axiosInstance from '../config/axios';
import { API_BASE_URL } from '../config/api';

const GROUNDS_API_URL = `${API_BASE_URL}/api/grounds`;

// Get ground owner's ground profile
export const getMyGround = async (token) => {
  try {
    const response = await axiosInstance.get(`${GROUNDS_API_URL}/my-ground`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ground:', error.response?.data || error.message);
    throw error;
  }
};

// Create or update ground profile
export const saveGroundProfile = async (groundData, token) => {
  try {
    const response = await axios.post(`${GROUNDS_API_URL}/profile`, groundData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving ground:', error.response?.data || error.message);
    throw error;
  }
};

// Initial ground setup during signup
export const initialGroundSetup = async (groundName, token) => {
  try {
    const response = await axios.post(
      `${GROUNDS_API_URL}/initial-setup`, 
      { groundName },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error in initial setup:', error.response?.data || error.message);
    throw error;
  }
};

// Search grounds
export const searchGrounds = async (filters) => {
  try {
    const response = await axios.get(`${GROUNDS_API_URL}/search`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching grounds:', error.response?.data || error.message);
    throw error;
  }
};

// Get ground by ID
export const getGroundById = async (groundId) => {
  try {
    const response = await axios.get(`${GROUNDS_API_URL}/${groundId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ground:', error.response?.data || error.message);
    throw error;
  }
};
