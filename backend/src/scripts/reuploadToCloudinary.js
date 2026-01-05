const mongoose = require('mongoose');
const Video = require('../models/Video');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Script to re-upload local videos to Cloudinary
 * This will:
 * 1. Find all videos with local file paths
 * 2. Upload them to Cloudinary
 * 3. Update the database with new URLs
 * 4. Optionally delete local files
 */

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');
    } catch (error) {
        console.error('✗ MongoDB connection failed:', error);
        process.exit(1);
    }
};

const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'video',
            folder: 'video-platform',
            chunk_size: 6000000, // 6MB chunks for large files
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

const reuploadVideos = async (deleteLocal = false) => {
    try {
        // Find all videos with local paths
        const videos = await Video.find({
            videoUrl: { $not: /^https?:\/\// }
        }).populate('uploader', 'username email');

        console.log(`\n📊 Found ${videos.length} videos to migrate\n`);

        if (videos.length === 0) {
            console.log('✓ No videos to migrate!');
            return;
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];
            console.log(`\n[${i + 1}/${videos.length}] Processing: ${video.title}`);
            console.log(`   Current path: ${video.videoUrl}`);

            try {
                // Construct absolute path
                let videoPath = video.videoUrl;
                if (!path.isAbsolute(videoPath)) {
                    videoPath = path.join(__dirname, '../../', videoPath);
                }

                // Check if file exists
                if (!fs.existsSync(videoPath)) {
                    console.log(`   ✗ File not found: ${videoPath}`);
                    failCount++;
                    errors.push({ video: video.title, error: 'File not found' });
                    continue;
                }

                console.log(`   ⏳ Uploading to Cloudinary...`);
                const cloudinaryUrl = await uploadToCloudinary(videoPath);
                console.log(`   ✓ Uploaded: ${cloudinaryUrl}`);

                // Generate Cloudinary thumbnail URL
                const thumbnailUrl = cloudinaryUrl
                    .replace('/upload/', '/upload/w_320,h_240,c_fill/')
                    .replace(/\.(mp4|mov|avi|mkv|webm)$/, '.jpg');

                // Update database
                video.videoUrl = cloudinaryUrl;
                video.thumbnailPath = thumbnailUrl;
                video.processingStatus = 'completed';
                await video.save();

                console.log(`   ✓ Database updated`);
                successCount++;

                // Delete local file if requested
                if (deleteLocal) {
                    try {
                        fs.unlinkSync(videoPath);
                        console.log(`   ✓ Local file deleted`);

                        // Also delete thumbnail if exists
                        if (video.thumbnailPath && !video.thumbnailPath.startsWith('http')) {
                            let thumbPath = video.thumbnailPath;
                            if (!path.isAbsolute(thumbPath)) {
                                thumbPath = path.join(__dirname, '../../', thumbPath);
                            }
                            if (fs.existsSync(thumbPath)) {
                                fs.unlinkSync(thumbPath);
                            }
                        }
                    } catch (deleteErr) {
                        console.log(`   ⚠ Could not delete local file: ${deleteErr.message}`);
                    }
                }

            } catch (error) {
                console.log(`   ✗ Failed: ${error.message}`);
                failCount++;
                errors.push({ video: video.title, error: error.message });
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`✓ Successfully migrated: ${successCount}`);
        console.log(`✗ Failed: ${failCount}`);

        if (errors.length > 0) {
            console.log('\n❌ Errors:');
            errors.forEach(err => {
                console.log(`   - ${err.video}: ${err.error}`);
            });
        }

    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

const main = async () => {
    await connectDB();

    const args = process.argv.slice(2);
    const deleteLocal = args.includes('--delete-local');

    console.log('\n🔄 Video Re-upload Tool\n');

    if (deleteLocal) {
        console.log('⚠️  WARNING: Local files will be DELETED after successful upload!');
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    try {
        await reuploadVideos(deleteLocal);
    } catch (error) {
        console.error('Re-upload failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
};

main();
