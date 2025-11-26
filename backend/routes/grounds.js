const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ground = require('../models/Ground');
const User = require('../models/User');

// Get ground profile for logged-in ground owner
router.get('/my-ground', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Fetching ground for owner:', userId);

    let ground = await Ground.findOne({ ownerId: userId });
    
    // If no ground exists, get user data to pre-fill
    if (!ground) {
      const user = await User.findById(userId).select('fullname email district village');
      return res.json({
        success: true,
        ground: null,
        userData: {
          fullname: user?.fullname || '',
          email: user?.email || '',
          district: user?.district || '',
          village: user?.village || ''
        }
      });
    }

    console.log('Ground found:', ground.groundName);

    res.json({
      success: true,
      ground
    });

  } catch (error) {
    console.error('Error fetching ground:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create or update ground profile
router.post('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      groundName,
      address,
      district,
      village,
      contact,
      facilities,
      pricing,
      availability,
      description,
      capacity,
      pitchType
    } = req.body;

    console.log('Updating ground profile for owner:', userId);

    // Validate required fields
    if (!groundName) {
      return res.status(400).json({ 
        success: false,
        message: 'Ground name is required' 
      });
    }

    // Find existing ground or create new
    let ground = await Ground.findOne({ ownerId: userId });

    if (ground) {
      // Update existing ground
      ground.groundName = groundName;
      ground.address = address || ground.address;
      ground.district = district || ground.district;
      ground.village = village || ground.village;
      ground.contact = contact || ground.contact;
      ground.facilities = facilities || ground.facilities;
      ground.pricing = pricing || ground.pricing;
      ground.availability = availability || ground.availability;
      ground.description = description || ground.description;
      ground.capacity = capacity || ground.capacity;
      ground.pitchType = pitchType || ground.pitchType;

      await ground.save();
      console.log('Ground updated:', ground.groundName);
    } else {
      // Create new ground
      ground = new Ground({
        ownerId: userId,
        groundName,
        address,
        district,
        village,
        contact,
        facilities,
        pricing,
        availability,
        description,
        capacity,
        pitchType
      });

      await ground.save();
      console.log('Ground created:', ground.groundName);
    }

    res.json({
      success: true,
      message: ground ? 'Ground profile updated successfully' : 'Ground profile created successfully',
      ground
    });

  } catch (error) {
    console.error('Error saving ground:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all grounds (for players to search)
router.get('/search', async (req, res) => {
  try {
    const { district, village, pitchType, search } = req.query;

    console.log('Searching grounds:', { district, village, pitchType, search });

    let query = { verified: true };

    if (district) {
      query.district = new RegExp(district, 'i');
    }

    if (village) {
      query.village = new RegExp(village, 'i');
    }

    if (pitchType) {
      query.pitchType = pitchType;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const grounds = await Ground.find(query)
      .populate('ownerId', 'fullname email')
      .select('-bookings')
      .sort({ 'rating.average': -1, createdAt: -1 })
      .limit(50);

    console.log(`Found ${grounds.length} grounds`);

    res.json({
      success: true,
      grounds
    });

  } catch (error) {
    console.error('Error searching grounds:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get ground by ID
router.get('/:groundId', async (req, res) => {
  try {
    const { groundId } = req.params;

    const ground = await Ground.findById(groundId)
      .populate('ownerId', 'fullname email contact');

    if (!ground) {
      return res.status(404).json({ 
        success: false,
        message: 'Ground not found' 
      });
    }

    res.json({
      success: true,
      ground
    });

  } catch (error) {
    console.error('Error fetching ground:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update ground name during signup
router.post('/initial-setup', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { groundName } = req.body;

    if (!groundName) {
      return res.status(400).json({ 
        success: false,
        message: 'Ground name is required' 
      });
    }

    console.log('Initial ground setup for:', userId);

    // Get user data to pre-fill ground
    const user = await User.findById(userId);

    // Check if ground already exists
    let ground = await Ground.findOne({ ownerId: userId });

    if (ground) {
      ground.groundName = groundName;
      await ground.save();
    } else {
      ground = new Ground({
        ownerId: userId,
        groundName,
        district: user.district,
        village: user.village,
        contact: {
          email: user.email
        }
      });
      await ground.save();
    }

    res.json({
      success: true,
      message: 'Ground setup completed',
      ground
    });

  } catch (error) {
    console.error('Error in initial setup:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;
