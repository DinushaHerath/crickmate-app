const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const TeamInvite = require('../models/TeamInvite');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Create a new team
router.post('/create', auth, async (req, res) => {
  try {
    const { name, district, village, selectedPlayerIds } = req.body;
    const userId = req.user.id;

    console.log('Creating team:', { name, district, village, captain: userId, members: selectedPlayerIds });

    // Validate required fields
    if (!name || !district || !village) {
      return res.status(400).json({ 
        message: 'Team name, district, and village are required' 
      });
    }

    // Create team with captain as creator
    const team = new Team({
      name,
      district,
      village,
      captain: userId,
      teamMembersId: [userId], // Captain is automatically added
      winMatches: 0,
      matchesPlayed: 0
    });

    await team.save();
    console.log('Team created:', team._id);

    // Send invitations to selected players (if any)
    if (selectedPlayerIds && selectedPlayerIds.length > 0) {
      const invitations = selectedPlayerIds
        .filter(playerId => playerId !== userId) // Don't invite captain
        .map(playerId => ({
          teamId: team._id,
          invitedUserId: playerId,
          invitedBy: userId,
          status: 'pending'
        }));

      if (invitations.length > 0) {
        await TeamInvite.insertMany(invitations);
        console.log(`Sent ${invitations.length} invitations`);
      }
    }

    // Populate captain details
    await team.populate('captain', 'fullname playerRole');

    res.status(201).json({
      message: 'Team created successfully',
      team
    });

  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's teams (where user is captain or member)
router.get('/my-teams', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    console.log('Fetching teams for user:', userId);

    const teams = await Team.find({
      $or: [
        { captain: userObjectId },
        { teamMembersId: userObjectId }
      ]
    })
    .populate('captain', 'fullname playerRole district village')
    .populate('teamMembersId', 'fullname playerRole')
    .sort({ createdAt: -1 });

    console.log(`Found ${teams.length} teams for user`);

    res.json({ teams });

  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get nearby players based on district
router.get('/nearby-players', auth, async (req, res) => {
  try {
    const { district } = req.query;
    const userId = req.user.id;

    console.log('Fetching nearby players:', { district, excludeUser: userId });

    if (!district) {
      return res.status(400).json({ message: 'District is required' });
    }

    // Find players in the same district (exclude current user)
    const players = await User.find({
      _id: { $ne: userId },
      district: district,
      role: 'player'
    })
    .select('fullname playerRole district village')
    .sort({ fullname: 1 });

    console.log(`Found ${players.length} nearby players`);

    // Get profiles for these players (if they exist)
    const playerIds = players.map(p => p._id);
    const profiles = await Profile.find({ 
      userId: { $in: playerIds } 
    });

    // Map profiles to player IDs for quick lookup
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Combine player data with profile data
    const playersWithProfiles = players.map(player => ({
      _id: player._id,
      fullname: player.fullname,
      playerRole: player.playerRole,
      district: player.district,
      village: player.village,
      profile: profileMap[player._id.toString()] || null
    }));

    res.json({ players: playersWithProfiles });

  } catch (error) {
    console.error('Error fetching nearby players:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get player profile by user ID
router.get('/player-profile/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('Fetching profile for user:', userId);

    const user = await User.findById(userId)
      .select('fullname playerRole district village');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ userId: userId });

    res.json({
      user,
      profile: profile || null
    });

  } catch (error) {
    console.error('Error fetching player profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send team invitation
router.post('/invite', auth, async (req, res) => {
  try {
    const { teamId, userId: invitedUserId, message } = req.body;
    const inviterId = req.user.id;

    console.log('Sending invitation:', { teamId, invitedUserId, inviterId });

    // Validate team exists and user is captain
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain.toString() !== inviterId) {
      return res.status(403).json({ message: 'Only team captain can send invitations' });
    }

    // Check if invitation already exists
    const existingInvite = await TeamInvite.findOne({
      teamId,
      invitedUserId,
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invitation already sent to this player' });
    }

    // Check if player is already a member
    if (team.teamMembersId.includes(invitedUserId)) {
      return res.status(400).json({ message: 'Player is already a team member' });
    }

    // Create invitation
    const invitation = new TeamInvite({
      teamId,
      invitedUserId,
      invitedBy: inviterId,
      message,
      status: 'pending'
    });

    await invitation.save();
    await invitation.populate('teamId', 'name');
    await invitation.populate('invitedBy', 'fullname');

    console.log('Invitation sent:', invitation._id);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get invitations for current user
router.get('/invites', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // Optional filter by status

    console.log('Fetching invitations for user:', userId, 'status:', status);

    const query = { invitedUserId: userId };
    if (status) {
      query.status = status;
    }

    const invitations = await TeamInvite.find(query)
      .populate('teamId', 'name district village')
      .populate('invitedBy', 'fullname playerRole')
      .sort({ createdAt: -1 });

    console.log(`Found ${invitations.length} invitations`);

    res.json({ 
      success: true,
      invitations 
    });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept team invitation
router.put('/invites/:inviteId/accept', auth, async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;

    console.log('Accepting invitation:', inviteId, 'by user:', userId);

    const invitation = await TeamInvite.findById(inviteId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Verify invitation is for this user
    if (invitation.invitedUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Add user to team members
    await Team.findByIdAndUpdate(invitation.teamId, {
      $addToSet: { teamMembersId: userId }
    });

    console.log('User added to team:', invitation.teamId);

    res.json({
      success: true,
      message: 'Invitation accepted',
      invitation
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject team invitation
router.put('/invites/:inviteId/reject', auth, async (req, res) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;

    console.log('Rejecting invitation:', inviteId, 'by user:', userId);

    const invitation = await TeamInvite.findById(inviteId);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Verify invitation is for this user
    if (invitation.invitedUserId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already processed' });
    }

    // Update invitation status
    invitation.status = 'rejected';
    await invitation.save();

    console.log('Invitation rejected');

    res.json({
      success: true,
      message: 'Invitation rejected',
      invitation
    });

  } catch (error) {
    console.error('Error rejecting invitation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
