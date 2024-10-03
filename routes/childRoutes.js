const express = require('express');
const {
  createChild,
  getChildren,
  updateLocation,
  generatePairingCode,
  pairDevice,
  loginAndSendOTP,
  verifyOTPAndPairDevice,
  updatePlayProtectStatus,
  updateAccessibilityStatus,
  updateSupervisionStatus,
  updateNotificationAccessStatus,
  updateAdministratorAccessStatus,
  updateDataAccessStatus,
  updateBatteryOptimizationStatus, 
  getChildById,
  verifyPairingCode,
  updateDeviceName,
  getChildrenByEmail,
  checkPairingCodeStatus,
  deleteChild,
  editChild,
  getChildByParentEmail,
  updateChildNameByParentEmail,
  getChildrensById
} = require('../controllers/childController');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/login-and-send-otp', loginAndSendOTP);
router.post('/verify-otp-and-pair-device', verifyOTPAndPairDevice);
router.post('/', auth, createChild);
router.get('/', auth, getChildren);
router.put('/:id/location', auth, updateLocation);
router.post('/generate-pairing-code', auth, generatePairingCode);
router.post('/pair-device', pairDevice);
router.put('/:childId/play-protect-status', auth, updatePlayProtectStatus);
router.put('/:childId/accessibility-status', auth, updateAccessibilityStatus);
router.put('/:childId/supervision-status', auth, updateSupervisionStatus);
router.put('/:childId/notification-access-status', auth, updateNotificationAccessStatus);
router.put('/:childId/administrator-access-status', auth, updateAdministratorAccessStatus);
router.put('/:childId/data-access-status', auth, updateDataAccessStatus);
router.put('/:childId/battery-optimization-status', auth, updateBatteryOptimizationStatus);
router.get('/:id', auth, getChildById);
router.post('/verify-pairing-code', verifyPairingCode);
router.put('/:childId/update-device-name', auth, updateDeviceName);
router.post('/children-by-email', getChildrenByEmail);
router.post('/check-pairing-code-status', checkPairingCodeStatus);
router.delete('/:childId', auth, deleteChild); 
router.put('/:childId/update-name', auth, editChild);
router.post('/get-child-by-parent-email', getChildByParentEmail);
router.put('/update-child-name-by-parent-email', updateChildNameByParentEmail);

// route for get childrens by by parentId
router.get('/childrens/:parentId', getChildrensById);



module.exports = router;
