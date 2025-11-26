import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const TEAMS_API_URL = `${API_BASE_URL}/api/teams`;

export const createTeam = async (teamData, token) => {
  const response = await axios.post(
    `${TEAMS_API_URL}/create`,
    teamData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const getMyTeams = async (token) => {
  const response = await axios.get(
    `${TEAMS_API_URL}/my-teams`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getNearbyPlayers = async (district, token) => {
  const response = await axios.get(
    `${TEAMS_API_URL}/nearby-players`,
    {
      params: { district },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getPlayerProfile = async (userId, token) => {
  const response = await axios.get(
    `${TEAMS_API_URL}/player-profile/${userId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const sendInvitation = async (inviteData, token) => {
  const response = await axios.post(
    `${TEAMS_API_URL}/invite`,
    inviteData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const getInvitations = async (status, token) => {
  const response = await axios.get(
    `${TEAMS_API_URL}/invites`,
    {
      params: status ? { status } : {},
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const acceptInvitation = async (inviteId, token) => {
  const response = await axios.put(
    `${TEAMS_API_URL}/invites/${inviteId}/accept`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const rejectInvitation = async (inviteId, token) => {
  const response = await axios.put(
    `${TEAMS_API_URL}/invites/${inviteId}/reject`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};
