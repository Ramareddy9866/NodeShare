const express = require('express');
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const upload = require('../middleware/cloudinaryUpload');
const File = require('../models/File');
const AccessGraph = require('../models/AccessGraph');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

const router = express.Router();

// upload a file and create access graph for it
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

    // adding owner as first authorized user
    await AccessGraph.create({ file: fileDoc._id, authorizedUsers: [{ user: req.user.id, hop: 0, parent: null }] });
    res.status(201).json({ message: 'File uploaded', fileId: fileDoc._id });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// share file with friends (with hop limit)
router.post('/:fileId/share', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { friends } = req.body;

    if (!Array.isArray(friends)) {
      return res.status(400).json({ message: 'Friends required' });
    }

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const access = await AccessGraph.findOne({ file: fileId });
    if (!access) {
      return res.status(404).json({ message: 'Access graph not found' });
    }

    const sharerEntry = access.authorizedUsers.find(
      u => u.user.toString() === req.user.id
    );
    if (!sharerEntry) {
      return res.status(403).json({ message: 'You do not have access to share this file' });
    }

    if (sharerEntry.hop >= file.accessDepth) {
      return res.status(403).json({ message: 'You cannot share this file (hop limit reached)' });
    }

    let updated = false;

    for (const friendId of friends) {
      if (access.authorizedUsers.some(u => u.user.toString() === friendId)) continue;
      if (friendId === file.owner.toString() || friendId === req.user.id) continue;
      const newHop = sharerEntry.hop + 1;

      if (newHop <= file.accessDepth) {
        access.authorizedUsers.push({
          user: friendId,
          hop: newHop,
          parent: req.user.id
        });
        updated = true;
      }
    }

    if (updated) await access.save();

    res.json({ message: 'File shared', authorizedUsers: access.authorizedUsers });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});  

// download link if user has access
router.get('/:fileId/download', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access || !access.authorizedUsers.some(u => u.user.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const fileDoc = await File.findById(fileId);
    if (!fileDoc) return res.status(404).json({ message: 'File not found' });
    res.json({ url: fileDoc.cloudinaryUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const toId = val => (val ? (val._id ? val._id.toString() : val.toString()) : null);

// get access list visible to current user
router.get('/:fileId/access-list', auth, async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId).populate('owner', 'username email');
    if (!file) return res.status(404).json({ message: 'File not found' });

    const access = await AccessGraph.findOne({ file: fileId })
      .populate('authorizedUsers.user', 'username email')
      .populate('authorizedUsers.parent', 'username email');

    if (!access) return res.status(404).json({ message: 'Access graph not found' });

    const fileMeta = {
      _id: file._id,
      originalname: file.originalname,
      owner: file.owner,
      mimetype: file.mimetype,
      size: file.size,
      accessDepth: file.accessDepth
    };

    // owner can see full list
    if (toId(file.owner) === req.user.id) {
      return res.json({ file: fileMeta, authorizedUsers: access.authorizedUsers });
    }

    const authorized = access.authorizedUsers;
    const currentEntry = authorized.find(u => toId(u.user) === req.user.id);
    if (!currentEntry) {
      return res.status(403).json({ message: 'You do not have access to this file' });
    }

    // show only your chain of access (one ancestor + children)
    const visibleSet = new Set();

    if (currentEntry.parent) {
      visibleSet.add(toId(currentEntry.parent));
    }
    visibleSet.add(toId(currentEntry.user));

    const queue = [toId(currentEntry.user)];
    while (queue.length) {
      const parentId = queue.shift();
      for (const entry of authorized) {
        if (toId(entry.parent) === parentId && !visibleSet.has(toId(entry.user))) {
          visibleSet.add(toId(entry.user));
          queue.push(toId(entry.user));
        }
      }
    }

    const visibleUsers = authorized.filter(u => visibleSet.has(toId(u.user)));

    res.json({ file: fileMeta, authorizedUsers: visibleUsers });
  } catch (err) {
    console.error('Error fetching access list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get only files uploaded by me
router.get('/my', auth, async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get files shared with me by others
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

// find who shared a file with a specific user
router.get('/:fileId/sharedBy/:userId', auth, async (req, res) => {
  try {
    const { fileId, userId } = req.params;
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access || !access.authorizedUsers.some(u => u.user.toString() === userId)) {
      return res.status(403).json({ message: 'User does not have access' });
    }

    // get parent of this user
    const sharedBy = access.authorizedUsers.find((u)=>u.user.toString()===userId)?.parent;
    if(!sharedBy) return res.status(404).json({message: 'This user is the owner and was not shared by anyone'});
    const sharedByUser = await User.findById(sharedBy).select('username email');
    if(!sharedByUser) return res.status(404).json({message: 'The user who shared this file was not found'});
    res.json({ sharedBy: sharedByUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// delete file (only owner)
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

    // remove file from cloudinary
    try {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId);
    } catch (cloudinaryErr) {
      console.error('Error deleting from Cloudinary:', cloudinaryErr);
    }

    // notify all users who had access
    const access = await AccessGraph.findOne({ file: fileId });
    if (access) {
      const userIds = access.authorizedUsers
        .map(entry => entry.user.toString())
        .filter(userId => userId !== req.user.id);
      
      if (userIds.length > 0) {
        (async () => {
          try {
            const users = await User.find({ _id: { $in: userIds } });
            const emails = users.map(u => u.email);
            if (emails.length > 0) {
              const ownerUser = await User.findById(req.user.id);
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

    // remove file + access entry from DB
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

// find my hop level for a file
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

// return edges for access graph
router.get('/:fileId/access-edges', auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const access = await AccessGraph.findOne({ file: fileId });
    if (!access) return res.status(404).json({ message: 'Access graph not found' });
    const edges = access.authorizedUsers
      .filter(u => u.parent)
      .map(u => ({ from: u.parent.toString(), to: u.user.toString() }));
    res.json({ edges });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// revoke my access and all who got file from me
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
    const myEntry = access.authorizedUsers.find(u => u.user.toString() === req.user.id);
    if (!myEntry) return res.status(403).json({ message: 'You do not have access to this file' });

    // remove me and my downstream users
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
    access.authorizedUsers = access.authorizedUsers.filter(u => !toRemove.has(u.user.toString()));
    await access.save();
    res.json({ message: 'Access revoked for you and your downstream recipients.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// get full list of all authorized users (owner)
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
