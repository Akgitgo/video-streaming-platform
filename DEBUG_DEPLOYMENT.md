# Deployment Debugging Guide

## Quick Checks

### 1. Test Backend Health

Open these URLs in your browser:

**Backend Base URL:**
```
https://video-streaming-platform-gqqv.onrender.com
```
Should show: `Cannot GET /` (this is OK!)

**Backend API Test:**
```
https://video-streaming-platform-gqqv.onrender.com/api/auth/login
```
Should show: `{"message":"Invalid email or password"}` (this is GOOD!)

If you get errors or timeout, your backend is not running properly.

---

## Common Issues & Fixes

### Issue 1: Backend Not Running

**Symptoms:**
- Timeout errors
- "Failed to fetch"
- CORS errors

**Fix:**
1. Go to Render Dashboard → Your Service → Logs
2. Check for errors
3. Most common: **MongoDB connection failed**
   - Make sure `MONGODB_URI` is set correctly
   - Format: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/dbname`
   - Whitelist IP: `0.0.0.0/0` in MongoDB Atlas

### Issue 2: Environment Variables Not Set

**Check in Render Dashboard:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Any random string (e.g., `mysecretkey123`)
- `FRONTEND_URL` - Your Vercel URL
- `PORT` - Should be `10000`

### Issue 3: Vercel Environment Variables Not Set

**Check in Vercel Dashboard → Settings → Environment Variables:**
- `VITE_API_URL` = `https://video-streaming-platform-gqqv.onrender.com/api`
- `VITE_SOCKET_URL` = `https://video-streaming-platform-gqqv.onrender.com`

**After adding, you MUST redeploy!**

### Issue 4: CORS Errors

**Check browser console (F12):**
If you see: `Access to XMLHttpRequest blocked by CORS policy`

**Fix:**
1. Check `backend/src/app.js` has your Vercel URL in CORS config
2. Update and redeploy backend

---

## Step-by-Step Debugging

### Step 1: Check Backend Logs
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors (especially MongoDB connection errors)

### Step 2: Check Browser Console
1. Open your Vercel site
2. Press F12 → Console tab
3. Try to register
4. Look for error messages

**Common errors:**
- `Failed to fetch` → Backend is down
- `Network error` → Backend URL is wrong
- `CORS error` → CORS not configured
- `500 Internal Server Error` → Backend error (check logs)

### Step 3: Test API Manually

**Using browser or Postman:**

**Test Registration:**
```
POST https://video-streaming-platform-gqqv.onrender.com/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@test.com",
  "password": "test123",
  "role": "Editor"
}
```

**Expected Response:**
```json
{
  "_id": "...",
  "username": "testuser",
  "email": "test@test.com",
  "role": "Editor",
  "token": "..."
}
```

---

## Quick Fix Checklist

- [ ] Backend is deployed and running (check Render dashboard)
- [ ] MongoDB is connected (check Render logs)
- [ ] Environment variables set in Render
- [ ] Environment variables set in Vercel
- [ ] Vercel redeployed after adding env vars
- [ ] Backend URL is correct in `.env.production`
- [ ] Browser console shows no CORS errors
- [ ] Can access backend API directly in browser

---

## If Still Not Working

**Share with me:**
1. Screenshot of Render logs
2. Screenshot of browser console (F12)
3. Your backend URL
4. Error message you're seeing

**Quick test command:**
```bash
# Test backend from command line
curl https://video-streaming-platform-gqqv.onrender.com/api/auth/login

# Should return: {"message":"Invalid email or password"}
```

---

## MongoDB Setup (If Not Done)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Database Access → Add user (username + password)
5. Network Access → Add IP: `0.0.0.0/0` (allow all)
6. Connect → Connect your application
7. Copy connection string
8. Replace `<password>` with your database password
9. Add to Render environment variables as `MONGODB_URI`

---

## Expected Working Flow

1. User visits Vercel frontend
2. Frontend loads with `VITE_API_URL` from env vars
3. User clicks Register
4. Frontend sends POST to `https://backend.onrender.com/api/auth/register`
5. Backend validates, saves to MongoDB
6. Backend returns user data + token
7. Frontend stores token, redirects to dashboard

**If any step fails, check that specific part!**
