const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Try to find FFmpeg in system PATH first
let ffmpegAvailable = false;
try {
    // Check if ffmpeg is in PATH
    execSync('ffmpeg -version', { stdio: 'ignore' });
    ffmpegAvailable = true;
    console.log('✓ FFmpeg found in system PATH');
} catch (error) {
    // Try hardcoded path as fallback
    const FFMPEG_PATH = 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin\\ffmpeg.exe';
    if (fs.existsSync(FFMPEG_PATH)) {
        ffmpeg.setFfmpegPath(FFMPEG_PATH);
        ffmpegAvailable = true;
        console.log('✓ FFmpeg found at:', FFMPEG_PATH);
    } else {
        console.warn('⚠ FFmpeg not found! Thumbnail generation will be disabled.');
        console.warn('  Install FFmpeg: https://ffmpeg.org/download.html');
        console.warn('  Or run: winget install Gyan.FFmpeg');
    }
}

const generateThumbnail = (filePath, outputDir) => {
    return new Promise((resolve, reject) => {
        // Check if FFmpeg is available
        if (!ffmpegAvailable) {
            console.log('⚠ Skipping thumbnail generation - FFmpeg not available');
            return resolve(null);
        }

        try {
            const timestamp = Date.now();
            const filename = `thumb-${timestamp}-${path.basename(filePath, path.extname(filePath))}.png`;
            const outputPath = path.join(outputDir, 'thumbnails');
            const fullThumbnailPath = path.join(outputPath, filename);

            // Ensure thumbnail directory exists
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
                console.log('Created thumbnail directory:', outputPath);
            }

            const absoluteInputPath = path.resolve(filePath);

            // Verify input file exists
            if (!fs.existsSync(absoluteInputPath)) {
                console.error('Input video file not found:', absoluteInputPath);
                return resolve(null);
            }

            console.log('Generating thumbnail for:', absoluteInputPath);

            ffmpeg(absoluteInputPath)
                .on('end', () => {
                    // Verify thumbnail was created
                    if (fs.existsSync(fullThumbnailPath)) {
                        const relativePath = path.join(outputDir, 'thumbnails', filename).replace(/\\/g, '/');
                        console.log('✓ Thumbnail generated successfully:', relativePath);
                        resolve(relativePath);
                    } else {
                        console.error('Thumbnail file not found after generation');
                        resolve(null);
                    }
                })
                .on('error', (err) => {
                    console.error('✗ FFmpeg Error:', err.message);
                    resolve(null); // Don't reject, just return null to allow upload to continue
                })
                .screenshots({
                    count: 1,
                    folder: outputPath,
                    filename: filename,
                    timestamps: [1],
                    size: '320x240'
                });
        } catch (error) {
            console.error('Thumbnail generation exception:', error.message);
            resolve(null);
        }
    });
};

const processVideoContent = async (videoId, io) => {
    try {
        const Video = require('../models/Video');
        const video = await Video.findById(videoId);
        if (!video) return;

        video.processingStatus = 'processing';
        await video.save();

        // Emit start
        io.emit('videoProgress', { videoId, status: 'processing', progress: 0 });

        // Simulate analysis stages
        const stages = [
            { progress: 20, message: 'Validating format...' },
            { progress: 50, message: 'Analyzing content...' },
            { progress: 80, message: 'Checking sensitivity...' },
            { progress: 100, message: 'Optimization complete.' }
        ];

        for (const stage of stages) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay between stages
            video.processingProgress = stage.progress;
            await video.save();
            io.emit('videoProgress', {
                videoId,
                status: 'processing',
                progress: stage.progress,
                message: stage.message
            });
        }

        // Determine sensitivity randomly (mock)
        const isFlagged = Math.random() > 0.8; // 20% chance of being flagged
        video.sensitivityStatus = isFlagged ? 'flagged' : 'safe';
        video.processingStatus = 'completed';
        await video.save();

        io.emit('videoProgress', {
            videoId,
            status: 'completed',
            progress: 100,
            sensitivity: video.sensitivityStatus
        });

        console.log(`Video ${videoId} processing complete. Status: ${video.sensitivityStatus}`);
    } catch (err) {
        console.error('Processing error:', err);
        // update status to failed...
    }
};

module.exports = {
    generateThumbnail,
    processVideoContent
};
