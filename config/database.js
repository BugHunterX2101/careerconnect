const mongoose = require('mongoose');

let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

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
        console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            autoIndex: true,
            maxPoolSize: 10,
            minPoolSize: 5
        };

        // Clear any existing connections
        if (mongoose.connection.readyState !== 0) {
            console.log('Closing existing MongoDB connection');
            await mongoose.connection.close();
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
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

            return conn;
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