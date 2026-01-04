# Deployment Fix Guide

## Issue
Frontend is deployed on Vercel but backend is not deployed yet, causing "Failed to register" errors.

## Solution Steps

### Step 1: Deploy Backend to Render.com

1. **Go to Render.com** and sign in
2. **Create New Web Service**
3. **Connect your GitHub repository**: `https://github.com/Akgitgo/video-streaming-platform`
4. **Configure the service**:
   - Name: `video-streaming-backend`
   - Region: Oregon (or closest to you)
   - Branch: `main`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Plan: Free

5. **Add Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<generate-random-secret>
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=524288000
   UPLOAD_PATH=./uploads
   FRONTEND_URL=https://video-streaming-platform-2tpd-bx68gqcks-akgitgos-projects.vercel.app
   ```

6. **Click "Create Web Service"** and wait for deployment

7. **Copy the backend URL** (will be something like: `https://video-streaming-backend-xxxx.onrender.com`)

### Step 2: Update Frontend Environment Variables

1. **Update `.env.production`** with your actual backend URL:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```

2. **Update Vercel Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add:
     - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
     - `VITE_SOCKET_URL` = `https://your-backend-url.onrender.com`

### Step 3: Redeploy Frontend

1. **Commit the api.js fix**:
   ```bash
   git add frontend/src/services/api.js
   git commit -m "Fix: Use environment variable for API URL"
   git push origin main
   ```

2. **Trigger Vercel Redeploy**:
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment
   - OR push any change to trigger auto-deploy

### Step 4: Get MongoDB Connection String

If you don't have MongoDB set up:

1. **Go to MongoDB Atlas** (https://www.mongodb.com/cloud/atlas)
2. **Create a free cluster**
3. **Create a database user**
4. **Whitelist all IPs** (0.0.0.0/0) for Render to connect
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/video-streaming?retryWrites=true&w=majority`

### Step 5: Verify Deployment

1. **Check backend health**:
   - Visit: `https://your-backend-url.onrender.com/api/auth/login`
   - Should see: `{"message":"Invalid email or password"}` (this is good!)

2. **Test registration**:
   - Go to your Vercel frontend
   - Try to register
   - Should work now!

## Current Status

✅ Fixed `api.js` to use environment variables
✅ Backend configuration ready (`render.yaml`)
⏳ **NEXT**: Deploy backend to Render.com
⏳ **THEN**: Update Vercel environment variables
⏳ **FINALLY**: Redeploy frontend

## Important Notes

- **Free tier limitations**:
  - Render: Backend sleeps after 15 min of inactivity (takes ~30s to wake up)
  - Vercel: 100GB bandwidth/month
  - MongoDB Atlas: 512MB storage

- **CORS is already configured** to accept your Vercel domain
- **File uploads** will work but files are stored in Render's ephemeral storage (lost on restart)
- For production, use **AWS S3** or **Cloudinary** for file storage

## Quick Commands

```bash
# Commit the fix
git add .
git commit -m "Fix: API URL configuration for deployment"
git push origin main

# Check logs on Render
# Go to Render Dashboard → Your Service → Logs

# Check Vercel deployment
# Go to Vercel Dashboard → Deployments
```
