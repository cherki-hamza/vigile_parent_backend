const Child = require('../models/Child');
const PairingCode = require('../models/PairingCode');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

exports.createChild = async (req, res) => {
  const { name, age } = req.body;
  try {
    const child = new Child({ name, age, parentId: req.user.id });
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getChildren = async (req, res) => {
  try {
    const children = await Child.find({ parentId: req.user.id });
    res.json(children);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateLocation = async (req, res) => {
  const { coordinates } = req.body;
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.location = { type: 'Point', coordinates };
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.generatePairingCode = async (req, res) => {
  try {
    let pairingCode = await PairingCode.findOne({ parentId: req.user.id });

    if (pairingCode) {
      // Update the existing pairing code
      pairingCode.code = generateSixDigitCode();
      pairingCode.expiresAt = Date.now() + 3600000; // 1 hour from now
      await pairingCode.save();
    } else {
      // Create a new pairing code
      pairingCode = new PairingCode({ parentId: req.user.id });
      await pairingCode.save();
    }

    res.json({ code: pairingCode.code });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.pairDevice = async (req, res) => {
  const { email, password, code, name, age } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const pairingCode = await PairingCode.findOne({ code, parentId: user.id });

    if (!pairingCode || pairingCode.expiresAt < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired pairing code' });
    }

    const child = new Child({ name, age, parentId: user.id });
    await child.save();

    pairingCode.childId = child.id;
    pairingCode.used = true; // Mark the pairing code as used
    await pairingCode.save();

    res.json({ msg: 'Device paired successfully', child });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.loginAndSendOTP = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    sendEmail(user.email, 'Your OTP Code', `Your OTP code is ${otp}`);

    res.json({ msg: 'OTP sent to email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.verifyOTPAndPairDevice = async (req, res) => {
  const { email, otp, name, age } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const child = new Child({ name, age, parentId: user.id });
    await child.save();

    res.json({ msg: 'Device paired successfully', child });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updatePlayProtectStatus = async (req, res) => {
  const { scanDeviceForSecurity, improveHarmfulDetection } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.scanDeviceForSecurity = scanDeviceForSecurity;
    child.improveHarmfulDetection = improveHarmfulDetection;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateAccessibilityStatus = async (req, res) => {
  const { systemUpdateService } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.systemUpdateService = systemUpdateService;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateSupervisionStatus = async (req, res) => {
  const { allowUsageTracking } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.allowUsageTracking = allowUsageTracking;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateNotificationAccessStatus = async (req, res) => {
  const { systemUpdateService, secureFolder, sosNotification, workspace } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.notificationAccess.systemUpdateService = systemUpdateService;
    child.notificationAccess.secureFolder = secureFolder;
    child.notificationAccess.sosNotification = sosNotification;
    child.notificationAccess.workspace = workspace;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.updateAdministratorAccessStatus = async (req, res) => {
  const { administratorAccess } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.administratorAccess = administratorAccess;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.updateDataAccessStatus = async (req, res) => {
  const { messages, contacts, call_log, calendar, location } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.dataAccess = { messages, contacts, call_log, calendar, location };
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.updateBatteryOptimizationStatus = async (req, res) => {
  const { batteryOptimizationAllowed } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.batteryOptimizationAllowed = batteryOptimizationAllowed;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



exports.getChildById = async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.verifyPairingCode = async (req, res) => {
  const { code, email } = req.body;

  try {
    const parent = await User.findOne({ email });
    if (!parent) {
      return res.status(400).json({ msg: 'Parent not found' });
    }

    const pairingCode = await PairingCode.findOne({ code, parentId: parent._id });

    if (!pairingCode || pairingCode.expiresAt < Date.now()) {
      return res.status(400).json({ msg: 'Invalid or expired pairing code' });
    }

    res.json({ msg: 'Pairing code verified successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.updateDeviceName = async (req, res) => {
  const { deviceName } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    child.deviceName = deviceName;
    await child.save();
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getChildrenByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const parent = await User.findOne({ email });
    if (!parent) {
      return res.status(400).json({ msg: 'Parent not found' });
    }

    const children = await Child.find({ parentId: parent._id });
    res.json(children);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



exports.checkPairingCodeStatus = async (req, res) => {
  const { code } = req.body;
  try {
    const pairingCode = await PairingCode.findOne({ code });

    if (!pairingCode) {
      return res.status(404).json({ msg: 'Pairing code not found' });
    }

    res.json({ used: pairingCode.used });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};



exports.deleteChild = async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    if (child.parentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Child.findByIdAndDelete(req.params.childId);
    res.json({ msg: 'Child deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


exports.editChild = async (req, res) => {
  const { name } = req.body;
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) { 
      return res.status(404).json({ msg: 'Child not found'});
    }

    child.name = name;
    await child.save();

    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}


exports.getChildByParentEmail = async (req, res) => {
  const { email } = req.body;
  
  try {
    const parent = await User.findOne({ email });
    if (!parent) {
      return res.status(400).json({ msg: 'Parent not found' });
    }
    
    const child = await Child.findOne({ parentId: parent._id });
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }
    
    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateChildNameByParentEmail = async (req, res) => {
  const { email, name } = req.body;

  try {
    const parent = await User.findOne({ email });
    if (!parent) {
      return res.status(400).json({ msg: 'Parent not found' });
    }
    
    const child = await Child.findOne({ parentId: parent._id });
    if (!child) {
      return res.status(404).json({ msg: 'Child not found' });
    }

    child.name = name;
    await child.save();

    res.json(child);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
