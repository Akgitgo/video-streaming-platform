const mongoose = require('mongoose');
const Video = require('../models/Video');
require('dotenv').config();

/**
 * Migration script to handle old videos with local file paths
 * 
 * Options:
 * 1. List all videos with local paths
 * 2. Delete videos with local paths (use with caution!)
 * 3. Mark videos as 'failed' processing status
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

const listLocalVideos = async () => {
    try {
        const videos = await Video.find({
            videoUrl: { $not: /^https?:\/\// }
        }).populate('uploader', 'username email');

        console.log(`\n📊 Found ${videos.length} videos with local file paths:\n`);

        videos.forEach((video, index) => {
            console.log(`${index + 1}. ${video.title}`);
            console.log(`   ID: ${video._id}`);
            console.log(`   Video URL: ${video.videoUrl}`);
            console.log(`   Thumbnail: ${video.thumbnailPath}`);
            console.log(`   Uploader: ${video.uploader?.username || 'Unknown'}`);
            console.log(`   Created: ${video.createdAt}`);
            console.log(`   Status: ${video.processingStatus}`);
            console.log('');
        });

        return videos;
    } catch (error) {
        console.error('Error listing videos:', error);
        throw error;
    }
};

const deleteLocalVideos = async () => {
    try {
        const result = await Video.deleteMany({
            videoUrl: { $not: /^https?:\/\// }
        });

        console.log(`\n✓ Deleted ${result.deletedCount} videos with local file paths`);
        return result;
    } catch (error) {
        console.error('Error deleting videos:', error);
        throw error;
    }
};

const markLocalVideosAsFailed = async () => {
    try {
        const result = await Video.updateMany(
            { videoUrl: { $not: /^https?:\/\// } },
            {
                $set: {
                    processingStatus: 'failed',
                    sensitivityStatus: 'flagged'
                }
            }
        );

        console.log(`\n✓ Marked ${result.modifiedCount} videos as failed`);
        return result;
    } catch (error) {
        console.error('Error marking videos:', error);
        throw error;
    }
};

const main = async () => {
    await connectDB();

    const args = process.argv.slice(2);
    const action = args[0];

    console.log('\n🔧 Video Migration Tool\n');

    try {
        switch (action) {
            case 'list':
                await listLocalVideos();
                break;

            case 'delete':
                console.log('⚠️  WARNING: This will permanently delete all videos with local file paths!');
                console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
                await new Promise(resolve => setTimeout(resolve, 5000));
                await deleteLocalVideos();
                break;

            case 'mark-failed':
                await markLocalVideosAsFailed();
                break;

            default:
                console.log('Usage: node migrateOldVideos.js [action]');
                console.log('\nAvailable actions:');
                console.log('  list         - List all videos with local file paths');
                console.log('  delete       - Delete all videos with local file paths (CAUTION!)');
                console.log('  mark-failed  - Mark videos with local paths as "failed"');
                console.log('\nExample: node migrateOldVideos.js list');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    }
};

main();
