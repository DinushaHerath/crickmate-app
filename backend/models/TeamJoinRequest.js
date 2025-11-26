const mongoose = require('mongoose');

const teamJoinRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
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
  }
}, {
  timestamps: true
});

// Index for faster queries
teamJoinRequestSchema.index({ userId: 1, status: 1 });
teamJoinRequestSchema.index({ teamId: 1, status: 1 });

module.exports = mongoose.model('TeamJoinRequest', teamJoinRequestSchema);
