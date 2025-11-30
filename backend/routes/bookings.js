const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const auth = require('../middleware/auth');

// Create a new booking
router.post('/create', auth, async (req, res) => {
  try {
    const { groundId, customerName, mobile, paymentAmount, timeSlot, bookingDate, notes } = req.body;
    
    console.log('Creating booking with data:', req.body);
    
    // Validate required fields
    if (!groundId || !customerName || !mobile || !paymentAmount || !timeSlot || !bookingDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Verify ground belongs to the user
    const ground = await Ground.findOne({ _id: groundId, ownerId: req.user.id });
    if (!ground) {
      return res.status(403).json({ 
        success: false, 
        message: 'Ground not found or unauthorized' 
      });
    }
    
    // Create booking
    const initialStatus = Number(paymentAmount) > 0 ? 'completed' : 'pending';
    const booking = new Booking({
      groundId,
      ownerId: req.user.id,
      customerName,
      mobile,
      paymentAmount,
      timeSlot,
      bookingDate: new Date(bookingDate),
      status: initialStatus,
      notes
    });
    
    await booking.save();
    
    console.log('Booking created successfully:', booking._id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Booking created successfully',
      booking 
    });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update booking details (edit)
router.put('/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { customerName, mobile, paymentAmount, timeSlot, bookingDate, notes, status } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, ownerId: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    if (customerName !== undefined) booking.customerName = customerName;
    if (mobile !== undefined) booking.mobile = mobile;
    if (paymentAmount !== undefined) booking.paymentAmount = paymentAmount;
    if (timeSlot !== undefined) booking.timeSlot = timeSlot;
    if (bookingDate !== undefined) booking.bookingDate = new Date(bookingDate);
    if (notes !== undefined) booking.notes = notes;

    // Auto-status logic: if paymentAmount > 0 and not cancelled, set completed
    if (status !== undefined) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      booking.status = status;
    } else {
      if (Number(booking.paymentAmount) > 0 && booking.status !== 'cancelled') {
        booking.status = 'completed';
      } else if (!booking.paymentAmount || Number(booking.paymentAmount) === 0) {
        booking.status = 'pending';
      }
    }

    await booking.save();

    res.json({ success: true, message: 'Booking updated', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all bookings for a ground
router.get('/ground/:groundId', auth, async (req, res) => {
  try {
    const { groundId } = req.params;
    
    // Verify ground belongs to the user
    const ground = await Ground.findOne({ _id: groundId, ownerId: req.user.id });
    if (!ground) {
      return res.status(403).json({ 
        success: false, 
        message: 'Ground not found or unauthorized' 
      });
    }
    
    const bookings = await Booking.find({ groundId })
      .sort({ bookingDate: 1, 'timeSlot.start': 1 });
    
    res.json({ 
      success: true, 
      bookings 
    });
    
  } catch (error) {
    console.error('Error fetching ground bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get bookings by date for owner's ground
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    
    // Get owner's ground
    const ground = await Ground.findOne({ ownerId: req.user.id });
    if (!ground) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ground not found' 
      });
    }
    
    // Parse date and get bookings for that day
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const bookings = await Booking.find({
      groundId: ground._id,
      bookingDate: {
        $gte: bookingDate,
        $lt: nextDay
      }
    }).sort({ 'timeSlot.start': 1 });
    
    console.log(`Found ${bookings.length} bookings for date ${date}`);
    
    res.json({ 
      success: true, 
      bookings,
      date: bookingDate
    });
    
  } catch (error) {
    console.error('Error fetching bookings by date:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all booking dates (for calendar marking)
router.get('/dates', auth, async (req, res) => {
  try {
    // Get owner's ground
    const ground = await Ground.findOne({ ownerId: req.user.id });
    if (!ground) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ground not found' 
      });
    }
    
    // Get all unique booking dates
    const bookings = await Booking.find({ 
      groundId: ground._id,
      status: { $ne: 'cancelled' }
    }).select('bookingDate');
    
    // Format dates for calendar
    const markedDates = {};
    bookings.forEach(booking => {
      const dateStr = booking.bookingDate.toISOString().split('T')[0];
      markedDates[dateStr] = { marked: true, dotColor: '#4CAF50' };
    });
    
    console.log(`Found ${Object.keys(markedDates).length} booking dates`);
    
    res.json({ 
      success: true, 
      markedDates 
    });
    
  } catch (error) {
    console.error('Error fetching booking dates:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Confirm booking
router.put('/:bookingId/confirm', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      ownerId: req.user.id 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }
    
    booking.status = 'confirmed';
    await booking.save();
    
    console.log('Booking confirmed:', bookingId);
    
    res.json({ 
      success: true, 
      message: 'Booking confirmed',
      booking 
    });
    
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update booking status
router.put('/:bookingId/status', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    const booking = await Booking.findOne({ 
      _id: bookingId, 
      ownerId: req.user.id 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }
    
    booking.status = status;
    await booking.save();
    
    console.log(`Booking ${bookingId} status updated to ${status}`);
    
    res.json({ 
      success: true, 
      message: 'Booking status updated',
      booking 
    });
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete booking
router.delete('/:bookingId', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findOneAndDelete({ 
      _id: bookingId, 
      ownerId: req.user.id 
    });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found or unauthorized' 
      });
    }
    
    console.log('Booking deleted:', bookingId);
    
    res.json({ 
      success: true, 
      message: 'Booking deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
