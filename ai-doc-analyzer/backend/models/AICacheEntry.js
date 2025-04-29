const mongoose = require('mongoose');

const AICacheEntrySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AICacheEntry', AICacheEntrySchema);