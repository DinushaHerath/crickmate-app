const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['upcoming', 'past', 'available'],
    required: true
  },
  team1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  team2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  groundName: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  village: {
    type: String,
    required: true
  },
  team1PlayersId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  team2PlayersId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matchType: {
    type: String,
    enum: ['T20', 'ODI', 'Test', 'Other'],
    required: true
  },
  team1Score: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 }
  },
  team2Score: {
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 }
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', MatchSchema);
