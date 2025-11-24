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
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('CrickMate API running'));

// Import routes (will create later)
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
