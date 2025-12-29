# Environment Variables Guide

## Frontend (Netlify)

### Required Variables

```env
VITE_API_URL=https://your-backend.onrender.com/api
```
- **Description**: Backend API base URL
- **Example**: `https://peoplelytics-backend.onrender.com/api`
- **Required**: Yes

### Optional Variables

```env
VITE_GEMINI_API_KEY=your-gemini-api-key
```
- **Description**: Google Gemini AI API key for AI features
- **Required**: No (AI features will be disabled if not set)

---

## Backend (Render/Railway)

### Required Variables

```env
NODE_ENV=production
```
- **Description**: Node.js environment
- **Values**: `production` | `development`
- **Required**: Yes (set to `production` for deployment)

```env
PORT=10000
```
- **Description**: Server port
- **Default**: `5000` (development) | `10000` (Render)
- **Required**: Yes (Render uses port 10000)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/master_db?appName=peoplelytics-cluster
```
- **Description**: MongoDB Atlas connection string
- **Format**: `mongodb+srv://...` (MongoDB Atlas only)
- **Required**: Yes
- **Note**: Local MongoDB connections are rejected

```env
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
```
- **Description**: Secret key for JWT token signing
- **Minimum Length**: 32 characters
- **Required**: Yes
- **Security**: Use a strong, random string

```env
FRONTEND_URL=https://your-app.netlify.app
```
- **Description**: Frontend URL for CORS and redirects
- **Example**: `https://peoplelytics-app.netlify.app`
- **Required**: Yes

### Optional Variables

```env
CORS_ORIGIN=https://your-app.netlify.app,https://*.netlify.app
```
- **Description**: Comma-separated list of allowed CORS origins
- **Default**: Uses `FRONTEND_URL` if not set
- **Required**: No
- **Note**: Supports wildcards for Netlify preview deployments

```env
REDIS_URL=redis://localhost:6379
```
- **Description**: Redis connection URL (for caching)
- **Required**: No (caching will be disabled if not set)

```env
GEMINI_API_KEY=your-gemini-api-key
```
- **Description**: Google Gemini AI API key
- **Required**: No (AI features will be disabled if not set)

---

## Environment Setup Examples

### Development (.env)

```env
# Backend
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/master_db
JWT_SECRET=your-development-secret-key-min-32-chars
FRONTEND_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your-gemini-key
```

### Production (Render + Netlify)

**Backend (Render):**
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/master_db?appName=peoplelytics-cluster
JWT_SECRET=your-production-secret-key-min-32-chars-random-string
FRONTEND_URL=https://your-app.netlify.app
CORS_ORIGIN=https://your-app.netlify.app,https://*.netlify.app
```

**Frontend (Netlify):**
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-key
```

---

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (32+ characters, random)
3. **Rotate secrets** regularly in production
4. **Use different secrets** for development and production
5. **Restrict MongoDB Atlas IP whitelist** in production (or use `0.0.0.0/0` for Render)

---

## Validation

The application validates:
- ✅ `MONGODB_URI` is required (no fallback)
- ✅ Local MongoDB connections are rejected
- ✅ `JWT_SECRET` should be at least 32 characters
- ✅ `FRONTEND_URL` is required for CORS

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` or `CORS_ORIGIN` matches your frontend URL
- Include protocol (`https://`) in URLs
- For Netlify preview deployments, add `https://*.netlify.app` to `CORS_ORIGIN`

### Database Connection Errors
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes Render IPs
- Ensure database user has proper permissions

### Authentication Errors
- Verify `JWT_SECRET` is set and matches between deployments
- Check cookie settings (httpOnly, secure in production)

