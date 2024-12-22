const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const options = {
            connectTimeoutMS: 10000,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        };

        await mongoose.connect(process.env.MONGODB_URI, options);
        console.log('Connected to MongoDB Atlas successfully');

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected from MongoDB');
            // Attempt to reconnect if not shutting down
            if (mongoose.connection.readyState === 0) {
                console.log('Attempting to reconnect...');
                setTimeout(connectDB, 5000);
            }
        });

        // Handle application termination
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

    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Retry connection after 5 seconds
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB; 