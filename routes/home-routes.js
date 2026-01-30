const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');

const router = express.Router();

router.get('/welcome', authMiddleware, (req, res) => {
    const userData = req.userInfo;
    res.json({
        message: 'Welcome to Home Page',
        data: userData,
    })
})

module.exports = router;