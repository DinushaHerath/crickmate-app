const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Team = require('../models/Team');
const Match = require('../models/Match');

// Get home page statistics for a user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's teams
    const userTeams = await Team.find({ 
      teamMembersId: userId 
    }).select('_id name captain teamMembersId location');

    const teamIds = userTeams.map(t => t._id);

    // Get upcoming matches for user's teams
    const now = new Date();
    const upcomingMatches = await Match.find({
      $or: [
        { team1: { $in: teamIds } },
        { team2: { $in: teamIds } },
        { team1PlayersId: userId },
        { team2PlayersId: userId },
        { createdBy: userId }
      ],
      dateTime: { $gte: now },
      status: 'upcoming'
    })
    .populate('team1', 'name')
    .populate('team2', 'name')
    .populate('groundId', 'name address district')
    .sort({ dateTime: 1 })
    .limit(5);

    // Get past matches for user's teams
    const pastMatches = await Match.find({
      $or: [
        { team1: { $in: teamIds } },
        { team2: { $in: teamIds } },
        { team1PlayersId: userId },
        { team2PlayersId: userId },
        { createdBy: userId }
      ],
      status: 'completed'
    })
    .populate('team1', 'name')
    .populate('team2', 'name')
    .sort({ dateTime: -1 })
    .limit(5);

    // Calculate statistics
    const totalMatches = pastMatches.length;
    let wins = 0;
    
    pastMatches.forEach(match => {
      if (match.winner) {
        const userTeamIds = teamIds.map(id => id.toString());
        if (userTeamIds.includes(match.winner.toString())) {
          wins++;
        }
      }
    });

    // Format upcoming matches
    const formattedUpcomingMatches = upcomingMatches.map(match => {
      const isCreatedByUser = match.createdBy && match.createdBy.toString() === userId;
      
      return {
        id: match._id,
        team1: match.team1?.name || match.team1Name || 'Team 1',
        team2: match.team2?.name || match.team2Name || 'Team 2',
        date: new Date(match.dateTime).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        time: new Date(match.dateTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        ground: match.groundId?.name || match.groundName || 'TBD',
        groundDistrict: match.groundId?.district || '',
        type: match.matchType || 'T20',
        status: match.status,
        createdByUser: isCreatedByUser
      };
    });

    // Format teams with stats
    const formattedTeams = await Promise.all(userTeams.map(async (team) => {
      const teamMatches = await Match.find({
        $or: [
          { team1: team._id },
          { team2: team._id }
        ],
        status: 'completed'
      });

      const teamWins = teamMatches.filter(match => 
        match.winner && match.winner.toString() === team._id.toString()
      ).length;

      const captain = await User.findById(team.captain).select('fullname');
      const isCreatedByUser = team.captain && team.captain.toString() === userId;

      return {
        id: team._id,
        name: team.name,
        captain: captain?.fullname || 'Unknown',
        members: team.teamMembersId?.length || 0,
        matches: teamMatches.length,
        wins: teamWins,
        location: team.location,
        createdByUser: isCreatedByUser
      };
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalMatches,
          wins,
          teams: userTeams.length,
          winRate: totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0
        },
        upcomingMatches: formattedUpcomingMatches,
        teams: formattedTeams,
        recentMatches: pastMatches.slice(0, 3).map(match => ({
          id: match._id,
          team1: match.team1?.name || match.team1Name || 'TBD',
          team2: match.team2?.name || match.team2Name || 'TBD',
          date: new Date(match.dateTime).toLocaleDateString(),
          result: match.result || 'Completed'
        }))
      }
    });

    console.log('Sending home stats response:', {
      upcomingMatchesCount: formattedUpcomingMatches.length,
      teamsCount: formattedTeams.length,
      sampleMatch: formattedUpcomingMatches[0]
    });

  } catch (error) {
    console.error('Error fetching home stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching home statistics',
      error: error.message 
    });
  }
});

module.exports = router;
