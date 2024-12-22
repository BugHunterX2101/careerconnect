require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const mongoose = require('mongoose');

// Import models
const User = require('./models/User');
const Job = require('./models/Job');
const Quiz = require('./models/Quiz');

const app = express();

// Enhanced CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log environment variables (without sensitive data)
console.log('Environment:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('JWT Secret exists:', !!process.env.JWT_SECRET);

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
    try {
        // Check if we're already trying to connect
        if (mongoose.connection.readyState === 2) {
            console.log('Connection is already in progress');
            return next();
        }

        // If disconnected, try to connect
        if (mongoose.connection.readyState !== 1) {
            console.log('Current connection state:', mongoose.connection.readyState);
            console.log('Attempting to connect to MongoDB...');
            await connectDB();
        }

        // Verify connection after attempt
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Failed to establish database connection');
        }

        next();
    } catch (error) {
        console.error('Database middleware error:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });

        // Send appropriate error response
        res.status(500).json({ 
            message: 'Database connection error', 
            error: process.env.NODE_ENV === 'development' 
                ? error.message 
                : 'Internal server error',
            details: process.env.NODE_ENV === 'development' 
                ? {
                    connectionState: mongoose.connection.readyState,
                    errorName: error.name,
                    errorType: error.constructor.name
                }
                : undefined
        });
    }
});

// Health check route with detailed status
app.get('/', (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
    };

    res.json({ 
        message: 'CareerConnect API is running',
        status: 'healthy',
        database: {
            status: statusMap[dbStatus],
            state: dbStatus,
            name: mongoose.connection.name,
            host: mongoose.connection.host
        },
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Database test route
app.get('/api/test-db', async (req, res) => {
    try {
        // Test database connection
        const dbState = mongoose.connection.readyState;
        const dbInfo = {
            state: dbState,
            status: ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'][dbState],
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            models: Object.keys(mongoose.models)
        };

        // Test database operation
        const stats = await mongoose.connection.db.stats();
        
        res.json({
            success: true,
            message: 'Database connection test successful',
            connection: dbInfo,
            statistics: {
                collections: stats.collections,
                indexes: stats.indexes,
                avgObjSize: stats.avgObjSize,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize
            },
            environmentVariables: {
                nodeEnv: process.env.NODE_ENV,
                mongoDbUriExists: !!process.env.MONGODB_URI,
                jwtSecretExists: !!process.env.JWT_SECRET
            }
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            success: false,
            message: 'Database test failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            connectionState: mongoose.connection.readyState,
            details: process.env.NODE_ENV === 'development' ? {
                errorName: error.name,
                errorCode: error.code,
                errorType: error.constructor.name
            } : undefined
        });
    }
});

// API routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Input validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide all required fields' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email or username' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: role || 'jobseeker'
        });

        await user.save();

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: user._id
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide email and password' 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Login successful',
            username: user.username,
            role: user.role,
            userId: user._id
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            message: 'CORS error: Origin not allowed',
            error: err.message
        });
    }

    // Handle other errors
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel
module.exports = app;

// Start server if not in Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
