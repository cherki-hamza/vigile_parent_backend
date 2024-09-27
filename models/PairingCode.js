const mongoose = require('mongoose');

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const PairingCodeSchema = new mongoose.Schema({
  code: { type: String, default: generateSixDigitCode },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  expiresAt: { type: Date, default: () => Date.now() + 3600000, index: { expires: '1h' } } // Code expires in 1 hour
});

const PairingCode = mongoose.model('PairingCode', PairingCodeSchema);

module.exports = PairingCode;
