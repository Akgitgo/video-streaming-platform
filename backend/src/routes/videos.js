const express = require('express');
const router = express.Router();
const { getVideos, getVideoById, uploadVideo, streamVideo, deleteVideo } = require('../controllers/videoController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
    .get(getVideos) // Public - anyone can view videos
    .post(protect, authorize('Editor', 'Admin'), upload.single('video'), uploadVideo);

router.route('/:id')
    .get(getVideoById)
    .delete(protect, authorize('Editor', 'Admin'), deleteVideo);

router.get('/stream/:id', streamVideo);

module.exports = router;
