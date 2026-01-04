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

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats,
    getAllVideos
};
