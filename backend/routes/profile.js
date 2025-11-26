const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const Team = require('../models/Team');
const Match = require('../models/Match');
const auth = require('../middleware/auth');

// Get current user's profile with stats
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('Fetching profile for user:', userId);

    // Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile if exists
    const profile = await Profile.findOne({ userId: userObjectId });

    // Get teams where user is member or captain
    const teams = await Team.find({
      $or: [
        { captain: userObjectId },
        { teamMembersId: userObjectId }
      ]
    }).select('name');

    // Get match statistics
    const totalMatches = await Match.countDocuments({
      $or: [
        { createdBy: userObjectId },
        { team1PlayersId: userObjectId },
        { team2PlayersId: userObjectId }
      ],
      status: { $in: ['past', 'completed'] }
    });

    // Get wins (matches where user's team won)
    const matchesPlayed = await Match.find({
      $or: [
        { team1PlayersId: userObjectId },
        { team2PlayersId: userObjectId }
      ],
      status: { $in: ['past', 'completed'] },
      winner: { $exists: true, $ne: null }
    }).populate('team1 team2 winner');

    let wins = 0;
    matchesPlayed.forEach(match => {
      // Check if user was in winning team
      const inTeam1 = match.team1PlayersId.some(id => id.toString() === userId);
      const inTeam2 = match.team2PlayersId.some(id => id.toString() === userId);
      
      if (match.winner) {
        if (inTeam1 && match.winner.toString() === match.team1?._id.toString()) {
          wins++;
        } else if (inTeam2 && match.winner.toString() === match.team2?._id.toString()) {
          wins++;
        }
      }
    });

    const stats = {
      totalMatches,
      wins,
      teams: teams.length,
      profile: profile || null
    };

    console.log('Profile stats:', stats);

    res.json({
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        playerRole: user.playerRole,
        district: user.district,
        village: user.village
      },
      profile,
      stats,
      teams
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    console.log('Updating profile for user:', userId);

    // Update user basic info
    const allowedUserFields = ['fullname', 'district', 'village', 'playerRole'];
    const userUpdates = {};
    
    allowedUserFields.forEach(field => {
      if (updates[field] !== undefined) {
        userUpdates[field] = updates[field];
      }
    });

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(userId, userUpdates);
    }

    // Update or create profile
    const profileFields = ['age', 'battingStyle', 'bowlingStyle', 'bio', 'jerseyNumber'];
    const profileUpdates = {};
    
    profileFields.forEach(field => {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    });

    if (Object.keys(profileUpdates).length > 0) {
      await Profile.findOneAndUpdate(
        { userId },
        { ...profileUpdates, userId },
        { upsert: true, new: true }
      );
    }

    console.log('Profile updated successfully');

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
