# Environment Variables Setup Guide

This guide explains how to set up environment variables for each service in the Univent College Event Management System.

## Quick Setup

1. **Copy the `.env.example` file to `.env` in each service directory:**
   ```bash
   # Auth Service
   cp backend/auth-service/.env.example backend/auth-service/.env
   
   # Event Service
   cp backend/event-service/.env.example backend/event-service/.env
   
   # Notification Service
   cp backend/notification-service/.env.example backend/notification-service/.env
   
   # Leaderboard Service
   cp backend/leaderboard-service/.env.example backend/leaderboard-service/.env
   
   # Settings Service
   cp backend/settings-service/.env.example backend/settings-service/.env
   
   # API Gateway
   cp backend/gateway/.env.example backend/gateway/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

2. **Update each `.env` file with your actual values** (see details below)

## Required Environment Variables by Service

### 1. Auth Service (`backend/auth-service/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the service | `8001` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/univent_auth` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_super_secret_jwt_key` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `your_refresh_secret_key` |
| `JWT_EXPIRE` | JWT token expiration time | `1d` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration time | `7d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `EMAIL_SERVICE` | Email service provider | `gmail` |
| `EMAIL_SECURE` | Use secure email connection | `true` |
| `EMAIL_USER` | Email address for sending emails | `your_email@gmail.com` |
| `EMAIL_PASS` | Email password or app-specific password | `your_password` |

**Important:** `JWT_SECRET` must be the same across all services that verify JWT tokens.

### 2. Event Service (`backend/event-service/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the service | `8002` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/univent_events` |
| `JWT_SECRET` | JWT secret (must match auth-service) | `your_super_secret_jwt_key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### 3. Notification Service (`backend/notification-service/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the service | `8003` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/univent_notifications` |
| `JWT_SECRET` | JWT secret (must match auth-service) | `your_super_secret_jwt_key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### 4. Leaderboard Service (`backend/leaderboard-service/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the service | `8004` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/univent_leaderboard` |
| `JWT_SECRET` | JWT secret (must match auth-service) | `your_super_secret_jwt_key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### 5. Settings Service (`backend/settings-service/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the service | `8005` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/univent_settings` |
| `JWT_SECRET` | JWT secret (must match auth-service) | `your_super_secret_jwt_key` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### 6. API Gateway (`backend/gateway/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port number for the gateway | `8000` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `AUTH_SERVICE` | Auth service URL | `http://localhost:8001` |
| `EVENT_SERVICE` | Event service URL | `http://localhost:8002` |
| `NOTIFICATION_SERVICE` | Notification service URL | `http://localhost:8003` |
| `LEADERBOARD_SERVICE` | Leaderboard service URL | `http://localhost:8004` |
| `SETTINGS_SERVICE` | Settings service URL | `http://localhost:8005` |

### 7. Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | API Gateway URL | `http://localhost:8000` |
| `VITE_AUTH_SERVICE_URL` | Auth service URL (if not using gateway) | `http://localhost:8001` |
| `VITE_EVENT_SERVICE_URL` | Event service URL (if not using gateway) | `http://localhost:8002` |
| `VITE_NOTIFICATION_SERVICE_URL` | Notification service URL | `http://localhost:8003` |
| `VITE_LEADERBOARD_SERVICE_URL` | Leaderboard service URL (if not using gateway) | `http://localhost:8004` |
| `VITE_SETTINGS_SERVICE_URL` | Settings service URL (if not using gateway) | `http://localhost:8005` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id` |

**Note:** In Vite, all environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

## Production Setup

For production deployment, update the following:

1. **Change `NODE_ENV` to `production`**
2. **Update MongoDB URIs** to your production database
3. **Use strong, unique JWT secrets** (generate using: `openssl rand -base64 32`)
4. **Update service URLs** to your deployed service URLs
5. **Configure production email service** (SMTP credentials)
6. **Update CORS `CLIENT_URL`** to your production frontend URL
7. **Set production Google OAuth Client ID**

## Security Best Practices

1. **Never commit `.env` files to version control** (they're in `.gitignore`)
2. **Use different JWT secrets for development and production**
3. **Use strong, randomly generated secrets** (at least 32 characters)
4. **Keep your `.env` files secure** and never share them publicly
5. **Use environment-specific values** for different deployment environments

## Generating Secure Secrets

To generate secure random secrets:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32
```

## Troubleshooting

- **JWT verification fails**: Ensure `JWT_SECRET` is identical across all services
- **CORS errors**: Check that `CLIENT_URL` matches your frontend URL exactly
- **Database connection fails**: Verify `MONGODB_URI` is correct and MongoDB is running
- **Frontend can't access env variables**: Ensure variables are prefixed with `VITE_` in Vite projects

