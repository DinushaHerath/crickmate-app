const mongoose = require('mongoose');

const MatchRequestSchema = new mongoose.Schema({
  // Team that sent the request
  requestingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  // Team that received the request
  receivingTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  // User who created the request (captain of requesting team)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Match details
  proposedDate: {
    type: Date,
    required: true
  },
  proposedTime: {
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
  matchType: {
    type: String,
    enum: ['T20', 'ODI', '10-Over', 'Test'],
    required: true
  },
  // Status of the request
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  // Optional message
  message: {
    type: String,
    maxlength: 500
  },
  // Response details
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  responseMessage: {
    type: String,
    maxlength: 500
  },
  // Created match reference (when accepted)
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match'
  }
}, {
  timestamps: true
});

// Index for faster queries
MatchRequestSchema.index({ requestingTeam: 1, status: 1 });
MatchRequestSchema.index({ receivingTeam: 1, status: 1 });
MatchRequestSchema.index({ status: 1, proposedDate: 1 });

module.exports = mongoose.model('MatchRequest', MatchRequestSchema);
