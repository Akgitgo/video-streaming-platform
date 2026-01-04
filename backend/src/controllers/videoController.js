const Video = require('../models/Video');
const fs = require('fs');
const path = require('path');
const { generateThumbnail, processVideoContent } = require('../services/videoProcessor');

// @desc    Get all videos (Isolated by user unless Admin or unauthenticated)
// @route   GET /api/videos?search=term&sensitivity=safe&sort=views
// @access  Public
const getVideos = async (req, res) => {
    try {
        let query = {};

        // If user is logged in and not Admin, show only their videos
        // If not logged in, show all videos (public Dashboard)
        if (req.user && req.user.role !== 'Admin') {
            query.uploader = req.user._id;
        }

        // Search functionality
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        // Filter by sensitivity status
        if (req.query.sensitivity) {
            query.sensitivityStatus = req.query.sensitivity;
        }

        // Filter by processing status
        if (req.query.status) {
            query.processingStatus = req.query.status;
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (req.query.sort === 'views') {
            sortOption = { views: -1 };
        } else if (req.query.sort === 'title') {
            sortOption = { title: 1 };
        } else if (req.query.sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        const videos = await Video.find(query)
            .populate('uploader', 'username avatar role')
            .sort(sortOption);

        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id).populate('uploader', 'username avatar');

        if (video) {
            // Increment view count
            video.views += 1;
            await video.save();
            res.json(video);
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private
const uploadVideo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description } = req.body;

    try {
        // Cloudinary returns the URL in req.file.path
        const videoUrl = req.file.path; // Cloudinary URL
        const publicId = req.file.filename; // Cloudinary public_id

        // For Cloudinary, we'll generate thumbnail URL from video
        // Cloudinary can auto-generate thumbnails from videos
        const thumbnailUrl = videoUrl.replace('/upload/', '/upload/w_320,h_240,c_fill/').replace(/\.(mp4|mov|avi|mkv|webm)$/, '.jpg');

        const video = new Video({
            title,
            description,
            videoUrl: videoUrl, // Cloudinary URL
            thumbnailPath: thumbnailUrl, // Cloudinary thumbnail URL
            uploader: req.user._id
        });

        const createdVideo = await video.save();

        // Start processing asynchronously
        const io = req.app.get('io');
        // Import here or at top (already at top)
        processVideoContent(createdVideo._id, io);

        res.status(201).json(createdVideo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Stream video content
// @route   GET /api/videos/stream/:id
// @access  Public
const streamVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const videoPath = video.videoUrl;
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/mp4',
            };

            res.writeHead(206, head);
            file.pipe(res);
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Check user
        if (video.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Delete files
        try {
            if (fs.existsSync(video.videoUrl)) {
                fs.unlinkSync(video.videoUrl);
            }
            if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
                fs.unlinkSync(video.thumbnailPath);
            }
        } catch (err) {
            console.error('Error deleting files:', err);
        }

        await video.deleteOne();
        res.json({ message: 'Video removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVideos,
    getVideoById,
    uploadVideo,
    streamVideo,
    deleteVideo
};
