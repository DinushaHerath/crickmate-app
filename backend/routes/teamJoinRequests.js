const express = require('express');
const router = express.Router();
const TeamJoinRequest = require('../models/TeamJoinRequest');
const Team = require('../models/Team');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get available teams to join (teams user is not part of)
router.get('/available', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { district } = req.query;
    
    console.log('Fetching available teams to join for user:', userId);
    console.log('District filter:', district);

    // Get user details
    const user = await User.findById(userId);
    const searchDistrict = district || user.district;

    // Find teams user is already part of
    const userTeams = await Team.find({
      $or: [
        { captain: userId },
        { teamMembersId: userId }
      ]
    }).select('_id');

    const userTeamIds = userTeams.map(team => team._id);

    // Find teams in the same district that user is not part of
    const query = {
      _id: { $nin: userTeamIds }
    };

    if (searchDistrict) {
      query.district = new RegExp(searchDistrict.trim(), 'i');
    }

    const availableTeams = await Team.find(query)
      .populate('captain', 'fullname email')
      .populate('teamMembersId', 'fullname')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${availableTeams.length} available teams`);

    res.json({ teams: availableTeams });
  } catch (error) {
    console.error('Error fetching available teams:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send join request
router.post('/send', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { teamId, message } = req.body;

    console.log('User sending join request:', userId, 'to team:', teamId);

    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is already in the team
    const isAlreadyMember = team.teamMembersId.includes(userId) || 
                            (team.captain && team.captain.toString() === userId);
    if (isAlreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this team' });
    }

    // Check if there's already a pending request
    const existingRequest = await TeamJoinRequest.findOne({
      userId,
      teamId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this team' });
    }

    // Create join request
    const joinRequest = new TeamJoinRequest({
      userId,
      teamId,
      message: message || ''
    });

    await joinRequest.save();

    const populatedRequest = await TeamJoinRequest.findById(joinRequest._id)
      .populate('userId', 'fullname email playerRole district village')
      .populate('teamId', 'name district village captain');

    console.log('Join request created successfully');
    res.status(201).json({ 
      message: 'Join request sent successfully',
      request: populatedRequest 
    });

  } catch (error) {
    console.error('Error sending join request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's join requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await TeamJoinRequest.find({ userId })
      .populate('teamId', 'name district village captain teamMembersId')
      .populate('respondedBy', 'fullname')
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} join requests for user`);
    res.json({ requests });

  } catch (error) {
    console.error('Error fetching join requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get join requests for teams where user is captain
router.get('/team-requests', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find teams where user is captain
    const captainTeams = await Team.find({ captain: userId }).select('_id');
    const teamIds = captainTeams.map(team => team._id);

    const requests = await TeamJoinRequest.find({ 
      teamId: { $in: teamIds },
      status: 'pending'
    })
      .populate('userId', 'fullname email playerRole district village')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} pending requests for captain's teams`);
    res.json({ requests });

  } catch (error) {
    console.error('Error fetching team requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept join request (captain only)
router.put('/accept/:requestId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { responseMessage } = req.body;

    const request = await TeamJoinRequest.findById(requestId)
      .populate('teamId')
      .populate('userId', 'fullname');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is captain of the team
    if (request.teamId.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only team captain can accept requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Add user to team
    await Team.findByIdAndUpdate(request.teamId._id, {
      $addToSet: { teamMembersId: request.userId._id }
    });

    // Update request
    request.status = 'accepted';
    request.respondedBy = userId;
    request.respondedAt = new Date();
    request.responseMessage = responseMessage || 'Welcome to the team!';
    await request.save();

    console.log('Join request accepted, user added to team');
    res.json({ 
      message: 'Request accepted successfully',
      request 
    });

  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject join request (captain only)
router.put('/reject/:requestId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { responseMessage } = req.body;

    const request = await TeamJoinRequest.findById(requestId)
      .populate('teamId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is captain of the team
    if (request.teamId.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only team captain can reject requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request
    request.status = 'rejected';
    request.respondedBy = userId;
    request.respondedAt = new Date();
    request.responseMessage = responseMessage || 'Request declined';
    await request.save();

    console.log('Join request rejected');
    res.json({ 
      message: 'Request rejected',
      request 
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel own join request
router.delete('/cancel/:requestId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await TeamJoinRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only cancel your own requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending requests' });
    }

    await TeamJoinRequest.findByIdAndDelete(requestId);

    console.log('Join request cancelled');
    res.json({ message: 'Request cancelled successfully' });

  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
