# 🔧 Vercel Environment Variables Fix

## Problem
Frontend shows "Failed to register" because Vercel doesn't have the environment variables set.

---

## Quick Fix (5 Minutes)

### Step 1: Add Environment Variables to Vercel

1. **Go to**: https://vercel.com/dashboard
2. Click on your project: `video-streaming-platform`
3. Click **"Settings"** tab (top navigation)
4. Click **"Environment Variables"** (left sidebar)
5. **Add these variables**:

#### Variable 1:
- **Key**: `VITE_API_URL`
- **Value**: `https://video-streaming-platform-gqqv.onrender.com/api`
- **Environment**: Select **ALL** (Production, Preview, Development)
- Click **"Save"**

#### Variable 2:
- **Key**: `VITE_SOCKET_URL`
- **Value**: `https://video-streaming-platform-gqqv.onrender.com`
- **Environment**: Select **ALL** (Production, Preview, Development)
- Click **"Save"**

### Step 2: Redeploy Vercel

**Option A: From Dashboard**
1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm
6. Wait 1-2 minutes

**Option B: Push to GitHub** (triggers auto-deploy)
```bash
# Make a small change
echo "" >> README.md
git add .
git commit -m "Trigger Vercel redeploy"
git push origin main
```

### Step 3: Clear Browser Cache

After Vercel redeploys:
1. Open your Vercel site
2. Press **Ctrl + Shift + R** (hard refresh)
3. Or open in **Incognito/Private** window

### Step 4: Test Registration

1. Go to: https://video-streaming-platform-2tpd.vercel.app/register
2. Fill in:
   - Username: `testadmin`
   - Email: `test@demo.com`
   - Password: `test123`
   - Role: `Admin (Full Control)`
3. Click **"Sign Up"**
4. Should work! ✅

---

## Verification Checklist

Before testing:
- [ ] Environment variables added to Vercel
- [ ] Vercel redeployed (shows new deployment time)
- [ ] Browser cache cleared (Ctrl + Shift + R)
- [ ] Backend is running (test: https://video-streaming-platform-gqqv.onrender.com/health)

---

## If Still Not Working

### Check Browser Console (F12)

1. Open your Vercel site
2. Press **F12** → **Console** tab
3. Try to register
4. Look for errors

**Common errors:**

**Error 1: "Failed to fetch"**
- Backend is down
- Check: https://video-streaming-platform-gqqv.onrender.com/health

**Error 2: "CORS error"**
- Backend CORS not updated
- Already fixed in code, just need to push

**Error 3: "Network error"**
- Wrong API URL
- Check Vercel environment variables

**Error 4: "User already exists"**
- Try different email!

### Check Network Tab

1. F12 → **Network** tab
2. Try to register
3. Look for request to `/api/auth/register`
4. Click on it
5. Check:
   - **Request URL**: Should be `https://video-streaming-platform-gqqv.onrender.com/api/auth/register`
   - **Status**: Should be `201` (success) or `400` (validation error)
   - **Response**: Shows the error message

---

## Screenshot Guide

### Vercel Environment Variables Page:

Should show:
```
VITE_API_URL
https://video-streaming-platform-gqqv.onrender.com/api
Production, Preview, Development

VITE_SOCKET_URL  
https://video-streaming-platform-gqqv.onrender.com
Production, Preview, Development
```

### After Successful Registration:

- Redirects to Dashboard
- Shows your username in navbar
- Shows "Upload" and "My Videos" links (for Admin)

---

## Alternative: Test Locally First

If Vercel is still having issues, test locally:

1. **Start backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test**: http://localhost:5173/register
4. If it works locally, the issue is Vercel config

---

## Need Help?

**Share with me:**
1. Screenshot of Vercel Environment Variables page
2. Screenshot of browser console (F12) when you try to register
3. Screenshot of Network tab showing the failed request

**I'll help you debug!** 🚀
