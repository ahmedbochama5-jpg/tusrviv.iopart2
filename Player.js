const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 15
  },
  socketId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  health: {
    type: Number,
    default: 100
  },
  position: {
    x: { type: Number, default: 400 },
    y: { type: Number, default: 300 }
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', playerSchema);
