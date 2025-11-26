const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Import and use create match routes
const createMatchRoutes = require('./createMatch');
router.use('/', createMatchRoutes);

// GET /api/matches/all - Get ALL matches for debugging
router.get('/all', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const allMatches = await Match.find({})
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname');

    console.log('========== ALL MATCHES DEBUG ==========');
    console.log('User ID from token:', userId);
    console.log('Total matches in DB:', allMatches.length);
    
    allMatches.forEach((match, index) => {
      console.log(`\nMatch ${index + 1}:`);
      console.log('  Match ID:', match._id.toString());
      console.log('  Date:', match.date);
      console.log('  CreatedBy:', match.createdBy?._id?.toString());
      console.log('  CreatedBy matches user?', match.createdBy?._id?.toString() === userId);
      console.log('  Team1 Players:', match.team1PlayersId.map(id => id.toString()));
      console.log('  Team2 Players:', match.team2PlayersId.map(id => id.toString()));
      console.log('  User in team1?', match.team1PlayersId.some(id => id.toString() === userId));
      console.log('  User in team2?', match.team2PlayersId.some(id => id.toString() === userId));
    });
    console.log('======================================');

    res.json(allMatches);
  } catch (error) {
    console.error('Error fetching all matches:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// GET /api/matches/upcoming - Get upcoming matches for logged-in user
router.get('/upcoming', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const currentDate = new Date();

    console.log('========== UPCOMING MATCHES DEBUG ==========');
    console.log('User ID from token:', userId);
    console.log('User ObjectId:', userObjectId);
    console.log('Current date:', currentDate);

    // First, let's check all matches without filtering by user
    const allMatches = await Match.find({ date: { $gte: currentDate } })
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname');
    
    console.log('Total upcoming matches in DB:', allMatches.length);
    if (allMatches.length > 0) {
      console.log('Sample match createdBy:', allMatches[0].createdBy?._id?.toString());
      console.log('Sample match team1PlayersId:', allMatches[0].team1PlayersId.map(id => id.toString()));
      console.log('Sample match team2PlayersId:', allMatches[0].team2PlayersId.map(id => id.toString()));
    }

    // Now find matches for this specific user using ObjectId
    const matches = await Match.find({
      date: { $gte: currentDate },
      $or: [
        { team1PlayersId: userObjectId },
        { team2PlayersId: userObjectId },
        { createdBy: userObjectId }
      ]
    })
    .populate('team1', 'name')
    .populate('team2', 'name')
    .populate('createdBy', 'fullname')
    .sort({ date: 1, time: 1 });

    console.log('Matches found for user:', matches.length);
    console.log('==========================================');
    res.json(matches);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// GET /api/matches/past - Get past matches for logged-in user
router.get('/past', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const currentDate = new Date();

    console.log('========== PAST MATCHES DEBUG ==========');
    console.log('User ID from token:', userId);
    console.log('User ObjectId:', userObjectId);
    console.log('Current date:', currentDate);

    // First, check all past matches
    const allPastMatches = await Match.find({ date: { $lt: currentDate } })
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname');
    
    console.log('Total past matches in DB:', allPastMatches.length);
    if (allPastMatches.length > 0) {
      console.log('Sample match createdBy:', allPastMatches[0].createdBy?._id?.toString());
      console.log('Sample match team1PlayersId:', allPastMatches[0].team1PlayersId.map(id => id.toString()));
      console.log('Sample match team2PlayersId:', allPastMatches[0].team2PlayersId.map(id => id.toString()));
    }

    // Find matches for this specific user using ObjectId
    const matches = await Match.find({
      date: { $lt: currentDate },
      $or: [
        { team1PlayersId: userObjectId },
        { team2PlayersId: userObjectId },
        { createdBy: userObjectId }
      ]
    })
    .populate('team1', 'name')
    .populate('team2', 'name')
    .populate('createdBy', 'fullname')
    .populate('winner', 'name')
    .sort({ date: -1, time: -1 });

    console.log('Past matches found for user:', matches.length);
    console.log('======================================');
    res.json(matches);
  } catch (error) {
    console.error('Error fetching past matches:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// PUT /api/matches/:id/score - Update match score and winner (only creator can update)
router.put('/:id/score', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const matchId = req.params.id;
    const { team1Score, team2Score, winner } = req.body;

    // Find the match
    const match = await Match.findById(matchId);
    
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    // Check if the user is the creator of the match
    if (match.createdBy.toString() !== userId) {
      return res.status(403).json({ msg: 'Only the match creator can update scores' });
    }

    // Check if match is in the past
    const currentDate = new Date();
    if (match.date >= currentDate) {
      return res.status(400).json({ msg: 'Cannot update scores for upcoming matches' });
    }

    // Update the match
    match.team1Score = team1Score || match.team1Score;
    match.team2Score = team2Score || match.team2Score;
    match.winner = winner || match.winner;
    match.status = 'past';

    await match.save();

    const updatedMatch = await Match.findById(matchId)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname')
      .populate('winner', 'name');

    res.json(updatedMatch);
  } catch (error) {
    console.error('Error updating match score:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// GET /api/matches/:id - Get single match details
router.get('/:id', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname')
      .populate('winner', 'name')
      .populate('team1PlayersId', 'fullname')
      .populate('team2PlayersId', 'fullname');

    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
