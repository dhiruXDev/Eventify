# PowerShell script to create .env.example files for all services

# Auth Service
@"
# Auth Service Environment Variables
# Copy this file to .env and update with your actual values

# Server Configuration
PORT=8001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/univent_auth

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_change_this_in_production
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Email Configuration (for password reset)
# For production, use real SMTP credentials
EMAIL_SERVICE=gmail
EMAIL_SECURE=true
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password

# Google OAuth (if needed for backend)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
"@ | Out-File -FilePath "backend/auth-service/.env.example" -Encoding utf8

# Event Service
@"
# Event Service Environment Variables
# Copy this file to .env and update with your actual values

# Server Configuration
PORT=8002
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/univent_events

# JWT Configuration (must match auth-service)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Configuration
CLIENT_URL=http://localhost:5173
"@ | Out-File -FilePath "backend/event-service/.env.example" -Encoding utf8

# Notification Service
@"
# Notification Service Environment Variables
# Copy this file to .env and update with your actual values

# Server Configuration
PORT=8003
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/univent_notifications

# JWT Configuration (must match auth-service)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Configuration
CLIENT_URL=http://localhost:5173
"@ | Out-File -FilePath "backend/notification-service/.env.example" -Encoding utf8

# Leaderboard Service
@"
# Leaderboard Service Environment Variables
# Copy this file to .env and update with your actual values

# Server Configuration
PORT=8004
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/univent_leaderboard

# JWT Configuration (must match auth-service)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Configuration
CLIENT_URL=http://localhost:5173
"@ | Out-File -FilePath "backend/leaderboard-service/.env.example" -Encoding utf8

# Settings Service
@"
# Settings Service Environment Variables
# Copy this file to .env and update with your actual values

# Server Configuration
PORT=8005
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/univent_settings

# JWT Configuration (must match auth-service)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# CORS Configuration
CLIENT_URL=http://localhost:5173
"@ | Out-File -FilePath "backend/settings-service/.env.example" -Encoding utf8

# Gateway
@"
# API Gateway Environment Variables
# Copy this file to .env and update with your actual values

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173

# Microservice URLs
# These are the URLs where each microservice is running
AUTH_SERVICE=http://localhost:8001
EVENT_SERVICE=http://localhost:8002
NOTIFICATION_SERVICE=http://localhost:8003
LEADERBOARD_SERVICE=http://localhost:8004
SETTINGS_SERVICE=http://localhost:8005

# For production, update these to your deployed service URLs
# Example:
# AUTH_SERVICE=https://univent-auth-service.onrender.com
# EVENT_SERVICE=https://univent-event-service.onrender.com
# NOTIFICATION_SERVICE=https://univent-notification-service.onrender.com
# LEADERBOARD_SERVICE=https://univent-leaderboard-service.onrender.com
# SETTINGS_SERVICE=https://univent-settings-service.onrender.com
"@ | Out-File -FilePath "backend/gateway/.env.example" -Encoding utf8

# Frontend
@"
# Frontend Environment Variables
# Copy this file to .env and update with your actual values
# Note: In Vite, all environment variables must be prefixed with VITE_

# API Gateway URL (if using gateway)
VITE_API_URL=http://localhost:8000

# Individual Service URLs (if not using gateway)
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_EVENT_SERVICE_URL=http://localhost:8002
VITE_NOTIFICATION_SERVICE_URL=http://localhost:8003
VITE_LEADERBOARD_SERVICE_URL=http://localhost:8004
VITE_SETTINGS_SERVICE_URL=http://localhost:8005

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id_here

# For production, update these to your deployed service URLs
# Example:
# VITE_API_URL=https://univent-gateway.onrender.com
# VITE_NOTIFICATION_SERVICE_URL=https://univent-notification-service.onrender.com
# VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
"@ | Out-File -FilePath "frontend/.env.example" -Encoding utf8

Write-Host "All .env.example files have been created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy each .env.example file to .env in the same directory"
Write-Host "2. Update the values in each .env file with your actual configuration"
Write-Host "3. See ENV_SETUP.md for detailed instructions"

