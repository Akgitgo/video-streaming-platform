const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const videoRoutes = require('./routes/videos');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

// Dynamic CORS to handle Vercel preview URLs
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "https://video-streaming-platform-2tpd.vercel.app",
            process.env.FRONTEND_URL
        ].filter(Boolean);

        // Allow Vercel preview URLs (they follow pattern: *-akgitgos-projects.vercel.app)
        if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('vercel.app'))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running!' });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Video Streaming Platform API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            videos: '/api/videos',
            admin: '/api/admin'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;
