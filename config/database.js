const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        // Log the MongoDB URI (without sensitive data)
        const maskedUri = process.env.MONGODB_URI 
            ? process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
            : 'MongoDB URI is not defined';
        console.log('Connecting to MongoDB:', maskedUri);

        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4,
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            maxPoolSize: 50,
            minPoolSize: 10,
            retryWrites: true,
            w: 'majority',
            maxIdleTimeMS: 60000,
            connectTimeoutMS: 20000
        };

        // Clear any existing connections
        if (mongoose.connection.readyState !== 0) {
            console.log('Closing existing MongoDB connection');
            await mongoose.connection.close();
        }

        const db = await mongoose.connect(process.env.MONGODB_URI, options);
        isConnected = db.connections[0].readyState === 1;
        
        if (isConnected) {
            console.log('Connected to MongoDB Atlas successfully');
            console.log('Database Name:', db.connection.name);
            console.log('Connection State:', db.connection.readyState);
            console.log('MongoDB Version:', db.connection.serverConfig.description.version);
        }

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
            isConnected = true;
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
            isConnected = false;
            // Attempt to reconnect
            setTimeout(() => {
                if (!isConnected) {
                    console.log('Attempting to reconnect to MongoDB...');
                    connectDB();
                }
            }, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            isConnected = false;
            // Attempt to reconnect
            setTimeout(() => {
                if (!isConnected) {
                    console.log('Attempting to reconnect to MongoDB...');
                    connectDB();
                }
            }, 5000);
        });

        return db;
    } catch (err) {
        console.error('MongoDB connection error details:', {
            message: err.message,
            code: err.code,
            name: err.name,
            stack: err.stack
        });
        isConnected = false;
        
        // Check for specific error types
        if (err.name === 'MongoServerSelectionError') {
            console.error('Could not connect to any MongoDB server');
        } else if (err.name === 'MongoNetworkError') {
            console.error('Network error occurred while connecting to MongoDB');
        }
        
        throw err;
    }
};

// Handle graceful shutdown
if (process.env.NODE_ENV !== 'production') {
    process.on('SIGINT', async () => {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
}

module.exports = connectDB; 