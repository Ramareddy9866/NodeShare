const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const AccessGraph = require('../models/AccessGraph');

const router = express.Router();

// send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ message: 'Recipient required' });
    if (toUserId === req.user.id) return res.status(400).json({ message: 'Cannot friend yourself' });
    const fromUser = await User.findById(req.user.id);
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: 'User not found' });
    if (fromUser.friends.includes(toUserId)) return res.status(400).json({ message: 'Already friends' });
    if (toUser.friendRequests.includes(fromUser._id)) return res.status(400).json({ message: 'Request already sent' });
    toUser.friendRequests.push(fromUser._id);
    await toUser.save();
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// accept friend request
router.post('/accept', auth, async (req, res) => {
  try {
    const { fromUserId } = req.body;
    if (!fromUserId) return res.status(400).json({ message: 'Sender required' });
    const toUser = await User.findById(req.user.id);
    const fromUser = await User.findById(fromUserId);
    if (!fromUser) return res.status(404).json({ message: 'User not found' });
    if (!toUser.friendRequests.includes(fromUserId)) return res.status(400).json({ message: 'No request from this user' });
    // add each other as friends
    toUser.friends.push(fromUserId);
    fromUser.friends.push(toUser._id);
    // remove request
    toUser.friendRequests = toUser.friendRequests.filter(id => id.toString() !== fromUserId);
    await toUser.save();
    await fromUser.save();
    res.json({ message: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// remove friend
router.post('/remove', auth, async (req, res) => {
  try {
    const { friendId, revokeAccess } = req.body;
    if (!friendId) return res.status(400).json({ message: 'Friend ID required' });
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);
    if (!friend) return res.status(404).json({ message: 'Friend not found' });
    // remove from friends list
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user.id);
    await user.save();
    await friend.save();
    if (revokeAccess) {
      // remove friend's access to files shared by user
      const accessGraphs = await AccessGraph.find({ 'authorizedUsers.user': req.user.id });
      for (const access of accessGraphs) {
        // check if friend is direct child of user
        const isDirectChild = access.authorizedUsers.some(u => u.user.toString() === friendId && u.parent && u.parent.toString() === req.user.id);
        if (!isDirectChild) continue;
        // remove friend and all downstream users
        const toRemove = new Set([friendId]);
        const queue = [friendId];
        while (queue.length) {
          const parentId = queue.shift();
          for (const entry of access.authorizedUsers) {
            if (entry.parent && entry.parent.toString() === parentId && !toRemove.has(entry.user.toString())) {
              toRemove.add(entry.user.toString());
              queue.push(entry.user.toString());
            }
          }
        }
        // remove all found users
        access.authorizedUsers = access.authorizedUsers.filter(u => !toRemove.has(u.user.toString()));
        await access.save();
      }
    }
    res.json({ message: 'Friend removed' + (revokeAccess ? ' and access revoked.' : '.') });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 