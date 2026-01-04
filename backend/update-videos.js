require('dotenv').config();
const mongoose = require('mongoose');
const Video = require('./src/models/Video');

const updateVideos = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Update all videos with 'pending' sensitivity to 'safe'
        const result = await Video.updateMany(
            { sensitivityStatus: 'pending' },
            { $set: { sensitivityStatus: 'safe' } }
        );

        console.log(`Updated ${result.modifiedCount} videos to 'safe' status`);

        // Disconnect
        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

updateVideos();
