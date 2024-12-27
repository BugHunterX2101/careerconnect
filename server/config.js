require('dotenv').config();

const config = {
    // MongoDB Configuration
    mongoURI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerconnect',
    mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4, skip trying IPv6
        maxPoolSize: 10,
        retryWrites: true,
        retryReads: true
    },

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: '24h',

    // Server Configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    // CORS Configuration
    corsOrigins: [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://127.0.0.1:5500',
        'http://127.0.0.1:3000',
        'https://careerconnect-7af1-4phdqp9m-vedit-agrawals-projects.vercel.app',
        'https://careerconnect-client.vercel.app',
        'https://careerconnect-server-7af1-4phdqp9m-vedit-agrawals-projects.vercel.app'
    ],

    // Email Configuration (if needed)
    emailService: process.env.EMAIL_SERVICE,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }
};

// Validate required configurations
const requiredEnvVars = ['JWT_SECRET'];
if (process.env.NODE_ENV === 'production') {
    requiredEnvVars.push('MONGODB_URI');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing required environment variables in production');
    }
}

module.exports = config;