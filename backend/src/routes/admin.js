const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSystemStats,
    getAllVideos
} = require('../controllers/adminController');

// All routes require Admin role
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/videos', getAllVideos);

module.exports = router;
