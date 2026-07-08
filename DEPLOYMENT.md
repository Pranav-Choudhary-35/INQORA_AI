# InqoraAI Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. MongoDB Atlas account with a connection string
2. Gmail account with OAuth2 credentials
3. Vercel account (for frontend)
4. Render account (for backend)
5. API keys for AI services (Gemini, Mistral, Tavily)

---

## Backend Deployment (Render)

### Step 1: Prepare Backend

```bash
cd Backend
npm install
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the following details:
   - **Name**: `inqoraai-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Configure Environment Variables

In Render dashboard, go to your service → "Environment":

```
NODE_ENV=production
PORT=8000
MONGODB_URI=<Your MongoDB Atlas URI>
JWT_SECRET=<Generate a strong secret>
CLIENT_URL=<Your Vercel frontend URL>
GOOGLE_USER=<Gmail address>
GOOGLE_CLIENT_ID=<Your Google OAuth Client ID>
GOOGLE_CLIENT_SECRET=<Your Google OAuth Client Secret>
GOOGLE_REFRESH_TOKEN=<Your Google Refresh Token>
GEMINI_API_KEY=<Your Gemini API Key>
MISTRAL_API_KEY=<Your Mistral API Key>
TAVILY_API_KEY=<Your Tavily API Key>
```

### Step 4: Deploy

Click "Create Web Service" - Render will automatically deploy from your git push.

**Your backend URL will be**: `https://inqoraai-backend.render.com`

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

```bash
cd Frontend
npm install
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the Frontend folder as root

### Step 3: Configure Environment Variables

In Vercel dashboard, go to "Settings" → "Environment Variables":

```
VITE_API_BASE_URL=https://inqoraai-backend.render.com
VITE_SOCKET_URL=https://inqoraai-backend.render.com
```

### Step 4: Configure Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 5: Deploy

Click "Deploy" - Vercel will automatically deploy from your git push.

**Your frontend URL will be**: `https://inqoraai.vercel.app`

---

## Post-Deployment Verification

### 1. Backend Health Check

```bash
curl https://inqoraai-backend.render.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-05-07T...",
  "environment": "production"
}
```

### 2. Frontend Access

Visit `https://inqoraai.vercel.app` and test:
- Register flow
- Email verification
- Login
- Chat functionality

### 3. Check Logs

**Render Logs**:
- Dashboard → Service → "Logs"

**Vercel Logs**:
- Dashboard → Project → "Deployments" → Click deployment → "Logs"

---

## Environment Variable Reference

### Backend (.env)

| Variable | Description |
|----------|-------------|
| NODE_ENV | `production` or `development` |
| PORT | Server port (default: 8000) |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | Secret key for JWT tokens |
| CLIENT_URL | Frontend URL for CORS |
| GOOGLE_USER | Gmail address for email service |
| GOOGLE_CLIENT_ID | Google OAuth Client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth Client Secret |
| GOOGLE_REFRESH_TOKEN | Google Refresh Token |
| GEMINI_API_KEY | Google Gemini API key |
| MISTRAL_API_KEY | Mistral API key |
| TAVILY_API_KEY | Tavily search API key |

### Frontend (.env)

| Variable | Description |
|----------|-------------|
| VITE_API_BASE_URL | Backend API URL |
| VITE_SOCKET_URL | Backend Socket.IO URL |

---

## Important Notes

1. **CORS Configuration**: Backend automatically configures CORS for the frontend URL in `CLIENT_URL` env variable
2. **SSL/TLS**: Both Render and Vercel provide automatic SSL certificates
3. **Database**: Ensure your MongoDB Atlas IP whitelist includes Render's IPs
4. **Email Verification**: Gmail OAuth2 requires proper credentials setup
5. **Rate Limiting**: Backend has built-in rate limiting (100 requests per 15 minutes)

---

## Troubleshooting

### Frontend Can't Connect to Backend

1. Verify `VITE_API_BASE_URL` is correct
2. Check CORS configuration in backend
3. Ensure backend is running (check `/api/health`)

### Email Verification Not Working

1. Check Gmail OAuth2 credentials
2. Verify `GOOGLE_REFRESH_TOKEN` is valid
3. Check backend logs for email service errors

### Socket Connection Issues

1. Verify `VITE_SOCKET_URL` matches backend URL
2. Check browser console for WebSocket errors
3. Ensure websocket protocol is enabled on backend

### Database Connection Failed

1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Ensure credentials are URL-encoded if special characters exist

---

## Monitoring & Logging

### Render Logs
```bash
# View logs from Render dashboard or CLI
render logs <service-id>
```

### Check Backend Health
```bash
curl https://inqoraai-backend.render.com/api/health -v
```

---

## Performance Optimization

1. **Frontend**: Already using code splitting with lazy loading
2. **Backend**: Using `.lean()` for read-only MongoDB queries
3. **Compression**: gzip compression enabled
4. **Caching**: Consider adding Redis for session management (upgrade for Render)

---

## Security Checklist

- [x] HTTPS everywhere
- [x] CORS properly configured
- [x] JWT secrets are strong and unique
- [x] Environment variables not exposed
- [x] Rate limiting enabled
- [x] Helmet.js for security headers
- [x] HTTPOnly cookies for JWT
- [x] MongoDB connection requires authentication

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
