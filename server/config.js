module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/careerconnect',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    port: process.env.PORT || 5000
}; 