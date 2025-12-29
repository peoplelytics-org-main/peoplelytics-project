# Netlify Deployment Guide for Peoplelytics

This guide will walk you through deploying your fullstack application on Netlify (free tier).

## ⚠️ Important Note

**Netlify's free tier does NOT support long-running Node.js/Express servers.** Therefore, we'll deploy:
- **Frontend**: On Netlify (static site hosting)
- **Backend**: On a separate free service (Render, Railway, or Fly.io)

## 📋 Prerequisites

1. GitHub account with access to: `https://github.com/peoplelytics-org-main/peoplelytics-project`
2. Netlify account (free tier): https://www.netlify.com
3. MongoDB Atlas account (free tier): https://www.mongodb.com/cloud/atlas
4. Backend hosting service account (choose one):
   - **Render** (recommended): https://render.com
   - **Railway**: https://railway.app
   - **Fly.io**: https://fly.io

---

## 🚀 Step 1: Deploy Backend First

Since the frontend depends on the backend API, deploy the backend first.

### Option A: Deploy Backend on Render (Recommended)

1. **Sign up/Login**: Go to https://render.com and sign up with GitHub

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `peoplelytics-org-main/peoplelytics-project`
   - Select the repository

3. **Configure Service**:
   ```
   Name: peoplelytics-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Environment Variables** (Add these in Render dashboard):
   ```env
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   FRONTEND_URL=https://your-netlify-app.netlify.app
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   REDIS_URL=optional-redis-url-if-using
   ```

5. **Deploy**: Click "Create Web Service" and wait for deployment

6. **Note the Backend URL**: After deployment, you'll get a URL like:
   ```
   https://peoplelytics-backend.onrender.com
   ```
   **Save this URL** - you'll need it for the frontend!

### Option B: Deploy Backend on Railway

1. **Sign up**: Go to https://railway.app and sign up with GitHub

2. **New Project**: Click "New Project" → "Deploy from GitHub repo"

3. **Select Repository**: Choose `peoplelytics-org-main/peoplelytics-project`

4. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Environment Variables**: Add the same variables as Render (above)

6. **Deploy**: Railway will auto-deploy

7. **Get URL**: Railway provides a URL like `https://your-app.up.railway.app`

---

## 🌐 Step 2: Deploy Frontend on Netlify

### 2.1 Connect Repository to Netlify

1. **Login to Netlify**: Go to https://app.netlify.com

2. **Add New Site**:
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select repository: `peoplelytics-org-main/peoplelytics-project`

### 2.2 Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

```
Base directory: frontend
Build command: npm install && npm run build
Publish directory: frontend/dist
```

### 2.3 Set Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

**Important**: Replace `https://your-backend-url.onrender.com` with your actual backend URL from Step 1!

### 2.4 Deploy

1. Click "Deploy site"
2. Wait for build to complete (usually 2-5 minutes)
3. Your site will be live at: `https://random-name-12345.netlify.app`

### 2.5 Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS

---

## 🔧 Step 3: Update Backend CORS Settings

After deploying frontend, update your backend CORS to allow your Netlify domain:

1. Go to your backend hosting dashboard (Render/Railway)
2. Update environment variable:
   ```env
   FRONTEND_URL=https://your-netlify-app.netlify.app
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   ```
3. Redeploy backend

---

## ✅ Step 4: Verify Deployment

1. **Frontend**: Visit your Netlify URL
2. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/api/health` (if you have a health endpoint)
3. **Test Login**: Try logging in with test credentials

---

## 🔐 Step 5: MongoDB Atlas Setup

If you haven't set up MongoDB Atlas yet:

1. **Create Account**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: Free tier (M0)
3. **Create Database User**: 
   - Username: `peoplelytics-admin`
   - Password: (generate strong password)
4. **Whitelist IPs**: 
   - Click "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (allows all IPs - for production)
5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

---

## 📝 Environment Variables Summary

### Frontend (Netlify)
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### Backend (Render/Railway)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/peoplelytics?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
FRONTEND_URL=https://your-netlify-app.netlify.app
CORS_ORIGIN=https://your-netlify-app.netlify.app
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: Frontend shows "Network Error" or can't connect to backend
- **Solution**: Check `VITE_API_URL` in Netlify environment variables matches your backend URL

**Problem**: 404 errors on page refresh
- **Solution**: Ensure `_redirects` file exists in `frontend/public/` (already created)

**Problem**: Build fails
- **Solution**: Check build logs in Netlify dashboard for specific errors

### Backend Issues

**Problem**: Backend returns CORS errors
- **Solution**: Update `CORS_ORIGIN` and `FRONTEND_URL` in backend environment variables

**Problem**: Database connection fails
- **Solution**: 
  - Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
  - Check connection string format
  - Verify database user credentials

**Problem**: Backend crashes on startup
- **Solution**: Check backend logs in Render/Railway dashboard

---

## 🔄 Continuous Deployment

Both Netlify and Render/Railway support automatic deployments:
- **Netlify**: Auto-deploys on push to `main` branch
- **Render/Railway**: Auto-deploys on push to `main` branch

To deploy updates:
1. Push changes to GitHub `main` branch
2. Both services will automatically rebuild and redeploy

---

## 📊 Monitoring

### Netlify
- View build logs: Site dashboard → Deploys
- View function logs: Site dashboard → Functions

### Render
- View logs: Service dashboard → Logs tab
- View metrics: Service dashboard → Metrics tab

### Railway
- View logs: Project dashboard → Deployments → View logs
- View metrics: Project dashboard → Metrics

---

## 💰 Free Tier Limits

### Netlify
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ SSL certificates included

### Render
- ✅ 750 hours/month free
- ✅ Sleeps after 15 minutes of inactivity (wakes on request)
- ✅ 512MB RAM
- ⚠️ Cold starts: First request after sleep takes ~30 seconds

### Railway
- ✅ $5 credit/month
- ✅ Sleeps after inactivity
- ⚠️ May require credit card for verification

---

## 🎉 Success!

Once deployed, your application will be:
- **Frontend**: `https://your-app.netlify.app`
- **Backend**: `https://your-backend.onrender.com`

Both will auto-update when you push to GitHub!

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review build/deployment logs
3. Verify all environment variables are set correctly
4. Ensure backend is running before testing frontend

