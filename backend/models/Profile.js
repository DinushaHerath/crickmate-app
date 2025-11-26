const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age: {
    type: Number,
    min: 10,
    max: 100
  },
  playerRole: {
    type: String,
    enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-keeper', 'Fielder'],
    required: true
  },
  battingStyle: {
    type: String,
    enum: ['Right-hand', 'Left-hand']
  },
  bowlingStyle: {
    type: String,
    enum: ['Right-arm fast', 'Left-arm fast', 'Right-arm medium', 'Left-arm medium', 'Off-spin', 'Leg-spin', 'None']
  },
  // Match references
  matchesPlayed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }],
  // Statistics
  totalMatches: {
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
  totalCatches: {
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
  // Calculated stats
  battingAverage: {
    type: Number,
    default: 0
  },
  strikeRate: {
    type: Number,
    default: 0
  },
  bowlingAverage: {
    type: Number,
    default: 0
  },
  economy: {
    type: Number,
    default: 0
  },
  // Achievements
  achievements: [{
    title: String,
    description: String,
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match'
    },
    date: Date
  }],
  // Photos (Cloudinary URLs)
  photos: [{
    url: String,
    publicId: String,
    caption: String
  }],
  bio: {
    type: String,
    maxlength: 500
  },
  jerseyNumber: {
    type: Number,
    min: 1,
    max: 99
  }
}, {
  timestamps: true
});

// Method to calculate batting average
ProfileSchema.methods.calculateBattingAverage = function() {
  if (this.totalMatches === 0) return 0;
  return (this.totalRuns / this.totalMatches).toFixed(2);
};

// Method to calculate strike rate (runs per 100 balls)
ProfileSchema.methods.calculateStrikeRate = function() {
  // This would need balls faced data
  // For now, return stored value
  return this.strikeRate;
};

module.exports = mongoose.model('Profile', ProfileSchema);
