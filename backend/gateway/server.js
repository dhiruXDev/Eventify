const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Set up rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(limiter);

// Service endpoints - ALWAYS use 127.0.0.1 for local microservices on Windows
const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://127.0.0.1:8001';
const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://127.0.0.1:8002';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://127.0.0.1:8003';
const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://127.0.0.1:8004';
const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://127.0.0.1:8005';

console.log('[GATEWAY] Target Services:', { AUTH_SERVICE, EVENT_SERVICE });

// Logger
app.use((req, res, next) => {
    console.log(`[GATEWAY] --> ${req.method} ${req.originalUrl}`);
    next();
});

// Proxy factory
const createProxy = (target) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        proxyTimeout: 120000,
        timeout: 120000,
        // CRITICAL: Handle path rewriting to ensure /api/ prefix is preserved
        // Using req.originalUrl is the most reliable way to match what the client sent
        pathRewrite: (path, req) => {
            return req.originalUrl;
        },
        onProxyReq: (proxyReq, req) => {
            // Forward Authorization header
            if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
            }
        },
        onProxyRes: (proxyRes, req) => {
            console.log(`[GATEWAY] <-- ${proxyRes.statusCode} from ${target}${req.originalUrl}`);
        },
        onError: (err, req, res) => {
            console.error(`[GATEWAY] !!! Proxy ERROR for ${req.originalUrl}:`, err.message);
            if (!res.headersSent) {
                // Return 502 Bad Gateway with more context
                res.status(502).json({
                    success: false,
                    message: 'Service Temporarily Unavailable',
                    error: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
        }
    });
};

// CRITICAL: Mount proxies BEFORE body parser so the request stream is preserved for the target services
app.use('/api/auth', createProxy(AUTH_SERVICE));
app.use('/api/admin', createProxy(AUTH_SERVICE));
app.use('/api/events', createProxy(EVENT_SERVICE));
app.use('/api/clubs', createProxy(EVENT_SERVICE));
app.use('/api/notifications', createProxy(NOTIFICATION_SERVICE));
app.use('/api/leaderboard', createProxy(LEADERBOARD_SERVICE));
app.use('/api/settings', createProxy(SETTINGS_SERVICE));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Gateway running', targets: { auth: AUTH_SERVICE, event: EVENT_SERVICE } });
});

// Standard middleware for non-proxy routes only (like /health)
app.use(express.json({ limit: '50mb' }));
app.use(helmet());
app.use(cors({
    origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`\n[GATEWAY] API Gateway listening on port ${PORT}`);
    console.log(`[GATEWAY] Routing /api/clubs -> ${EVENT_SERVICE}/api/clubs\n`);
});  