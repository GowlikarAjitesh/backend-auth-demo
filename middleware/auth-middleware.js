const jwt = require('jsonwebtoken');
const jwtSecretKey = process.env.JWT_SECRET_KEY;
const authMiddleware = (req, res, next) => {
    // console.log("Auth Middleware");

    try {
        const authHeaders = req.headers['authorization'];
        // console.log(authHeaders);

        const token = authHeaders && authHeaders.split(" ")[1];
        // console.log(token);
        if(!token){
            return res.status(400).json({
                success: false,
                message: 'Authentication failed. No Token is given'
            });
        }

        //decode the token
        const decodedTokenInfo = jwt.verify(token, jwtSecretKey);
        console.log("decoded token = ", decodedTokenInfo)
        if(!decodedTokenInfo){
            return res.status(400).json({
                success: false,
                message: 'Authentication failed. Invalid Token is given'
            });
        }
        req.userInfo = decodedTokenInfo;
        console.log(req.userInfo);



        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong'
        })
    }
}

module.exports = authMiddleware;