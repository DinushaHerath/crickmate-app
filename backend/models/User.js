const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullname: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['player', 'ground_owner'], 
    required: true 
  },
  
  // Player-specific fields
  playerRole: {
    type: String,
    enum: ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-keeper', 'Fielder'],
    required: function() { return this.role === 'player'; }
  },
  district: { 
    type: String,
    required: true
  },
  village: { 
    type: String,
    required: function() { return this.role === 'player'; }
  },
  
  // Ground Owner-specific fields
  grounds: [{
    type: String
  }],
  
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
