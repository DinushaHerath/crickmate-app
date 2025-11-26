import axios from 'axios';
import { AUTH_API_URL } from '../config/api';

// Base URL for your backend API
const API_URL = AUTH_API_URL;

// Login API
export const login = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/login`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// Register API
export const register = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/register`, payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  return { data: { message: 'Logged out successfully' } };
};

export default {
  login,
  register,
  logout
};


