const express = require('express');
const mongoose = require('mongoose');
const { corsMiddleware, additionalHeaders, debugCors } = require('./middleware/cors');
const config = require('./config');

const app = express();

// Set strict query for Mongoose
mongoose.set('strictQuery', true);

// Debug middleware
app.use(debugCors);

// Apply CORS middleware
app.use(corsMiddleware);
app.use(additionalHeaders);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
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

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB Connected');
    // Start server if not in Vercel environment
    if (process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Export for Vercel
module.exports = app;

