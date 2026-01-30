const express = require('express');
const {registerUser, loginUser, changePassword} = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/auth-middleware');

//router
const router = express.Router();

//all routes are related to authentication and authorization.
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/change-password', authMiddleware, changePassword)

module.exports = router;