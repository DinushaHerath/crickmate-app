import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const PROFILE_API_URL = `${API_BASE_URL}/api/profile`;

export const getMyProfile = async (token) => {
  try {
    console.log('========== PROFILE API CALL ==========');
    console.log('URL:', `${PROFILE_API_URL}/me`);
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    
    const response = await axios.get(
      `${PROFILE_API_URL}/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Profile API SUCCESS:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('========== PROFILE API ERROR ==========');
    console.error('Error:', error.message);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    throw error;
  }
};

export const updateProfile = async (profileData, token) => {
  try {
    console.log('========== UPDATE PROFILE API CALL ==========');
    console.log('URL:', `${PROFILE_API_URL}/update`);
    console.log('Data:', profileData);
    
    const response = await axios.put(
      `${PROFILE_API_URL}/update`,
      profileData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Update profile SUCCESS:', response.status);
    return response.data;
  } catch (error) {
    console.error('========== UPDATE PROFILE API ERROR ==========');
    console.error('Error:', error.message);
    console.error('Response:', error.response?.data);
    throw error;
  }
};
