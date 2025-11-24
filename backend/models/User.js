const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Role-based fields
  role: { 
    type: String, 
    enum: ['player', 'ground_owner'], 
    required: true 
  },
  
  // Player-specific fields
  playerRoles: [{
    type: String,
    enum: ['batsman', 'bowler', 'all_rounder', 'wicket_keeper', 'fielder']
  }],
  district: String,
  village: String,
  avatar: String,
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
  
  // Ground Owner-specific fields
  groundName: String,
  groundAddress: String,
  groundLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  
  // Teams the user is part of (for players)
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for geospatial queries
UserSchema.index({ groundLocation: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
