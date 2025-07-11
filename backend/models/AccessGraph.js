const mongoose = require('mongoose');

const AccessGraphSchema = new mongoose.Schema({
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true, unique: true },
  authorizedUsers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      hop: { type: Number, required: true },
      parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('AccessGraph', AccessGraphSchema); 