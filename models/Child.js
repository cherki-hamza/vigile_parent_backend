const mongoose = require('mongoose');

const ChildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  scanDeviceForSecurity: { type: Boolean, default: false },
  improveHarmfulDetection: { type: Boolean, default: false },
  systemUpdateService: { type: Boolean, default: false },
  allowUsageTracking: { type: Boolean, default: false },
  notificationAccess: {
    systemUpdateService: { type: Boolean, default: false },
    secureFolder: { type: Boolean, default: false },
    sosNotification: { type: Boolean, default: false },
    workspace: { type: Boolean, default: false },
  },
  administratorAccess: { type: Boolean, default: false },
  dataAccess: {
    messages: { type: Boolean, default: false },
    contacts: { type: Boolean, default: false },
    call_log: { type: Boolean, default: false },
    calendar: { type: Boolean, default: false },
    location: { type: Boolean, default: false },
  },
  batteryOptimizationAllowed: { type: Boolean, default: false },
  deviceName: { type: String, default: '' }, 
});

ChildSchema.index({ location: '2dsphere' });

const Child = mongoose.model('Child', ChildSchema);

module.exports = Child;
