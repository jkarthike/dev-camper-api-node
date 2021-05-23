const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateUserDetails,
    updatePassword,
    logout,
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updateUserDetails', protect, updateUserDetails);
router.put('/updatePassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetPassword/:resettoken', resetPassword);

module.exports = router;
