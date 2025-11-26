const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  battingStyle: {
    type: String,
    enum: ['Right-hand', 'Left-hand'],
    default: null
  },
  bowlingStyle: {
    type: String,
    enum: ['Right-arm fast', 'Left-arm fast', 'Right-arm medium', 'Left-arm medium', 'Off-spin', 'Leg-spin', 'None'],
    default: null
  },
  wicketKeeper: {
    type: Boolean,
    default: false
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  totalRuns: {
    type: Number,
    default: 0
  },
  totalWickets: {
    type: Number,
    default: 0
  },
  highestScore: {
    type: Number,
    default: 0
  },
  bestBowling: {
    wickets: { type: Number, default: 0 },
    runs: { type: Number, default: 0 }
  },
  achievements: [{
    title: String,
    description: String,
    date: Date
  }],
  photos: [{
    url: String,
    caption: String
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  jerseyNumber: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);
