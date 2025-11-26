import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const TEAM_JOIN_API_URL = `${API_BASE_URL}/api/team-join-requests`;

export const getAvailableTeamsToJoin = async (district, token) => {
  const params = district ? { district } : {};
  const response = await axios.get(`${TEAM_JOIN_API_URL}/available`, {
    params,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const sendJoinRequest = async (teamId, message, token) => {
  const response = await axios.post(
    `${TEAM_JOIN_API_URL}/send`,
    { teamId, message },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getMyJoinRequests = async (token) => {
  const response = await axios.get(`${TEAM_JOIN_API_URL}/my-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const getTeamJoinRequests = async (token) => {
  const response = await axios.get(`${TEAM_JOIN_API_URL}/team-requests`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const acceptJoinRequest = async (requestId, responseMessage, token) => {
  const response = await axios.put(
    `${TEAM_JOIN_API_URL}/accept/${requestId}`,
    { responseMessage },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const rejectJoinRequest = async (requestId, responseMessage, token) => {
  const response = await axios.put(
    `${TEAM_JOIN_API_URL}/reject/${requestId}`,
    { responseMessage },
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const cancelJoinRequest = async (requestId, token) => {
  const response = await axios.delete(`${TEAM_JOIN_API_URL}/cancel/${requestId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};
