# Setup Guide

## 1. Environment Setup

### Install Node.js
Download and install from [nodejs.org](https://nodejs.org/).

### Install Docker
Download Docker Desktop from [docker.com](https://www.docker.com/).

### Install FFmpeg
**Windows:**
```powershell
winget install Gyan.FFmpeg
```

**MacOS:**
```bash
brew install ffmpeg
```

## 2. Project Installation

Clone the repository:
```bash
git clone <repo-url>
cd video-streaming-platform
```

Install Backend Dependencies:
```bash
cd backend
npm install
```

Install Frontend Dependencies:
```bash
cd frontend
npm install
```

## 3. Configuration

### Backend (.env)
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-streaming
JWT_SECRET=your_super_secret_key_change_this
```

### Frontend (.env)
Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
