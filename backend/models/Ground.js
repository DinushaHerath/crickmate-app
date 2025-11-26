const mongoose = require('mongoose');

const groundSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  groundName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  village: {
    type: String,
    trim: true
  },
  contact: {
    phone: String,
    email: String,
    whatsapp: String
  },
  facilities: [{
    type: String
  }],
  pricing: {
    hourlyRate: Number,
    halfDayRate: Number,
    fullDayRate: Number,
    currency: {
      type: String,
      default: 'LKR'
    }
  },
  availability: {
    monday: { open: String, close: String, available: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, available: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, available: { type: Boolean, default: true } },
    thursday: { open: String, close: String, available: { type: Boolean, default: true } },
    friday: { open: String, close: String, available: { type: Boolean, default: true } },
    saturday: { open: String, close: String, available: { type: Boolean, default: true } },
    sunday: { open: String, close: String, available: { type: Boolean, default: true } }
  },
  description: {
    type: String,
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  capacity: {
    type: Number
  },
  pitchType: {
    type: String,
    enum: ['Turf', 'Matting', 'Grass', 'Cement', 'Mixed']
  },
  verified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }]
}, {
  timestamps: true
});

// Index for searching grounds
groundSchema.index({ district: 1, village: 1 });
groundSchema.index({ groundName: 'text', address: 'text', district: 'text' });

module.exports = mongoose.model('Ground', groundSchema);
