const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
    try {
        if (isConnected) {
            console.log('Using existing database connection');
            return;
        }

        if (connectionAttempts >= MAX_RETRIES) {
            console.error('Max connection attempts reached');
            throw new Error('Failed to connect to database after multiple attempts');
        }

        connectionAttempts++;

        // Log connection attempt
        console.log(`Connection attempt ${connectionAttempts} of ${MAX_RETRIES}`);
        console.log('Environment:', process.env.NODE_ENV);

        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        // Log masked URI for debugging
        const maskedUri = MONGODB_URI.replace(
            /mongodb\+srv:\/\/([^:]+):([^@]+)@/,
            'mongodb+srv://***:***@'
        );
        console.log('Connecting to MongoDB:', maskedUri);

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            autoIndex: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority',
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 30000
        };

        // Clear any existing connections
        if (mongoose.connection.readyState !== 0) {
            console.log('Closing existing MongoDB connection');
            await mongoose.connection.close();
        }

        const conn = await mongoose.connect(MONGODB_URI, options);
        isConnected = conn.connections[0].readyState === 1;

        if (isConnected) {
            console.log('MongoDB Connected Successfully');
            connectionAttempts = 0; // Reset attempts on successful connection
            
            // Log connection details
            const { host, port, name } = conn.connection;
            console.log({
                database: name,
                host: host,
                port: port,
                ready: isConnected
            });

            // Set up connection event handlers
            mongoose.connection.on('connected', () => {
                console.log('Mongoose connected to MongoDB');
                isConnected = true;
            });

            mongoose.connection.on('error', (err) => {
                console.error('Mongoose connection error:', err);
                isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose disconnected from MongoDB');
                isConnected = false;
                // Attempt to reconnect
                if (connectionAttempts < MAX_RETRIES) {
                    console.log('Attempting to reconnect...');
                    setTimeout(() => connectDB(), 5000);
                }
            });

            return conn;
        } else {
            throw new Error('Failed to establish database connection');
        }
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            attempt: connectionAttempts,
            timestamp: new Date().toISOString()
        });

        isConnected = false;

        // If we haven't reached max retries, try again
        if (connectionAttempts < MAX_RETRIES) {
            console.log(`Retrying connection in 5 seconds... (Attempt ${connectionAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return connectDB();
        }

        throw error;
    }
};

// Export connection state checker
const checkConnection = () => ({
    isConnected,
    attempts: connectionAttempts
});

module.exports = connectDB;
module.exports.checkConnection = checkConnection; 