const adminMiddleware = (req, res, next) => {
    if(req.userInfo.role !== 'admin'){
        return res.status(403).json({
            success: false,
            message: 'User is not a admin. so cannot logged in.'
        });
    }
    next();
}

module.exports = adminMiddleware;