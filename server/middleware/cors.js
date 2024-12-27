const cors = require('cors');

// List of allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'https://careerconnect-7af1-4phdqp9m-vedit-agrawals-projects.vercel.app',
    'https://careerconnect-client.vercel.app',
    'https://careerconnect-server-7af1-4phdqp9m-vedit-agrawals-projects.vercel.app'
];

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow all origins in development
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Additional headers middleware
const additionalHeaders = (req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
        res.header('Access-Control-Allow-Origin', '*');
    }
    // In production, only allow specific origins
    else if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
};

// Debug middleware to log CORS issues
const debugCors = (req, res, next) => {
    console.log('CORS Debug:', {
        origin: req.headers.origin,
        method: req.method,
        path: req.path,
        headers: req.headers
    });
    next();
};

module.exports = {
    corsMiddleware,
    additionalHeaders,
    allowedOrigins,
    debugCors
};

