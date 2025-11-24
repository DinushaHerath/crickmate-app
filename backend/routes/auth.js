const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      playerRoles, 
      district, 
      village,
      groundName,
      groundAddress 
    } = req.body;
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User exists' });

    // Validate role
    if (!role || !['player', 'ground_owner'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userData = { 
      name, 
      email, 
      password: hash, 
      role 
    };

    // Add role-specific fields
    if (role === 'player') {
      userData.playerRoles = playerRoles || [];
      userData.district = district;
      userData.village = village;
    } else if (role === 'ground_owner') {
      userData.groundName = groundName;
      userData.groundAddress = groundAddress;
    }

    user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        playerRoles: user.playerRoles,
        groundName: user.groundName
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    // Check if role matches
    if (role && user.role !== role) {
      return res.status(400).json({ msg: 'Invalid role for this account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        playerRoles: user.playerRoles,
        groundName: user.groundName,
        district: user.district,
        village: user.village
      } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
