# CrickMate App - Setup Complete! 🏏

## Overview
CrickMate is a cricket team management mobile app built with React Native (Expo) and Node.js backend.

## Color Palette ✨
- **Dark Background**: #121212
- **Dark Secondary**: #1F1F1F
- **Sport Green**: #2E7D32
- **Neon Green**: #00E676
- **Neon Yellow**: #FFEA00
- **White**: #FFFFFF

## User Roles 👥

### Players
Can select multiple playing positions:
- 🏏 Batsman
- ⚡ Bowler
- ⭐ All-Rounder
- 🧤 Wicket-keeper
- 🎯 Fielder

### Ground Owners
Manage cricket grounds and bookings

## Features Implemented ✅

### Frontend (React Native)

#### Authentication Flow
- **Landing Screen**: Creative welcome page with app features
- **Sign Up**: Role-based registration
  - Players: Select multiple playing positions, add district/village
  - Ground Owners: Add ground name and address
- **Sign In**: Role-based login with role selection

#### Player Dashboard (Bottom Tabs)
- **Home**: View teams and upcoming matches near location
- **Matches**: Browse and join cricket matches
- **Grounds**: Find cricket grounds nearby
- **Chat**: Team communication
- **Profile**: User profile with stats and settings

#### Ground Owner Dashboard (Bottom Tabs)
- **Dashboard**: Booking statistics and activity
- **Bookings**: Manage ground bookings
- **Profile**: Account management

### Backend (Node.js + Express)

#### Updated User Model
- Role field (player/ground_owner)
- Player-specific: playerRoles array, district, village, teams
- Ground owner-specific: groundName, groundAddress, location coordinates
- Geospatial indexing for location-based queries

#### Authentication API
- `/api/auth/register`: Role-based registration
- `/api/auth/login`: Role-based login with validation

## Project Structure

```
frontend/
├── App.js (Main entry with Redux + Navigation)
├── src/
│   ├── api/
│   │   └── auth.js
│   ├── navigation/
│   │   ├── RootNavigator.js (Role-based routing)
│   │   ├── AuthStack.js (Landing, Login, Register)
│   │   ├── PlayerDashboard.js (5 tabs)
│   │   └── GroundOwnerDashboard.js (3 tabs)
│   ├── screens/
│   │   ├── LandingScreen.js ✨
│   │   ├── LoginScreen.js (with role selection)
│   │   ├── RegisterScreen.js (with role selection)
│   │   ├── PlayerHomeScreen.js (teams + matches)
│   │   ├── MatchesScreen.js
│   │   ├── GroundsScreen.js
│   │   ├── ChatScreen.js
│   │   ├── ProfileScreen.js (role-based display)
│   │   ├── GroundOwnerHomeScreen.js
│   │   └── BookingsScreen.js
│   ├── store/
│   │   ├── index.js (Redux + persist)
│   │   └── slices/
│   │       ├── authSlice.js
│   │       ├── favouritesSlice.js
│   │       └── themeSlice.js
│   └── components/
└── constants/
    └── theme.ts (CrickMate color palette)

backend/
├── server.js (Express + Socket.io + MongoDB)
├── models/
│   └── User.js (Enhanced with roles)
├── routes/
│   └── auth.js (Role-based auth)
└── .env
```

## Next Steps 🚀

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install express mongoose dotenv cors bcryptjs jsonwebtoken socket.io multer
npm install nodemon --save-dev
```

**Frontend:**
```powershell
cd frontend
npm install expo-linear-gradient
```

### 2. Configure Environment

Update `backend/.env`:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_here
PORT=5000
```

### 3. Start Development Servers

**Backend:**
```powershell
cd backend
npm run dev
```

**Frontend:**
```powershell
cd frontend
npx expo start
```

### 4. Testing

**For Android Emulator:**
- API endpoint: `http://10.0.2.2:5000/api`

**For Physical Device:**
- Update `frontend/src/api/auth.js` with your computer's IP address
- Example: `http://192.168.1.10:5000/api`

## Future Enhancements 📋

### Teams Feature
- Create/join teams
- Manage team members (11 players + 1-2 substitutes)
- Assign captain/vice-captain
- Team chat with Socket.io

### Matches Feature
- Browse available matches
- Create match requests
- Location-based match suggestions
- Live match tracking

### Grounds Feature
- Search grounds by location
- View ground details
- Book grounds (for players)
- Manage bookings (for ground owners)

### Additional Features
- Push notifications
- Match statistics tracking
- Player ratings/reviews
- Image upload for avatars and grounds
- Payment integration for bookings
- Weather integration
- Match scheduling calendar

## API Testing

Use these curl commands to test:

**Register as Player:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "password":"password123",
    "role":"player",
    "playerRoles":["batsman","fielder"],
    "district":"Colombo",
    "village":"Dehiwala"
  }'
```

**Register as Ground Owner:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Stadium Manager",
    "email":"stadium@example.com",
    "password":"password123",
    "role":"ground_owner",
    "groundName":"Central Cricket Ground",
    "groundAddress":"123 Main St, Colombo"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"password123",
    "role":"player"
  }'
```

## Git Commits

Recommended commit structure:
```bash
git add .
git commit -m "feat: implement role-based auth and dashboards

- Add landing page with app features
- Implement role-based registration (player/ground owner)
- Create player dashboard with 5 tabs
- Create ground owner dashboard
- Update User model with roles and player positions
- Apply CrickMate color palette
- Add team cards and upcoming matches on player home"
git push
```

---

**Happy Coding! 🎉**
Let me know if you need help implementing any of the future features!
