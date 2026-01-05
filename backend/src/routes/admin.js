const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats,
    getAllVideos,
    updateVideoSensitivity,
    listLocalVideos,
    deleteLocalVideos,
    migrateVideoToCloudinary
} = require('../controllers/adminController');

// All routes require Admin role
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/videos', getAllVideos);
router.put('/videos/:id/sensitivity', updateVideoSensitivity);

// Video migration routes
router.get('/videos/local', listLocalVideos);
router.delete('/videos/local', deleteLocalVideos);
router.post('/videos/:id/migrate', migrateVideoToCloudinary);

module.exports = router;
