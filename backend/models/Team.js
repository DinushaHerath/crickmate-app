const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  teamMembersId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  captain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  winMatches: {
    type: Number,
    default: 0
  },
  matchesPlayed: {
    type: Number,
    default: 0
  },
  teamType: {
    type: String,
    enum: ['casual', 'club', 'professional'],
    default: 'casual'
  },
  logo: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', TeamSchema);
