/**
 * Authentication API - DUMMY DATA VERSION
 * Using mock data for frontend development
 */

// Dummy users database
const MOCK_USERS = {
  player: {
    id: '1',
    email: 'player@test.com',
    role: 'player',
    name: 'John Player',
    position: 'Batsman',
    age: 25,
    experience: '5 years',
    avatar: 'https://i.pravatar.cc/150?img=12',
    teams: ['Team A', 'Team B'],
    stats: {
      matches: 45,
      runs: 1250,
      wickets: 12,
      catches: 18
    }
  },
  groundOwner: {
    id: '2',
    email: 'owner@test.com',
    role: 'groundOwner',
    name: 'Sarah Owner',
    grounds: ['Green Field Stadium', 'City Cricket Ground'],
    totalBookings: 156,
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?img=32'
  }
};

// Simulate API delay
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Login API
export const login = async (payload) => {
  await delay();
  
  const { email, password, role } = payload;
  
  // Simple mock validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // Return mock user based on role
  const user = role === 'player' ? MOCK_USERS.player : MOCK_USERS.groundOwner;
  
  return {
    data: {
      user: {
        ...user,
        email: email // Use provided email
      },
      token: 'mock_jwt_token_' + Date.now()
    }
  };
};

// Register API
export const register = async (payload) => {
  await delay();
  
  const { email, password, role, name } = payload;
  
  // Simple validation
  if (!email || !password || !role || !name) {
    throw new Error('All fields are required');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // Create new mock user
  const baseUser = role === 'player' ? MOCK_USERS.player : MOCK_USERS.groundOwner;
  
  const newUser = {
    ...baseUser,
    id: 'new_' + Date.now(),
    email: email,
    name: name,
    ...(role === 'player' && payload.position && { position: payload.position }),
    ...(role === 'player' && payload.age && { age: payload.age })
  };
  
  return {
    data: {
      user: newUser,
      token: 'mock_jwt_token_' + Date.now()
    }
  };
};

// Logout (no-op for dummy data)
export const logout = async () => {
  await delay(300);
  return { data: { message: 'Logged out successfully' } };
};

export default {
  login,
  register,
  logout
};

