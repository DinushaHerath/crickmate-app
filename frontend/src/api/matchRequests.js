import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const MATCH_REQUESTS_API_URL = `${API_BASE_URL}/api/match-requests`;

export const getAvailableTeams = async (token) => {
  const response = await axios.get(
    `${MATCH_REQUESTS_API_URL}/available-teams`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const sendMatchRequest = async (requestData, token) => {
  const response = await axios.post(
    `${MATCH_REQUESTS_API_URL}/send-request`,
    requestData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const getMatchRequests = async (type, token) => {
  const response = await axios.get(
    `${MATCH_REQUESTS_API_URL}/requests`,
    {
      params: type ? { type } : {},
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const acceptMatchRequest = async (requestId, responseMessage, token) => {
  const response = await axios.put(
    `${MATCH_REQUESTS_API_URL}/requests/${requestId}/accept`,
    { responseMessage },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const rejectMatchRequest = async (requestId, responseMessage, token) => {
  const response = await axios.put(
    `${MATCH_REQUESTS_API_URL}/requests/${requestId}/reject`,
    { responseMessage },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const cancelMatchRequest = async (requestId, token) => {
  const response = await axios.delete(
    `${MATCH_REQUESTS_API_URL}/requests/${requestId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};
