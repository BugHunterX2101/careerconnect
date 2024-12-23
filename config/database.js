const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
    try {
        // Log initial state
        console.log('Current connection state:', {
            isConnected,
            connectionAttempts,
            readyState: mongoose.connection.readyState
        });

        if (isConnected && mongoose.connection.readyState === 1) {
            console.log('Using existing database connection');
            return mongoose.connection;
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

        // Clear any existing connections
        if (mongoose.connection.readyState !== 0) {
            console.log('Closing existing MongoDB connection');
            await mongoose.connection.close();
        }

        // Remove all existing listeners
        mongoose.connection.removeAllListeners();
        
        // Set up connection event listeners before connecting
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
        });

        // Basic connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        console.log('Attempting MongoDB connection with options:', JSON.stringify(options, null, 2));

        // Connect to MongoDB
        const conn = await mongoose.connect(MONGODB_URI, options);
        isConnected = conn.connections[0].readyState === 1;

        if (isConnected) {
            console.log('MongoDB Connected Successfully');
            connectionAttempts = 0; // Reset attempts on successful connection
            
            // Log connection details
            const { host, port, name } = conn.connection;
            console.log('Connection details:', {
                database: name,
                host: host,
                port: port,
                ready: isConnected,
                state: conn.connection.readyState,
                models: Object.keys(conn.models)
            });

            return conn;
        } else {
            throw new Error('Failed to establish database connection');
        }
    } catch (error) {
        console.error('MongoDB connection error:', {
            message: error.message,
            code: error.code,
            name: error.name,
            attempt: connectionAttempts,
            timestamp: new Date().toISOString(),
            stack: error.stack
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
    attempts: connectionAttempts,
    state: mongoose.connection.readyState,
    stateDesc: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
});

module.exports = connectDB;
module.exports.checkConnection = checkConnection; 