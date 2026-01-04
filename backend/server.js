require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://video-streaming-platform-2tpd.vercel.app",
        process.env.FRONTEND_URL
      ].filter(Boolean);

      // Allow Vercel preview URLs
      if (!origin || allowedOrigins.includes(origin) || (origin && origin.includes('vercel.app'))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  // console.log('New client connected');

  socket.on('disconnect', () => {
    // console.log('Client disconnected');
  });
});

// Make io accessible globally if needed (e.g. via app.set)
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
