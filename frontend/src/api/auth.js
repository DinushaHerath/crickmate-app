import axios from 'axios';

// For Android emulator use 10.0.2.2
// For physical device, replace with your computer's IP address (e.g., http://192.168.1.10:5000/api)
const API = axios.create({ 
  baseURL: 'http://10.0.2.2:5000/api' 
});

export const login = (payload) => API.post('/auth/login', payload);
export const register = (payload) => API.post('/auth/register', payload);
