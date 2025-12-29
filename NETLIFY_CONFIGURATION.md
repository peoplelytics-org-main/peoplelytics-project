# Netlify Deployment Configuration

## 📋 Collected Project Details

### 1. Repository & Branch
- **Git Provider**: GitHub
- **Repository**: `peoplelytics-org-main/peoplelytics-project`
- **Repository URL**: `https://github.com/peoplelytics-org-main/peoplelytics-project.git`
- **Branch to Deploy**: `main`
- **Visibility**: Private (based on previous context)

### 2. Project Structure
- **Type**: Monorepo (frontend + backend in same repository)
- **Frontend Directory**: `frontend/`
- **Backend Directory**: `backend/` (deployed separately on Render/Railway)
- **Root Deployment**: Subdirectory deployment (frontend only)

### 3. Frontend Build Configuration
- **Framework**: Vite + React + TypeScript
- **Build Command**: `npm install && npm run build` (or `npm run build` if dependencies already installed)
- **Publish Directory**: `frontend/dist`
- **Package Manager**: npm (package-lock.json present)
- **Node Version**: 18 (specified in netlify.toml)

### 4. Routing
- **Type**: Single Page Application (SPA)
- **Router**: HashRouter (`#/` routes)
- **Redirects**: Required for SPA routing (already configured in `_redirects`)

### 5. Backend (Netlify Functions)
- **Serverless Functions**: ❌ No
- **Backend Deployment**: Separate service (Render/Railway)
- **Backend Type**: Express.js Node.js server (not serverless)

### 6. Environment Variables

#### Required (Build-time + Runtime)
- `VITE_API_URL` - Backend API base URL
  - **Type**: Build-time (Vite prefix)
  - **Example**: `https://your-backend.onrender.com/api`
  - **Required**: Yes

#### Optional (Build-time)
- `VITE_GEMINI_API_KEY` - Google Gemini AI API key
  - **Type**: Build-time (Vite prefix)
  - **Required**: No (AI features disabled if not set)

### 7. External Services
- **Database**: MongoDB Atlas (separate backend service)
- **Backend API**: Deployed on Render/Railway (separate service)
- **Auth**: Custom JWT-based (handled by backend)
- **Third-party APIs**: Google Gemini AI (optional)

### 8. Deployment Preferences
- **Auto Deploy**: Yes (on push to `main` branch)
- **Preview Deployments**: Yes (for pull requests)
- **Production Environment**: Single production environment

---

## 🎯 Netlify UI Configuration Values

### Site Settings → Build & Deploy

**Repository:**
- Connect to: `peoplelytics-org-main/peoplelytics-project`
- Branch to deploy: `main`
- Base directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `frontend/dist`

**Build environment variables:**
- `NODE_VERSION`: `18` (or leave default)

### Site Settings → Environment Variables

**Production:**
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key (optional)
```

**Deploy Previews:**
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key (optional)
```

**Branch Deploys:**
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key (optional)
```

---

## ✅ Verified netlify.toml Configuration

Your existing `netlify.toml` is **correctly configured**:

```toml
[build]
  base = "frontend"
  publish = "frontend/dist"
  command = "npm install && npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.woff2"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Status**: ✅ Production-ready

---

## 📝 Additional Notes

### HashRouter Consideration
- Your app uses `HashRouter` (`#/` routes)
- Netlify redirects (`_redirects` file) handle SPA routing
- HashRouter works with or without redirects, but redirects ensure clean URLs

### Build Optimization
- Consider adding build caching if build times are slow
- Netlify automatically caches `node_modules` between builds

### Preview Deployments
- Netlify creates preview deployments for pull requests automatically
- Environment variables from Production are inherited (can be overridden)

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Backend deployed on Render/Railway
- [ ] Backend URL obtained
- [ ] MongoDB Atlas configured
- [ ] Environment variables documented

### Netlify Setup
- [ ] Connect GitHub repository
- [ ] Select `main` branch
- [ ] Verify build settings (auto-detected from netlify.toml)
- [ ] Set environment variables:
  - [ ] `VITE_API_URL` = Backend URL
  - [ ] `VITE_GEMINI_API_KEY` = (optional)
- [ ] Trigger first deployment

### Post-Deployment
- [ ] Test frontend URL
- [ ] Verify API calls work
- [ ] Test authentication flow
- [ ] Check browser console for errors
- [ ] Verify CORS is working (backend must allow Netlify domain)

---

## ✅ Configuration Status

**All Netlify configuration is complete and production-ready!**

- ✅ `netlify.toml` correctly configured
- ✅ `_redirects` file present
- ✅ Build settings correct
- ✅ Security headers configured
- ✅ Cache headers optimized
- ✅ Environment variables documented

**Ready to deploy!** 🚀

