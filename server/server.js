const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

const app = express();

// Set strict query for Mongoose
mongoose.set('strictQuery', true);

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5500',
        'https://careerconnect-7af1-qc1do9dsa-vedit-agrawals-projects.vercel.app',
        'https://careerconnect-client.vercel.app',
        'https://careerconnect.vercel.app',
        'https://careerconnect-server-qc1do9dsa-vedit-agrawals-projects.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With']
};

// Apply CORS before any routes
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    next();
});

// Auth middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        // Add your token verification logic here
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Health check endpoint for Vercel
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ message: 'API is working' });
});

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes with auth middleware
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', authMiddleware, require('./routes/profile'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something broke!',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Handle 404 errors
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.path);
    res.status(404).json({
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
        availableRoutes: [
            '/api/auth/login',
            '/api/auth/register',
            '/api/profile',
            '/api/profile/education',
            '/api/profile/experience',
            '/api/profile/skills',
            '/health',
            '/api/test'
        ]
    });
});

// Export for Vercel
module.exports = app;

// Start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} 