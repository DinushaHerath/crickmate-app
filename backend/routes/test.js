const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const Match = require('../models/Match');
const User = require('../models/User');

// Create sample data for testing
router.post('/seed', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ msg: 'User ID is required' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('Creating sample data for user:', user.fullname);

    // Create two sample teams
    const team1 = new Team({
      name: 'Thunder Strikers',
      createdBy: userId,
      players: [userId],
      district: user.district,
      village: user.village || user.district,
      teamType: 'casual'
    });
    await team1.save();
    console.log('Created Team 1:', team1.name);

    const team2 = new Team({
      name: 'Lightning Warriors',
      createdBy: userId,
      players: [],
      district: user.district,
      village: user.village || user.district,
      teamType: 'casual'
    });
    await team2.save();
    console.log('Created Team 2:', team2.name);

    // Create an upcoming match (7 days from now)
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);
    
    const upcomingMatch = new Match({
      status: 'upcoming',
      team1: team1._id,
      team2: team2._id,
      createdBy: userId,
      date: upcomingDate,
      time: '10:00 AM',
      groundName: 'Central Cricket Ground',
      district: user.district,
      village: user.village || user.district,
      team1PlayersId: [userId],
      team2PlayersId: [],
      matchType: 'T20'
    });
    await upcomingMatch.save();
    console.log('Created Upcoming Match:', upcomingMatch._id);

    // Create a past match (7 days ago)
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 7);
    
    const pastMatch = new Match({
      status: 'past',
      team1: team1._id,
      team2: team2._id,
      createdBy: userId,
      date: pastDate,
      time: '2:00 PM',
      groundName: 'South Stadium',
      district: user.district,
      village: user.village || user.district,
      team1PlayersId: [userId],
      team2PlayersId: [],
      matchType: 'ODI',
      team1Score: { runs: 245, wickets: 8, overs: 50 },
      team2Score: { runs: 198, wickets: 10, overs: 45.3 },
      winner: team1._id
    });
    await pastMatch.save();
    console.log('Created Past Match:', pastMatch._id);

    res.json({
      msg: 'Sample data created successfully',
      user: {
        id: user._id,
        name: user.fullname,
        district: user.district
      },
      teams: [
        { id: team1._id, name: team1.name },
        { id: team2._id, name: team2.name }
      ],
      matches: [
        { id: upcomingMatch._id, status: 'upcoming', date: upcomingDate },
        { id: pastMatch._id, status: 'past', date: pastDate }
      ]
    });

  } catch (error) {
    console.error('Error creating sample data:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get all matches (for debugging)
router.get('/all-matches', async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('team1', 'name')
      .populate('team2', 'name')
      .populate('createdBy', 'fullname email')
      .sort({ date: -1 });

    res.json({
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('Error fetching all matches:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Get all teams (for debugging)
router.get('/all-teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('createdBy', 'fullname email')
      .populate('players', 'fullname');

    res.json({
      count: teams.length,
      teams
    });
  } catch (error) {
    console.error('Error fetching all teams:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Clear all test data
router.delete('/clear', async (req, res) => {
  try {
    await Match.deleteMany({});
    await Team.deleteMany({});
    
    res.json({ msg: 'All matches and teams deleted' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;
