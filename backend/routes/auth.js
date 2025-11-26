const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER / SIGNUP
router.post('/register', async (req, res) => {
  try {
    const { 
      fullname, 
      email, 
      password, 
      role, 
      playerRole, 
      district, 
      village,
      grounds
    } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    // Validate role
    if (!role || !['player', 'ground_owner'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role. Must be player or ground_owner' });
    }

    // Validate required fields based on role
    if (role === 'player' && !playerRole) {
      return res.status(400).json({ msg: 'Player role is required for players' });
    }
    if (role === 'player' && !village) {
      return res.status(400).json({ msg: 'Village is required for players' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data object
    const userData = { 
      fullname, 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      role,
      district
    };

    // Add role-specific fields
    if (role === 'player') {
      userData.playerRole = playerRole;
      userData.village = village;
    } else if (role === 'ground_owner') {
      userData.grounds = grounds || [];
    }

    // Create and save user
    user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return response with user info
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.fullname, 
        email: user.email,
        role: user.role,
        playerRole: user.playerRole,
        district: user.district,
        village: user.village,
        grounds: user.grounds
      } 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error during registration', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if role matches (if role is provided)
    if (role && user.role !== role) {
      return res.status(400).json({ msg: `This account is registered as ${user.role}, not ${role}` });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // Return response with user info
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.fullname, 
        email: user.email,
        role: user.role,
        playerRole: user.playerRole,
        district: user.district,
        village: user.village,
        grounds: user.grounds
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login', error: err.message });
  }
});

module.exports = router;
