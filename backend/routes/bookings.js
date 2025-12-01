const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ground = require('../models/Ground');
const auth = require('../middleware/auth');

// Create a new booking
router.post('/create', auth, async (req, res) => {
  try {
    const { groundId, customerName, mobile, paymentAmount, timeSlot, bookingDate, notes, customerContact } = req.body;
    
    console.log('Creating booking with data:', req.body);
    
    // Validate required fields (payment is optional)
    if (!groundId || !customerName || !timeSlot || !bookingDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    const contactNumber = mobile || customerContact;
    if (!contactNumber) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact number is required' 
      });
    }
    
    // Find the ground
    const ground = await Ground.findById(groundId);
    if (!ground) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ground not found' 
      });
    }
    
    // Determine if booking is by owner or player
    const isOwner = ground.ownerId.toString() === req.user.id;
    
    // Create booking
    const initialStatus = Number(paymentAmount) > 0 ? 'confirmed' : 'pending';
    const booking = new Booking({
      groundId,
      ownerId: ground.ownerId,
      customerName,
      mobile: contactNumber,
      paymentAmount: Number(paymentAmount) || 0,
      timeSlot,
      bookingDate: new Date(bookingDate),
      status: initialStatus,
      notes,
      bookedBy: isOwner ? 'owner' : 'player',
      playerId: isOwner ? null : req.user.id
    });
    
    await booking.save();
    
    console.log('Booking created successfully:', booking._id, 'by', booking.bookedBy);
    
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

    // Auto-status logic: if paymentAmount > 0 and not cancelled, set confirmed
    if (status !== undefined) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      booking.status = status;
    } else {
      if (Number(booking.paymentAmount) > 0 && booking.status !== 'cancelled') {
        booking.status = 'confirmed';
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

// Get booking dates for a specific ground (public - for players)
router.get('/dates/:groundId', async (req, res) => {
  try {
    const { groundId } = req.params;
    
    // Get all unique booking dates for this ground
    const bookings = await Booking.find({ 
      groundId: groundId,
      status: { $ne: 'cancelled' }
    }).select('bookingDate');
    
    // Format dates for calendar
    const markedDates = {};
    bookings.forEach(booking => {
      const dateStr = booking.bookingDate.toISOString().split('T')[0];
      markedDates[dateStr] = { marked: true, dotColor: '#4CAF50' };
    });
    
    console.log(`Found ${Object.keys(markedDates).length} booking dates for ground ${groundId}`);
    
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

// Player: pay and confirm own booking
router.put('/:bookingId/pay-confirm', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentAmount } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, playerId: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }

    const amt = Number(paymentAmount) || 0;
    if (amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    booking.paymentAmount = amt;
    booking.status = 'confirmed';
    await booking.save();

    res.json({ success: true, message: 'Payment saved and booking confirmed', booking });
  } catch (error) {
    console.error('Error pay-confirm booking:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Player: cancel own booking
router.put('/:bookingId/cancel', auth, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, playerId: req.user.id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

// Get bookings for a specific ground and date (public - for showing available time slots)
router.get('/ground/:groundId/date/:date', async (req, res) => {
  try {
    const { groundId, date } = req.params;
    
    // Parse date
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Get bookings for that day
    const bookings = await Booking.find({
      groundId: groundId,
      bookingDate: {
        $gte: bookingDate,
        $lt: nextDay
      },
      status: { $ne: 'cancelled' }
    }).select('timeSlot status bookedBy');
    
    console.log(`Found ${bookings.length} bookings for ground ${groundId} on ${date}`);
    if (bookings.length > 0) {
      console.log('Sample booking timeSlot:', bookings[0].timeSlot, 'Type:', typeof bookings[0].timeSlot);
    }
    
    res.json({ 
      success: true, 
      bookings
    });
    
  } catch (error) {
    console.error('Error fetching ground bookings by date:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all bookings made by the logged-in player
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      playerId: req.user.id 
    })
    .populate('groundId', 'groundName address district village')
    .sort({ bookingDate: -1 });
    
    console.log(`Found ${bookings.length} bookings for player ${req.user.id}`);
    
    res.json({ 
      success: true, 
      bookings 
    });
    
  } catch (error) {
    console.error('Error fetching player bookings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
