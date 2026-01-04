# Quick Test - Check Video Playback

## Test This NOW:

1. **Open browser console** (F12)
2. **Go to a video page**: http://localhost:5173/video/[VIDEO_ID]
3. **Check console for errors**

## Common Issues:

### Issue 1: 404 on /api/videos/stream/[ID]
**Fix**: Video file path is wrong in database

**Solution**:
```bash
# Check what's in the database
# The videoUrl should be like: uploads/video-1767542080468.mp4
```

### Issue 2: CORS error
**Fix**: Backend CORS not allowing localhost

### Issue 3: File not found
**Fix**: Video file doesn't exist in uploads folder

## Quick Debug:

**Check if video file exists:**
1. Go to: `D:\SSD DATA\Projects\video-streaming-platform\backend\uploads`
2. Look for `.mp4` files
3. Note the filename

**Check database:**
- The `videoUrl` in database should match the file in uploads folder

## Manual Test:

Try accessing the stream URL directly:
```
http://localhost:5000/api/videos/stream/[VIDEO_ID]
```

If you get a download prompt or video plays → Backend is working
If you get 404 → File path issue
If you get 500 → Server error (check backend console)

## What to Share:

1. **Backend console** - Any errors when you try to play video?
2. **Browser console** (F12) - Any errors?
3. **Network tab** (F12) - What's the status code for `/api/videos/stream/[ID]`?

This will help me fix it quickly!
