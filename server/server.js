const express = require('express');
const mongoose = require('mongoose');
const { corsMiddleware, additionalHeaders, debugCors } = require('./middleware/cors');
const config = require('./config');
const rateLimit = require('express-rate-limit');

// Initialize express app
const app = express();

// Set strict query for Mongoose
mongoose.set('strictQuery', true);

// Apply rate limiting
app.use(rateLimit(config.rateLimit));

// Debug middleware
app.use(debugCors);

// Apply CORS middleware
app.use(corsMiddleware);
app.use(additionalHeaders);

// Body parser middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    if (req.method !== 'GET') {
        console.log('Body:', req.body);
    }
    next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));

// Health check endpoint with detailed status
app.get('/health', (req, res) => {
    const status = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        mongodb: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            host: mongoose.connection.host,
            name: mongoose.connection.name
        },
        memory: {
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        },
        uptime: `${Math.round(process.uptime())}s`
    };
    
    const httpStatus = status.mongodb.status === 'connected' ? 200 : 503;
    res.status(httpStatus).json(status);
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.status(200).json({ 
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Error handling for JSON parsing
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parsing Error:', err);
        return res.status(400).json({
            status: 'error',
            message: 'Invalid JSON payload',
            details: err.message
        });
    }
    next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            errors: Object.values(err.errors).map(e => e.message)
        });
    }

    // Handle mongoose duplicate key errors
    if (err.code === 11000) {
        return res.status(400).json({
            status: 'error',
            message: 'Duplicate field value entered',
            field: Object.keys(err.keyPattern)[0]
        });
    }

    // Handle CORS errors
    if (err.message.includes('Not allowed by CORS')) {
        return res.status(403).json({
            status: 'error',
            message: 'CORS Error: Origin not allowed',
            origin: req.headers.origin
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});

// MongoDB connection with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`MongoDB connection attempt ${i + 1} of ${retries}`);
            await mongoose.connect(config.mongoURI, config.mongoOptions);
            console.log('MongoDB Connected Successfully');
            return true;
        } catch (err) {
            console.error('MongoDB connection error:', err);
            if (i === retries - 1) {
                throw err;
            }
            console.log(`Retrying in ${delay/1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

// Server startup with health monitoring
const startServer = async () => {
    try {
        await connectWithRetry();
        
        if (process.env.NODE_ENV !== 'production') {
            const PORT = config.port;
            const server = app.listen(PORT, () => {
                console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
            });

            // Handle server errors
            server.on('error', (error) => {
                console.error('Server error:', error);
                process.exit(1);
            });

            // Graceful shutdown
            process.on('SIGTERM', () => {
                console.log('SIGTERM received. Shutting down gracefully...');
                server.close(() => {
                    console.log('Server closed. Exiting process.');
                    mongoose.connection.close(false, () => {
                        process.exit(0);
                    });
                });
            });
        }
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

// Export for testing and Vercel
module.exports = app;

