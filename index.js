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

// Log environment setup
console.log('Starting server with configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('- JWT Secret exists:', !!process.env.JWT_SECRET);

// Initial database connection
(async () => {
    try {
        await connectDB();
        console.log('Initial database connection successful');
    } catch (error) {
        console.error('Initial database connection failed:', error.message);
    }
})();

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
    try {
        // Skip database connection for health check
        if (req.path === '/') {
            return next();
        }

        // If already connected, proceed
        if (mongoose.connection.readyState === 1) {
            return next();
        }

        // If connecting, wait briefly then proceed
        if (mongoose.connection.readyState === 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (mongoose.connection.readyState === 1) {
                return next();
            }
        }

        // Attempt to connect
        console.log('Attempting database connection for request:', req.path);
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', {
            path: req.path,
            method: req.method,
            error: error.message,
            stack: error.stack
        });

        res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check route
app.get('/', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            status: stateMap[dbState],
            state: dbState,
            name: mongoose.connection.name,
            host: mongoose.connection.host
        },
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database test route
app.get('/api/test-db', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected, attempting connection...');
            await connectDB();
        }

        const stats = await mongoose.connection.db.stats();
        
        res.json({
            status: 'ok',
            connection: {
                state: mongoose.connection.readyState,
                host: mongoose.connection.host,
                name: mongoose.connection.name,
                readyState: mongoose.connection.readyState
            },
            stats: {
                collections: stats.collections,
                documents: stats.objects,
                indexes: stats.indexes
            }
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists'
            });
        }

        const user = new User({ username, email, password, role: role || 'jobseeker' });
        await user.save();

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: { userId: user._id }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing credentials'
            });
        }

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        res.json({
            status: 'success',
            data: {
                userId: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});

// Export for Vercel
module.exports = app;

// Start server if not in production
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
