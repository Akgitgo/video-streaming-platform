const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailPath: {
        type: String,
        default: ''
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number, // in seconds
        default: 0
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    sensitivityStatus: {
        type: String,
        enum: ['pending', 'safe', 'flagged'],
        default: 'safe'
    },
    processingProgress: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

videoSchema.virtual('thumbnailUrl').get(function () {
    if (!this.thumbnailPath) return '';

    // If thumbnailPath is already a complete URL (Cloudinary), return as-is
    if (this.thumbnailPath.startsWith('http://') || this.thumbnailPath.startsWith('https://')) {
        return this.thumbnailPath;
    }

    // For local storage, construct the full URL
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    return `${baseUrl}/${this.thumbnailPath.replace(/\\/g, '/')}`;
});

module.exports = mongoose.model('Video', videoSchema);
