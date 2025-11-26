const express = require('express');
const router = express.Router();
const MatchRequest = require('../models/MatchRequest');
const Team = require('../models/Team');
const Match = require('../models/Match');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get available teams near user's location (for available matches section)
router.get('/available-teams', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('Fetching available teams for user:', userId);

    // Get user's details
    const user = await User.findById(userId).select('district village');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User location:', { district: user.district, village: user.village });

    // Get user's teams (where user is captain or member)
    const userTeams = await Team.find({
      $or: [
        { captain: userObjectId },
        { teamMembersId: userObjectId }
      ]
    }).select('_id');

    const userTeamIds = userTeams.map(t => t._id);
    console.log('User team count:', userTeamIds.length);

    // Find teams in same district (excluding user's teams)
    const availableTeams = await Team.find({
      _id: { $nin: userTeamIds },
      district: user.district
    })
    .populate('captain', 'fullname playerRole')
    .populate('teamMembersId', 'fullname')
    .sort({ createdAt: -1 })
    .limit(20);

    console.log(`Found ${availableTeams.length} available teams in ${user.district}`);

    res.json({ teams: availableTeams });

  } catch (error) {
    console.error('Error fetching available teams:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send match request to another team
router.post('/send-request', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      requestingTeamId,
      receivingTeamId,
      proposedDate,
      proposedTime,
      groundName,
      district,
      village,
      matchType,
      message
    } = req.body;

    console.log('Creating match request:', {
      requestingTeamId,
      receivingTeamId,
      proposedDate
    });

    // Validate requesting team exists and user is captain
    const requestingTeam = await Team.findById(requestingTeamId);
    if (!requestingTeam) {
      return res.status(404).json({ message: 'Requesting team not found' });
    }

    if (requestingTeam.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only team captain can send match requests' });
    }

    // Validate receiving team exists
    const receivingTeam = await Team.findById(receivingTeamId);
    if (!receivingTeam) {
      return res.status(404).json({ message: 'Receiving team not found' });
    }

    // Check if request already exists
    const existingRequest = await MatchRequest.findOne({
      requestingTeam: requestingTeamId,
      receivingTeam: receivingTeamId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists with this team' });
    }

    // Create match request
    const matchRequest = new MatchRequest({
      requestingTeam: requestingTeamId,
      receivingTeam: receivingTeamId,
      createdBy: userId,
      proposedDate,
      proposedTime,
      groundName,
      district,
      village,
      matchType,
      message,
      status: 'pending'
    });

    await matchRequest.save();
    await matchRequest.populate('requestingTeam', 'name district village');
    await matchRequest.populate('receivingTeam', 'name district village');
    await matchRequest.populate('createdBy', 'fullname');

    console.log('Match request created:', matchRequest._id);

    res.status(201).json({
      message: 'Match request sent successfully',
      matchRequest
    });

  } catch (error) {
    console.error('Error creating match request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get match requests for user's teams (both sent and received)
router.get('/requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const { type } = req.query; // 'sent' or 'received'

    console.log('Fetching match requests for user:', userId, 'type:', type);

    // Get user's teams
    const userTeams = await Team.find({
      $or: [
        { captain: userObjectId },
        { teamMembersId: userObjectId }
      ]
    }).select('_id');

    const userTeamIds = userTeams.map(t => t._id);
    console.log('User team count:', userTeamIds.length);

    let query = {};

    if (type === 'sent') {
      // Requests sent by user's teams
      query.requestingTeam = { $in: userTeamIds };
    } else if (type === 'received') {
      // Requests received by user's teams
      query.receivingTeam = { $in: userTeamIds };
    } else {
      // Both sent and received
      query.$or = [
        { requestingTeam: { $in: userTeamIds } },
        { receivingTeam: { $in: userTeamIds } }
      ];
    }

    const requests = await MatchRequest.find(query)
      .populate('requestingTeam', 'name district village')
      .populate('receivingTeam', 'name district village')
      .populate('createdBy', 'fullname')
      .populate('respondedBy', 'fullname')
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} match requests`);

    res.json({ requests });

  } catch (error) {
    console.error('Error fetching match requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept match request (creates actual match)
router.put('/requests/:requestId/accept', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { responseMessage } = req.body;

    console.log('Accepting match request:', requestId, 'by user:', userId);

    const matchRequest = await MatchRequest.findById(requestId)
      .populate('requestingTeam')
      .populate('receivingTeam');

    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    // Verify user is captain of receiving team
    if (matchRequest.receivingTeam.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only receiving team captain can accept requests' });
    }

    if (matchRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Create the match
    const match = new Match({
      status: 'upcoming',
      team1: matchRequest.requestingTeam._id,
      team2: matchRequest.receivingTeam._id,
      createdBy: matchRequest.createdBy,
      date: matchRequest.proposedDate,
      time: matchRequest.proposedTime,
      groundName: matchRequest.groundName,
      district: matchRequest.district,
      village: matchRequest.village,
      matchType: matchRequest.matchType,
      team1PlayersId: matchRequest.requestingTeam.teamMembersId || [],
      team2PlayersId: matchRequest.receivingTeam.teamMembersId || []
    });

    await match.save();

    // Update match request
    matchRequest.status = 'accepted';
    matchRequest.respondedBy = userId;
    matchRequest.respondedAt = new Date();
    matchRequest.responseMessage = responseMessage;
    matchRequest.matchId = match._id;
    await matchRequest.save();

    console.log('Match created:', match._id);

    res.json({
      message: 'Match request accepted',
      matchRequest,
      match
    });

  } catch (error) {
    console.error('Error accepting match request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject match request
router.put('/requests/:requestId/reject', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { responseMessage } = req.body;

    console.log('Rejecting match request:', requestId, 'by user:', userId);

    const matchRequest = await MatchRequest.findById(requestId)
      .populate('receivingTeam');

    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    // Verify user is captain of receiving team
    if (matchRequest.receivingTeam.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only receiving team captain can reject requests' });
    }

    if (matchRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update match request
    matchRequest.status = 'rejected';
    matchRequest.respondedBy = userId;
    matchRequest.respondedAt = new Date();
    matchRequest.responseMessage = responseMessage;
    await matchRequest.save();

    console.log('Match request rejected');

    res.json({
      message: 'Match request rejected',
      matchRequest
    });

  } catch (error) {
    console.error('Error rejecting match request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel match request (by creator)
router.delete('/requests/:requestId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    console.log('Cancelling match request:', requestId, 'by user:', userId);

    const matchRequest = await MatchRequest.findById(requestId);

    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' });
    }

    // Verify user created the request
    if (matchRequest.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Only request creator can cancel' });
    }

    if (matchRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be cancelled' });
    }

    matchRequest.status = 'cancelled';
    await matchRequest.save();

    console.log('Match request cancelled');

    res.json({
      message: 'Match request cancelled',
      matchRequest
    });

  } catch (error) {
    console.error('Error cancelling match request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
