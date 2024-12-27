const cors = require('cors');

// List of allowed origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'https://careerconnect-7af1-jonwailh3-vedit-agrawals-projects.vercel.app',
    'https://careerconnect-client.vercel.app',
    'https://careerconnect-server-7af1-jonwailh3-vedit-agrawals-projects.vercel.app'
];

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
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
    
    // Set CORS headers
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
};

module.exports = {
    corsMiddleware,
    additionalHeaders,
    allowedOrigins
};

