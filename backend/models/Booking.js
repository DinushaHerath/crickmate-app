const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Reference to ground
  groundId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ground',
    required: true
  },
  
  // Reference to ground owner
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Customer details
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  
  // Payment
  paymentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Time slot - can be either string (Morning/Afternoon/Evening) or object with start/end times
  timeSlot: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Booking date
  bookingDate: {
    type: Date,
    required: true
  },
  
  // Status: pending, confirmed, cancelled, completed
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Notes (optional)
  notes: {
    type: String,
    trim: true
  },
  
  // Booked by: owner or player
  bookedBy: {
    type: String,
    enum: ['owner', 'player'],
    required: true
  },
  
  // Player ID (if booked by player)
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
}, { timestamps: true });

// Index for faster queries
bookingSchema.index({ groundId: 1, bookingDate: 1 });
bookingSchema.index({ ownerId: 1, bookingDate: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
