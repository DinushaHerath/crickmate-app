import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const MATCHES_API_URL = `${API_BASE_URL}/api/matches`;

// Get token from storage
const getAuthToken = () => {
  // This will be set from Redux store in the component
  return null;
};

// Get upcoming matches for current user
export const getUpcomingMatches = async (token) => {
  try {
    const response = await axios.get(`${MATCHES_API_URL}/upcoming`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get past matches for current user
export const getPastMatches = async (token) => {
  try {
    const response = await axios.get(`${MATCHES_API_URL}/past`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Update match score and winner
export const updateMatchScore = async (matchId, scoreData, token) => {
  try {
    const response = await axios.put(
      `${MATCHES_API_URL}/${matchId}/score`,
      scoreData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

// Get single match details
export const getMatchDetails = async (matchId, token) => {
  try {
    const response = await axios.get(`${MATCHES_API_URL}/${matchId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  getUpcomingMatches,
  getPastMatches,
  updateMatchScore,
  getMatchDetails
};
