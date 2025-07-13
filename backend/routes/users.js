const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username email')
      .populate('friendRequests', 'username email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      username: user.username,
      email: user.email,
      friends: user.friends,
      friendRequests: user.friendRequests
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get all users except current user
router.get('/all', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('username email');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 