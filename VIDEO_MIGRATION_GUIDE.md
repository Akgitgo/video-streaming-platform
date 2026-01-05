# Video Migration Guide

## Problem Overview

Your old videos are not playing because they were uploaded with **local file paths** before Cloudinary integration. These files don't exist on the Render production server, causing 404 errors for both videos and thumbnails.

## What Was Fixed

### 1. **Backend Model Fix** ✅
- Updated `Video.js` model to properly handle both Cloudinary URLs and local paths
- The `thumbnailUrl` virtual getter now detects if the path is already a complete URL

### 2. **Admin API Endpoints** ✅
Added three new admin endpoints:
- `GET /api/admin/videos/local` - List all videos with local file paths
- `DELETE /api/admin/videos/local` - Delete all videos with local file paths
- `POST /api/admin/videos/:id/migrate` - Get migration info for a specific video

### 3. **Admin Panel UI** ✅
- Added a new "Migration" tab in the Admin Panel
- Shows all videos with local file paths
- Allows bulk deletion with confirmation

### 4. **Migration Scripts** ✅
Created two scripts:
- `migrateOldVideos.js` - Database-only operations (list, delete, mark as failed)
- `reuploadToCloudinary.js` - Re-upload local videos to Cloudinary

---

## Solution Options

### **Option 1: Delete Old Videos (Quick & Clean)**

#### Using Admin Panel (Recommended):
1. Log in as Admin
2. Go to **Admin Panel** → **Migration** tab
3. Click "Refresh List" to see all local videos
4. Click "Delete All Local Videos" button
5. Confirm the deletion

#### Using API:
```bash
# From your browser console or Postman (requires Admin auth)
DELETE https://video-streaming-platform-gqqv.onrender.com/api/admin/videos/local
```

---

### **Option 2: Re-upload Videos to Cloudinary**

If you have the original video files locally, you can re-upload them to Cloudinary.

#### Step 1: Verify Local Files Exist
The files are currently in: `backend/uploads/`

Current files found:
- video-1767526597321.mp4
- video-1767527213164.mp4
- video-1767528337832.mp4
- video-1767529213168.mp4
- video-1767532479539.mp4
- video-1767534175580.mp4
- video-1767546332087.mp4
- video-1767546558802.mp4
- video-1767548088460.mp4
- video-1767548240786.mp4

#### Step 2: Run the Re-upload Script

**Locally (Recommended):**
```bash
cd backend
node src/scripts/reuploadToCloudinary.js
```

This will:
1. Find all videos with local paths in the database
2. Upload each video to Cloudinary
3. Generate Cloudinary thumbnail URLs
4. Update the database with new URLs
5. Keep local files (unless you use `--delete-local` flag)

**To delete local files after successful upload:**
```bash
node src/scripts/reuploadToCloudinary.js --delete-local
```

#### Step 3: Verify in Admin Panel
1. Go to Admin Panel → Migration tab
2. Click "Refresh List"
3. Should show "No Local Videos Found"

---

## Using the Migration Scripts

### Script 1: Database Operations Only

```bash
cd backend

# List all videos with local paths
node src/scripts/migrateOldVideos.js list

# Delete all videos with local paths (CAUTION!)
node src/scripts/migrateOldVideos.js delete

# Mark videos as "failed" (keeps them in DB but flags them)
node src/scripts/migrateOldVideos.js mark-failed
```

### Script 2: Re-upload to Cloudinary

```bash
cd backend

# Re-upload videos (keeps local files)
node src/scripts/reuploadToCloudinary.js

# Re-upload and delete local files after success
node src/scripts/reuploadToCloudinary.js --delete-local
```

---

## Recommended Workflow

### **If you want to keep the old videos:**
1. ✅ Run `reuploadToCloudinary.js` locally
2. ✅ Verify uploads in Admin Panel
3. ✅ Optionally delete local files with `--delete-local` flag

### **If you want to remove the old videos:**
1. ✅ Use Admin Panel → Migration tab → "Delete All Local Videos"
2. ✅ Or run `migrateOldVideos.js delete`

---

## Environment Variables Required

Make sure these are set in your `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Troubleshooting

### "No videos found to migrate"
- All your videos are already on Cloudinary! ✅

### "File not found" errors
- The local video files don't exist at the specified path
- Check if files are in `backend/uploads/`
- You may need to delete these database entries

### "Cloudinary upload failed"
- Check your Cloudinary credentials
- Verify your Cloudinary account has enough storage
- Check file size limits (default: 100MB for free tier)

### Videos still not playing after migration
- Clear browser cache
- Check the video URL in the database (should start with `https://res.cloudinary.com/`)
- Verify the video plays directly from the Cloudinary URL

---

## Next Steps

1. **Choose your approach** (delete or re-upload)
2. **Run the appropriate script or use Admin Panel**
3. **Verify** in the Admin Panel Migration tab
4. **Test** video playback on the frontend

All new videos uploaded will automatically use Cloudinary storage! 🎉
