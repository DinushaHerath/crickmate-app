/**
 * Mock Data for CrickMate App
 * Frontend-only development data
 */

export const MOCK_TEAMS = [
  {
    id: '1',
    name: 'Thunder Strikers',
    logo: '⚡',
    members: 12,
    matches: 25,
    wins: 18,
    losses: 7,
    captain: 'John Player',
    district: 'Colombo',
  },
  {
    id: '2',
    name: 'Royal Warriors',
    logo: '👑',
    members: 15,
    matches: 30,
    wins: 22,
    losses: 8,
    captain: 'Mike Champion',
    district: 'Kandy',
  },
  {
    id: '3',
    name: 'Phoenix Blazers',
    logo: '🔥',
    members: 11,
    matches: 20,
    wins: 14,
    losses: 6,
    captain: 'Alex Knight',
    district: 'Galle',
  },
];

export const MOCK_MATCHES = [
  {
    id: '1',
    team1: 'Thunder Strikers',
    team2: 'Royal Warriors',
    date: '2024-02-15',
    time: '09:00 AM',
    ground: 'Green Field Stadium',
    status: 'upcoming',
    type: 'T20',
  },
  {
    id: '2',
    team1: 'Phoenix Blazers',
    team2: 'Thunder Strikers',
    date: '2024-02-10',
    time: '02:00 PM',
    ground: 'City Cricket Ground',
    status: 'completed',
    type: 'One Day',
    winner: 'Phoenix Blazers',
    score1: '185/8',
    score2: '160/10',
  },
  {
    id: '3',
    team1: 'Royal Warriors',
    team2: 'Phoenix Blazers',
    date: '2024-02-20',
    time: '10:00 AM',
    ground: 'Kings Park Ground',
    status: 'upcoming',
    type: 'T20',
  },
  {
    id: '4',
    team1: 'Thunder Strikers',
    team2: 'City Champions',
    date: '2024-02-08',
    time: '03:00 PM',
    ground: 'Victory Stadium',
    status: 'completed',
    type: 'T20',
    winner: 'Thunder Strikers',
    score1: '165/5',
    score2: '142/9',
  },
];

export const MOCK_GROUNDS = [
  {
    id: '1',
    name: 'Green Field Stadium',
    address: 'Main Street, Colombo',
    district: 'Colombo',
    capacity: 500,
    facilities: ['Pavilion', 'Parking', 'Lights', 'Scoreboard'],
    pricePerHour: 5000,
    rating: 4.8,
    images: ['https://picsum.photos/400/300?random=1'],
    owner: 'Sarah Owner',
    contact: '+94 77 123 4567',
    available: true,
  },
  {
    id: '2',
    name: 'City Cricket Ground',
    address: 'Lake Road, Kandy',
    district: 'Kandy',
    capacity: 300,
    facilities: ['Pavilion', 'Parking', 'Changing Rooms'],
    pricePerHour: 4000,
    rating: 4.5,
    images: ['https://picsum.photos/400/300?random=2'],
    owner: 'David Manager',
    contact: '+94 77 234 5678',
    available: true,
  },
  {
    id: '3',
    name: 'Kings Park Ground',
    address: 'Beach Road, Galle',
    district: 'Galle',
    capacity: 400,
    facilities: ['Pavilion', 'Lights', 'Scoreboard', 'Canteen'],
    pricePerHour: 4500,
    rating: 4.7,
    images: ['https://picsum.photos/400/300?random=3'],
    owner: 'Kumar Silva',
    contact: '+94 77 345 6789',
    available: true,
  },
  {
    id: '4',
    name: 'Victory Stadium',
    address: 'Hill Street, Colombo',
    district: 'Colombo',
    capacity: 600,
    facilities: ['Pavilion', 'Parking', 'Lights', 'Scoreboard', 'Canteen', 'Medical'],
    pricePerHour: 6000,
    rating: 4.9,
    images: ['https://picsum.photos/400/300?random=4'],
    owner: 'Sarah Owner',
    contact: '+94 77 456 7890',
    available: false,
  },
];

export const MOCK_PLAYERS = [
  {
    id: '1',
    name: 'John Player',
    position: 'Batsman',
    age: 25,
    district: 'Colombo',
    village: 'Dehiwala',
    avatar: 'https://i.pravatar.cc/150?img=12',
    teams: ['Thunder Strikers', 'City Champions'],
    achievements: ['Best Batsman 2024', 'Century Maker', 'Man of the Match x3'],
    stats: {
      matches: 45,
      runs: 1250,
      wickets: 12,
      catches: 18,
      average: 32.5,
      strikeRate: 125.4,
    },
  },
  {
    id: '2',
    name: 'Mike Champion',
    position: 'All-Rounder',
    age: 28,
    district: 'Kandy',
    village: 'Peradeniya',
    avatar: 'https://i.pravatar.cc/150?img=33',
    teams: ['Royal Warriors'],
    achievements: ['All-Rounder of the Year 2023', '5 Wickets in Match', 'Half Century x5'],
    stats: {
      matches: 60,
      runs: 1800,
      wickets: 45,
      catches: 25,
      average: 35.2,
      strikeRate: 130.1,
    },
  },
  {
    id: '3',
    name: 'Alex Knight',
    position: 'Bowler',
    age: 26,
    district: 'Galle',
    village: 'Hikkaduwa',
    avatar: 'https://i.pravatar.cc/150?img=15',
    teams: ['Phoenix Blazers'],
    achievements: ['Best Bowler 2024', 'Hat-trick', '50 Wickets Club'],
    stats: {
      matches: 50,
      runs: 450,
      wickets: 75,
      catches: 12,
      average: 18.5,
      economy: 6.2,
    },
  },
  {
    id: '4',
    name: 'David Silva',
    position: 'Wicket-keeper',
    age: 24,
    district: 'Colombo',
    village: 'Nugegoda',
    avatar: 'https://i.pravatar.cc/150?img=8',
    teams: ['Thunder Strikers'],
    achievements: ['Golden Gloves 2024', '50+ Dismissals'],
    stats: {
      matches: 38,
      runs: 890,
      wickets: 0,
      catches: 42,
      average: 28.7,
      strikeRate: 115.8,
    },
  },
  {
    id: '5',
    name: 'Rajesh Kumar',
    position: 'Batsman',
    age: 27,
    district: 'Kandy',
    village: 'Kandy',
    avatar: 'https://i.pravatar.cc/150?img=25',
    teams: [],
    achievements: ['Rising Star 2023'],
    stats: {
      matches: 22,
      runs: 650,
      wickets: 2,
      catches: 8,
      average: 31.5,
      strikeRate: 128.9,
    },
  },
];

export const MOCK_CHAT_MESSAGES = [
  {
    id: '1',
    teamId: '1',
    teamName: 'Thunder Strikers',
    sender: 'John Player',
    message: 'Great practice session today!',
    timestamp: '2024-02-14 10:30 AM',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '2',
    teamId: '1',
    teamName: 'Thunder Strikers',
    sender: 'Mike Champion',
    message: 'Ready for the match tomorrow?',
    timestamp: '2024-02-14 11:00 AM',
    avatar: 'https://i.pravatar.cc/150?img=33',
  },
  {
    id: '3',
    teamId: '2',
    teamName: 'Royal Warriors',
    sender: 'Alex Knight',
    message: 'New ground booking confirmed!',
    timestamp: '2024-02-14 02:15 PM',
    avatar: 'https://i.pravatar.cc/150?img=15',
  },
];

export const MOCK_BOOKINGS = [
  {
    id: '1',
    groundId: '1',
    groundName: 'Green Field Stadium',
    teamName: 'Thunder Strikers',
    date: '2024-02-15',
    timeSlot: '09:00 AM - 12:00 PM',
    status: 'confirmed',
    price: 15000,
  },
  {
    id: '2',
    groundId: '2',
    groundName: 'City Cricket Ground',
    teamName: 'Royal Warriors',
    date: '2024-02-18',
    timeSlot: '02:00 PM - 05:00 PM',
    status: 'pending',
    price: 12000,
  },
  {
    id: '3',
    groundId: '3',
    groundName: 'Kings Park Ground',
    teamName: 'Phoenix Blazers',
    date: '2024-02-20',
    timeSlot: '10:00 AM - 01:00 PM',
    status: 'confirmed',
    price: 13500,
  },
];

// Helper function to get upcoming matches
export const getUpcomingMatches = () => {
  return MOCK_MATCHES.filter(match => match.status === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Helper function to get completed matches
export const getCompletedMatches = () => {
  return MOCK_MATCHES.filter(match => match.status === 'completed')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Helper function to get available grounds
export const getAvailableGrounds = () => {
  return MOCK_GROUNDS.filter(ground => ground.available)
    .sort((a, b) => b.rating - a.rating);
};

// Helper function to get team messages
export const getTeamMessages = (teamId) => {
  return MOCK_CHAT_MESSAGES.filter(msg => msg.teamId === teamId);
};
