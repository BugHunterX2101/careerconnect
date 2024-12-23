require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();

// CORS configuration
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide username, email and password'
            });
        }

        // Create user
        const user = new User({
            username,
            email,
            password
        });

        // Save user
        await user.save();

        // Return success
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'Username or email already exists'
            });
        }

        res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Return success
        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                userId: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
    try {
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
            environment: process.env.NODE_ENV || 'development',
            config: {
                mongodb_uri_exists: !!process.env.MONGODB_URI,
                jwt_secret_exists: !!process.env.JWT_SECRET
            }
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Database connection test failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    
    res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        path: req.path
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
