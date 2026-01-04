const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Try different import methods for CloudinaryStorage (version compatibility)
let CloudinaryStorage;
try {
    // Try named export (newer versions)
    CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
} catch (e) {
    try {
        // Try default export (older versions)
        CloudinaryStorage = require('multer-storage-cloudinary');
    } catch (e2) {
        console.log('CloudinaryStorage not available, will use local storage');
    }
}

// Configure Cloudinary only if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('✓ Cloudinary configured for cloud storage');
} else {
    console.log('✓ Using local file storage (development mode)');
}

// Use Cloudinary if configured and available, otherwise use local storage
const storage = (process.env.CLOUDINARY_CLOUD_NAME && CloudinaryStorage)
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'video-streaming-platform/videos',
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
            transformation: [{ quality: 'auto' }]
        }
    })
    : multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only video files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024 }, // 500MB default
    fileFilter: fileFilter
});

module.exports = upload;
