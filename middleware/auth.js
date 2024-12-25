const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Add user info to request
        req.user = {
            userId: decoded.userId
        };
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};

module.exports = auth; 