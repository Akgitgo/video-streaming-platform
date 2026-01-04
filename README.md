# Video Streaming Platform

A modern, full-stack video streaming application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Secure JWT-based signup and login.
- **Video Upload**: Support for video uploads with metadata.
- **Video Streaming**: Efficient video streaming playback.
- **Dashboard**: Trending videos and content discovery.
- **Video Library**: Manage your uploaded content.
- **Responsive Design**: Beautiful, modern UI that works on all devices.

## Tech Stack

- **Frontend**: React, Vite, Axios, React Router, Lucide Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose, Multer, FFmpeg, JWT
- **DevOps**: Docker (for MongoDB)

## Prerequisites

- Node.js (v18+)
- Docker (for database)
- FFmpeg (installed and in PATH)

## Quick Start

1.  **Start Database**
    ```bash
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    ```

2.  **Start Backend**
    ```bash
    cd backend
    npm install
    npm run dev
    ```

3.  **Start Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access App**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Documentation

- [Setup Guide](SETUP_GUIDE.md)
- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
