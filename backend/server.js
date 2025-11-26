require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

app.use(cors());
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });
  socket.on('sendMessage', (data) => {
    io.to(data.room).emit('receiveMessage', data);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

// MongoDB connect
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/crickmate';
mongoose.connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('CrickMate API running'));

// Import routes
const authRoutes = require('./routes/auth');
const matchRoutes = require('./routes/matches');
const testRoutes = require('./routes/test');
const teamRoutes = require('./routes/teams');
const matchRequestRoutes = require('./routes/matchRequests');
const profileRoutes = require('./routes/profile');
const teamJoinRequestRoutes = require('./routes/teamJoinRequests');
const homeStatsRoutes = require('./routes/homeStats');
const groundRoutes = require('./routes/grounds');

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/test', testRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/match-requests', matchRequestRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/team-join-requests', teamJoinRequestRoutes);
app.use('/api/home-stats', homeStatsRoutes);
app.use('/api/grounds', groundRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access from device using: http://10.202.222.163:${PORT}`);
});
