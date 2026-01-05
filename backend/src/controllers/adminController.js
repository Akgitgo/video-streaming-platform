const User = require('../models/User');
const Video = require('../models/Video');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['Viewer', 'Editor', 'Admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete all user's videos
        await Video.deleteMany({ uploader: req.params.id });

        await user.deleteOne();
        res.json({ message: 'User and their videos deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system statistics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVideos = await Video.countDocuments();
        const totalViews = await Video.aggregate([
            { $group: { _id: null, total: { $sum: '$views' } } }
        ]);

        const videosByStatus = await Video.aggregate([
            { $group: { _id: '$sensitivityStatus', count: { $sum: 1 } } }
        ]);

        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const recentVideos = await Video.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('uploader', 'username');

        res.json({
            totalUsers,
            totalVideos,
            totalViews: totalViews[0]?.total || 0,
            videosByStatus,
            usersByRole,
            recentVideos
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all videos (Admin only - no filtering)
// @route   GET /api/admin/videos
// @access  Private/Admin
const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find()
            .populate('uploader', 'username email role')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update video sensitivity status (Admin only)
// @route   PUT /api/admin/videos/:id/sensitivity
// @access  Private/Admin
const updateVideoSensitivity = async (req, res) => {
    try {
        const { sensitivityStatus } = req.body;

        if (!['pending', 'safe', 'flagged'].includes(sensitivityStatus)) {
            return res.status(400).json({ message: 'Invalid sensitivity status' });
        }

        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { sensitivityStatus },
            { new: true }
        ).populate('uploader', 'username email role');

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    List videos with local file paths (Admin only)
// @route   GET /api/admin/videos/local
// @access  Private/Admin
const listLocalVideos = async (req, res) => {
    try {
        const videos = await Video.find({
            videoUrl: { $not: /^https?:\/\// }
        }).populate('uploader', 'username email');

        res.json({
            count: videos.length,
            videos: videos.map(v => ({
                _id: v._id,
                title: v.title,
                videoUrl: v.videoUrl,
                thumbnailPath: v.thumbnailPath,
                uploader: v.uploader,
                createdAt: v.createdAt,
                processingStatus: v.processingStatus
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete all videos with local file paths (Admin only)
// @route   DELETE /api/admin/videos/local
// @access  Private/Admin
const deleteLocalVideos = async (req, res) => {
    try {
        const result = await Video.deleteMany({
            videoUrl: { $not: /^https?:\/\// }
        });

        res.json({
            message: `Successfully deleted ${result.deletedCount} videos with local file paths`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Migrate a specific video to Cloudinary (Admin only)
// @route   POST /api/admin/videos/:id/migrate
// @access  Private/Admin
const migrateVideoToCloudinary = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (video.videoUrl.startsWith('http')) {
            return res.status(400).json({ message: 'Video is already on Cloudinary' });
        }

        res.json({
            message: 'Migration requires re-uploading the video file. Please use the upload endpoint with the original file.',
            videoId: video._id,
            currentPath: video.videoUrl,
            instruction: 'To migrate this video, you need to re-upload the original video file through the upload endpoint.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats,
    getAllVideos,
    updateVideoSensitivity,
    listLocalVideos,
    deleteLocalVideos,
    migrateVideoToCloudinary
};
