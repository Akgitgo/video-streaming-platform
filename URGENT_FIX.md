# 🔧 URGENT FIX: Backend 502 Error

## Problem Identified
**502 Bad Gateway** = Your backend is crashing on Render!

Most common cause: **MongoDB connection failed**

---

## Fix Instructions - Follow Exactly

### Step 1: Check Render Logs (CRITICAL)

1. Go to https://dashboard.render.com
2. Click on your service: `video-streaming-backend`
3. Click **"Logs"** tab (left sidebar)
4. Look for error messages (usually red text)

**Common errors you'll see:**
- `MongooseServerSelectionError`
- `MONGODB_URI is not defined`
- `Authentication failed`
- `Could not connect to any servers`

---

### Step 2: Set Up MongoDB (If Not Done)

#### A. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create organization → Create project

#### B. Create Free Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Choose **AWS** provider
4. Choose region closest to Oregon (e.g., `us-west-2`)
5. Cluster name: `Cluster0` (default is fine)
6. Click **"Create"**
7. Wait 3-5 minutes for cluster to deploy

#### C. Create Database User
1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `admin` (or anything you want)
5. Password: Click **"Autogenerate Secure Password"** → **COPY IT!**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

#### D. Whitelist All IPs (Required for Render)
1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Confirm IP: `0.0.0.0/0`
5. Click **"Confirm"**

#### E. Get Connection String
1. Click **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **4.1 or later**
5. **COPY** the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with the password you copied earlier
7. **Add database name** before the `?`:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/videostreaming?retryWrites=true&w=majority
   ```

---

### Step 3: Set Environment Variables in Render

1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab (left sidebar)
3. **Add these variables** (click "+ Add Environment Variable"):

```
MONGODB_URI
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/videostreaming?retryWrites=true&w=majority

JWT_SECRET
your-super-secret-key-change-this-in-production-12345

FRONTEND_URL
https://video-streaming-platform-2tpd-byi9cm6ew-akgitgos-projects.vercel.app

NODE_ENV
production

PORT
10000
```

4. Click **"Save Changes"**
5. **Backend will auto-redeploy** (wait 2-3 minutes)

---

### Step 4: Update CORS in Backend Code

Your Vercel URL needs to be added to CORS config.

**Edit `backend/src/app.js`:**

Find this line (around line 16):
```javascript
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", ...],
    credentials: true
}));
```

**Change to:**
```javascript
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5173", 
        "http://127.0.0.1:5174",
        "https://video-streaming-platform-2tpd-byi9cm6ew-akgitgos-projects.vercel.app",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
```

**Also update `backend/server.js`** (Socket.IO CORS):

Find this (around line 10):
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: ["http://localhost:5173", ...],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

**Change to:**
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: [
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://video-streaming-platform-2tpd-byi9cm6ew-akgitgos-projects.vercel.app",
        process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

**Commit and push:**
```bash
git add .
git commit -m "Fix: Add production CORS origins"
git push origin main
```

---

### Step 5: Verify Backend is Running

After Render redeploys (2-3 min):

1. Open: https://video-streaming-platform-gqqv.onrender.com/api/auth/login
2. **Should see:** `{"message":"Invalid email or password"}`
3. **If 502:** Check Render logs again

---

### Step 6: Verify Vercel Environment Variables

1. Go to Vercel Dashboard
2. Your project → **Settings** → **Environment Variables**
3. **Make sure these exist:**
   - `VITE_API_URL` = `https://video-streaming-platform-gqqv.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://video-streaming-platform-gqqv.onrender.com`
4. If you just added them, click **"Redeploy"** on latest deployment

---

## Verification Checklist

- [ ] MongoDB cluster created and running
- [ ] Database user created with password
- [ ] Network access set to `0.0.0.0/0`
- [ ] Connection string copied and password replaced
- [ ] `MONGODB_URI` set in Render with correct connection string
- [ ] `JWT_SECRET` set in Render
- [ ] `FRONTEND_URL` set in Render
- [ ] CORS updated in `app.js` and `server.js`
- [ ] Code committed and pushed
- [ ] Render redeployed successfully
- [ ] Backend URL returns `{"message":"Invalid email or password"}`
- [ ] Vercel env vars set
- [ ] Vercel redeployed

---

## Expected Timeline

1. MongoDB setup: 10 minutes
2. Render env vars: 2 minutes
3. Code update + push: 3 minutes
4. Render redeploy: 2-3 minutes
5. Vercel redeploy: 1 minute

**Total: ~20 minutes**

---

## Still Getting 502?

**Check Render Logs for:**
1. MongoDB connection errors
2. Missing environment variables
3. Port binding errors

**Share the error from logs and I'll help!**
