const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/matches/create - Create a new match
router.post('/create', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      team1Id,
      team2Id,
      date,
      time,
      groundName,
      district,
      village,
      matchType,
      team1PlayersId,
      team2PlayersId
    } = req.body;

    // Validate required fields
    if (!team1Id || !team2Id || !date || !time || !groundName || !district || !matchType) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Determine status based on date
    const matchDate = new Date(date);
    const currentDate = new Date();
    let status = 'upcoming';
    if (matchDate < currentDate) {
      status = 'past';
    }

    // Create the match
    const newMatch = new Match({
      status,
      team1: team1Id,
      team2: team2Id,
      createdBy: userId,
      date: matchDate,
      time,
      groundName,
      district,
      village: village || district,
      team1PlayersId: team1PlayersId || [userId],
      team2PlayersId: team2PlayersId || [],
      matchType
    });

    await newMatch.save();

    const populatedMatch = await Match.findById(newMatch._id)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname');

    res.status(201).json({
      msg: 'Match created successfully',
      match: populatedMatch
    });

  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// POST /api/matches/quick-create - Quickly create match with team names (auto-creates teams)
router.post('/quick-create', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const {
      team1Name,
      team2Name,
      date,
      time,
      groundName,
      matchType
    } = req.body;

    // Create or find teams
    let team1 = await Team.findOne({ name: team1Name, createdBy: userId });
    if (!team1) {
      team1 = new Team({
        name: team1Name,
        createdBy: userId,
        players: [userId],
        district: user.district,
        village: user.village
      });
      await team1.save();
    }

    let team2 = await Team.findOne({ name: team2Name, createdBy: userId });
    if (!team2) {
      team2 = new Team({
        name: team2Name,
        createdBy: userId,
        players: [],
        district: user.district,
        village: user.village
      });
      await team2.save();
    }

    // Determine status based on date
    const matchDate = new Date(date);
    const currentDate = new Date();
    let status = 'upcoming';
    if (matchDate < currentDate) {
      status = 'past';
    }

    // Create the match
    const newMatch = new Match({
      status,
      team1: team1._id,
      team2: team2._id,
      createdBy: userId,
      date: matchDate,
      time,
      groundName: groundName || 'Local Ground',
      district: user.district,
      village: user.village || user.district,
      team1PlayersId: [userId],
      team2PlayersId: [],
      matchType: matchType || 'T20'
    });

    await newMatch.save();

    const populatedMatch = await Match.findById(newMatch._id)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname');

    res.status(201).json({
      msg: 'Match created successfully',
      match: populatedMatch,
      teams: { team1, team2 }
    });

  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
