const mongoose = require('mongoose');
const Video = require('./src/models/Video');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();

// Set ffmpeg path
const FFMPEG_PATH = 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8jbd8420dxl7m\\ffmpeg-7.1-full_build\\bin\\ffmpeg.exe';
ffmpeg.setFfmpegPath(FFMPEG_PATH);

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const video = await Video.findOne({ thumbnailPath: { $in: [null, ''] } });
        if (!video) {
            console.log('No videos missing thumbnails');
            return await mongoose.connection.close();
        }

        console.log('Testing video:', JSON.stringify(video, null, 2));

        const absoluteVideoPath = path.resolve(video.videoUrl);
        console.log('Absolute video path:', absoluteVideoPath);
        console.log('File exists:', fs.existsSync(absoluteVideoPath));

        if (!fs.existsSync(absoluteVideoPath)) {
            console.log('Searching for file in uploads...');
            const filename = path.basename(video.videoUrl);
            const altPath = path.join(__dirname, 'uploads', filename);
            console.log('Alternative path:', altPath);
            console.log('Alt file exists:', fs.existsSync(altPath));
            if (fs.existsSync(altPath)) {
                video.videoUrl = altPath;
            }
        }

        const outputDir = path.join(__dirname, 'uploads', 'thumbnails');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const thumbName = `test-${Date.now()}.png`;
        const thumbPath = path.join(outputDir, thumbName);

        console.log('Attempting FFmpeg to:', thumbPath);

        ffmpeg(path.resolve(video.videoUrl))
            .on('end', async () => {
                console.log('FFmpeg Success');
                video.thumbnailPath = `uploads/thumbnails/${thumbName}`;
                await video.save();
                console.log('Updated video doc');
                process.exit(0);
            })
            .on('error', (err) => {
                console.log('FFmpeg Error:', err.message);
                process.exit(1);
            })
            .screenshots({
                count: 1,
                folder: outputDir,
                filename: thumbName,
                timestamps: [1],
                size: '320x240'
            });

    } catch (err) {
        console.error('Script error:', err);
    }
};

test();
