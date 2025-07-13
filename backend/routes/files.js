const express = require('express');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const File = require('../models/File');
const AccessGraph = require('../models/AccessGraph');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// find all users within access depth
async function bfsAccess(ownerId, depth) {
  const visited = new Set();
  const queue = [[ownerId, 0]];
  visited.add(ownerId.toString());
  while (queue.length) {
    const [userId, d] = queue.shift();
    if (d >= depth) continue;
    const user = await User.findById(userId).select('friends');
    for (const friendId of user.friends) {
      const fid = friendId.toString();
      if (!visited.has(fid)) {
        visited.add(fid);
        queue.push([fid, d + 1]);
      }
    }
  }
  return Array.from(visited);
}

// upload new file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { accessDepth } = req.body;
    if (!req.file || accessDepth === undefined) return res.status(400).json({ message: 'File and accessDepth required' });
    
    const fileDoc = new File({
      filename: req.file.originalname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      owner: req.user.id,
      accessDepth: Number(accessDepth),
      cloudinaryUrl: req.file.path,
      cloudinaryPublicId: req.file.filename
    });
    await fileDoc.save();
    // give owner access with hop 0
    await AccessGraph.create({ file: fileDoc._id, authorizedUsers: [{ user: req.user.id, hop: 0, parent: null }] });
    res.status(201).json({ message: 'File uploaded', fileId: fileDoc._id });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// share file with friends
router.post('/:fileId/share', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { friends } = req.body;
    if (!Array.isArray(friends)) return res.status(400).json({ message: 'Friends required' });
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    // get access graph
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access) return res.status(404).json({ message: 'Access graph not found' });
    // check sharer's hop level
    const sharerEntry = access.authorizedUsers.find(u => u.user.toString() === req.user.id);
    if (!sharerEntry) return res.status(403).json({ message: 'You do not have access to share this file' });
    // check hop limit
    if (sharerEntry.hop >= file.accessDepth) return res.status(403).json({ message: 'You cannot share this file (hop limit reached)' });
    // find all ancestors to prevent loops
    let ancestorIds = new Set();
    let currentUserId = req.user.id;
    while (true) {
      const entry = access.authorizedUsers.find(u => u.user.toString() === currentUserId);
      if (!entry) break;
      ancestorIds.add(entry.user.toString());
      if (!entry.parent) break;
      currentUserId = entry.parent.toString();
    }
    let updated = false;
    for (const friendId of friends) {
      // skip if already has access
      if (access.authorizedUsers.some(u => u.user.toString() === friendId)) continue;
      // skip owner, self, or ancestors
      if (friendId === file.owner.toString() || friendId === req.user.id || ancestorIds.has(friendId)) continue;
      // check hop limit
      const newHop = sharerEntry.hop + 1;
      if (newHop <= file.accessDepth) {
        access.authorizedUsers.push({ user: friendId, hop: newHop, parent: req.user.id });
        updated = true;
      }
    }
    if (updated) await access.save();
    res.json({ message: 'File shared', authorizedUsers: access.authorizedUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// download file
router.get('/:fileId/download', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access || !access.authorizedUsers.some(u => u.user.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) return res.status(404).json({ message: 'File not found' });
    
    // Redirect to Cloudinary URL for download
    res.redirect(fileDoc.cloudinaryUrl);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get access list for file
router.get('/:fileId/access-list', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId).populate('owner', 'username email');
    if (!file) return res.status(404).json({ message: 'File not found' });
    const access = await AccessGraph.findOne({ file: fileId })
      .populate('authorizedUsers.user', 'username email')
      .populate('authorizedUsers.parent', 'username email');
    if (!access) return res.status(404).json({ message: 'Access graph not found' });

    // file info
    const fileMeta = {
      _id: file._id,
      originalname: file.originalname,
      owner: file.owner,
      mimetype: file.mimetype,
      size: file.size,
      accessDepth: file.accessDepth
    };

    // owner sees full graph, others see their path
    if (file.owner._id?.toString() === req.user.id || file.owner.toString() === req.user.id) {
      return res.json({ file: fileMeta, authorizedUsers: access.authorizedUsers });
    }

    // find path from owner to current user
    let path = [];
    let currentUserId = req.user.id;
    while (true) {
      const entry = access.authorizedUsers.find(u => (u.user._id?.toString?.() || u.user.toString()) === currentUserId);
      if (!entry) break;
      path.push(entry);
      if (!entry.parent) break;
      currentUserId = entry.parent._id ? entry.parent._id.toString() : entry.parent.toString();
    }
    path = path.reverse();
    res.json({ file: fileMeta, authorizedUsers: path });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get user's uploaded files
router.get('/my', auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get files shared with user
router.get('/shared', auth, async (req, res) => {
  try {
    const accessEntries = await AccessGraph.find({ 'authorizedUsers.user': req.user.id }).populate('file');
    const files = await Promise.all(accessEntries
      .map(async entry => {
        if (!entry.file) return null;
        if (entry.file.owner.toString() === req.user.id) return null;
        const owner = await User.findById(entry.file.owner).select('username email');
        return { ...entry.file.toObject(), owner };
      })
    );
    res.json({ files: files.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// find access path for user
router.get('/:fileId/why/:userId', auth, async (req, res) => {
  try {
    const { fileId, userId } = req.params;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access || !access.authorizedUsers.some(u => u.user.toString() === userId)) {
      return res.status(403).json({ message: 'User does not have access' });
    }
    // trace path from user to owner
    let path = [];
    let currentUserId = userId;
    while (true) {
      const entry = access.authorizedUsers.find(u => u.user.toString() === currentUserId);
      if (!entry) break;
      path.push(entry.user);
      if (!entry.parent) break;
      currentUserId = entry.parent.toString();
    }
    // reverse to show owner to user path
    path = path.reverse();
    // get user details
    const users = await User.find({ _id: { $in: path } }).select('username email');
    const pathUsers = path.map(id => users.find(u => u._id.toString() === id.toString()));
    res.json({ path: pathUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// delete file (owner only)
router.delete('/:fileId', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      console.error(`[DELETE /files/${fileId}] File not found`);
      return res.status(404).json({ message: 'File not found' });
    }
    if (file.owner.toString() !== req.user.id) {
      console.error(`[DELETE /files/${fileId}] Permission denied: user ${req.user.id} is not the owner`);
      return res.status(403).json({ message: 'Only the owner can delete this file' });
    }
    // delete file from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId);
    } catch (cloudinaryErr) {
      console.error('Error deleting from Cloudinary:', cloudinaryErr);
    }

    // send email notifications in background
    const access = await AccessGraph.findOne({ file: fileId });
    if (access) {
      // get all users except owner
      const userIds = access.authorizedUsers
        .map(entry => entry.user.toString())
        .filter(userId => userId !== req.user.id);
      
      // send emails without waiting
      if (userIds.length > 0) {
        (async () => {
          try {
            const users = await User.find({ _id: { $in: userIds } });
            const emails = users.map(u => u.email);
            if (emails.length > 0) {
              // get owner info
              const ownerUser = await User.findById(req.user.id);
              // setup email
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_PASS,
                },
              });
              const mailOptions = {
                from: process.env.GMAIL_USER,
                to: emails,
                subject: 'File Deleted Notification',
                text: `A file you had access to ("${file.originalname}") was deleted by the owner (${ownerUser.username}, ${ownerUser.email}) and is no longer accessible.`,
              };
              await transporter.sendMail(mailOptions);
              console.log(`[DELETE /files/${fileId}] Notification emails sent to ${emails.length} users`);
            }
          } catch (err) {
            console.error(`[DELETE /files/${fileId}] Error sending notification emails:`, err);
          }
        })();
      }
    }

    // remove from database
    try {
      await File.deleteOne({ _id: fileId });
      await AccessGraph.deleteOne({ file: fileId });
    } catch (dbErr) {
      console.error(`[DELETE /files/${fileId}] Error deleting from database:`, dbErr);
      return res.status(500).json({ message: 'Error deleting file from database' });
    }
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error(`[DELETE /files/:fileId] Unexpected server error:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get user's hop level for file
router.get('/:fileId/my-hop', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access) return res.status(404).json({ message: 'Access graph not found' });
    const entry = access.authorizedUsers.find(u => u.user.toString() === req.user.id);
    if (!entry) return res.status(404).json({ message: 'You do not have access to this file' });
    res.json({ hop: entry.hop });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get access graph edges
router.get('/:fileId/access-edges', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access) return res.status(404).json({ message: 'Access graph not found' });
    // create edges from parent to child
    const edges = access.authorizedUsers
      .filter(u => u.parent) // skip owner
      .map(u => ({ from: u.parent.toString(), to: u.user.toString() }));
    res.json({ edges });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// revoke access for user and downstream
router.delete('/:fileId/revoke', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.owner.toString() === req.user.id) {
      return res.status(403).json({ message: 'Owner must use the main delete endpoint' });
    }
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access) return res.status(404).json({ message: 'Access graph not found' });
    // find current user's entry
    const myEntry = access.authorizedUsers.find(u => u.user.toString() === req.user.id);
    if (!myEntry) return res.status(403).json({ message: 'You do not have access to this file' });
    // find all users to remove (BFS from current user)
    const toRemove = new Set([req.user.id]);
    const queue = [req.user.id];
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
    res.json({ message: 'Access revoked for you and your downstream recipients.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get full access list (admin view)
router.get('/:fileId/full-access-list', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await AccessGraph.findOne({ file: fileId })
      .populate('authorizedUsers.user', 'username email');
    if (!access) return res.status(404).json({ message: 'Access graph not found' });

    res.json({ authorizedUsers: access.authorizedUsers });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 