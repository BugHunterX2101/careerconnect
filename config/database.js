const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 30000,
            keepAlive: true,
            maxPoolSize: 50,
            retryWrites: true,
            w: 'majority'
        };

        const db = await mongoose.connect(process.env.MONGODB_URI, options);
        isConnected = db.connections[0].readyState === 1;
        console.log('Connected to MongoDB Atlas successfully');

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

        return db;
    } catch (err) {
        console.error('MongoDB connection error:', err);
        isConnected = false;
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