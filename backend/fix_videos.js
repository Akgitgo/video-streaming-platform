const mongoose = require('mongoose');
const Video = require('./src/models/Video');
const { generateThumbnail, processVideoContent } = require('./src/services/videoProcessor');
require('dotenv').config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const videos = await Video.find({ thumbnailPath: { $in: [null, ''] } });
        console.log(`Found ${videos.length} videos missing thumbnails`);

        for (const video of videos) {
            console.log(`Processing video: ${video.title} (${video._id})`);

            // Try generating thumbnail if missing
            if (!video.thumbnailPath) {
                console.log('Generating thumbnail...');
                const thumbnail = await generateThumbnail(video.videoUrl, 'uploads/');
                if (thumbnail) {
                    video.thumbnailPath = thumbnail.replace(/\\/g, "/");
                    await video.save();
                    console.log('Thumbnail generated and saved:', thumbnail);
                } else {
                    console.log('Thumbnail generation failed');
                }
            }

            // We don't have 'io' here easily without starting server, 
            // but we can test the data updates
            video.processingStatus = 'completed';
            video.sensitivityStatus = 'safe';
            video.processingProgress = 100;
            await video.save();
            console.log('Video marked as completed');
        }

        await mongoose.connection.close();
        console.log('Done');
    } catch (err) {
        console.error(err);
    }
};

test();
