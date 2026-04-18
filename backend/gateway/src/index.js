// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const dotenv = require('dotenv');
// const rateLimit = require('express-rate-limit');

// // Load environment vari ables
// dotenv.config();

// // Create Express app
// const app = express();

// // Set up rate limiter: max 100 requests per 15 minutes per IP
// const limiter = rateLimit({
//   windowMs: 15 * 60  * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // Apply rate limiting to all requests
// app.use(limiter);

// // Middleware
// app.use(helmet()); // Set security headers
// app.use(cors({
//   origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// })); // Enable CORS for all routes

// // Parse JSON body and store raw buffer for proxy forwarding
// app.use(express.json({ 
//   limit: '50mb',
//   verify: (req, res, buf, encoding) => {
//     // Store raw body buffer for proxy forwarding
//     req.rawBody = buf;
//   }
// }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Service endpoints
// const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
// const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
// const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
// const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
// const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

// // Proxy middleware options
// const proxyOptions = {
//   changeOrigin: true,
//   // Increase proxy timeout for large payloads (base64 images)
//   proxyTimeout: 120000, // 120 seconds (2 minutes) for large uploads
//   timeout: 120000,
//   // Buffer the request - needed for POST/PUT with body
//   // The body is already parsed by express.json above
//   pathRewrite: {
//     '^/api/auth': '/api/auth',
//     '^/api/events': '/api/events',
//     '^/api/clubs': '/api/clubs',
//     '^/api/notifications': '/api/notifications',
//     '^/api/leaderboard': '/api/leaderboard',
//     '^/api/settings': '/api/settings',
//     '^/api/admin': '/api/admin'
//   }
// };

// // Proxy routes with better error handling
// const clubsProxy = createProxyMiddleware({ 
//   ...proxyOptions, 
//   target: EVENT_SERVICE,
//   onProxyReq: (proxyReq, req, res) => {
//     console.log(`[GATEWAY] Proxying ${req.method} ${req.originalUrl} to ${EVENT_SERVICE}${req.originalUrl}`);
//     console.log(`[GATEWAY] Has rawBody:`, !!req.rawBody, 'Length:', req.rawBody ? req.rawBody.length : 0);
//     console.log(`[GATEWAY] Request headers:`, JSON.stringify(req.headers, null, 2));

//     // Set longer timeout for large requests
//     proxyReq.setTimeout(120000);

//     // If we have rawBody buffer, we need to write it manually
//     // because express.json() consumed the original stream
//     if (req.rawBody && req.rawBody.length > 0 && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
//       console.log(`[GATEWAY] Writing rawBody buffer, length: ${req.rawBody.length} bytes`);
//       // Remove any existing Content-Length
//       proxyReq.removeHeader('Content-Length');
//       // Set correct headers
//       proxyReq.setHeader('Content-Type', 'application/json');
//       proxyReq.setHeader('Content-Length', req.rawBody.length);
//       // Copy Authorization header if present
//       if (req.headers.authorization) {
//         proxyReq.setHeader('Authorization', req.headers.authorization);
//       }
//       // Write the raw buffer
//       proxyReq.write(req.rawBody);
//       // End the request
//       proxyReq.end();
//       console.log(`[GATEWAY] Request body forwarded successfully`);
//     } else if (req.body && Object.keys(req.body).length > 0 && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
//       // Fallback: stringify parsed body
//       console.log(`[GATEWAY] Using parsed body, keys:`, Object.keys(req.body));
//       const bodyData = JSON.stringify(req.body);
//       proxyReq.removeHeader('Content-Length');
//       proxyReq.setHeader('Content-Type', 'application/json');
//       proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
//       if (req.headers.authorization) {
//         proxyReq.setHeader('Authorization', req.headers.authorization);
//       }
//       proxyReq.write(bodyData);
//       proxyReq.end();
//       console.log(`[GATEWAY] Parsed body forwarded`);
//     } else {
//       console.log(`[GATEWAY] No body to forward, letting proxy handle normally`);
//     }
//   },
//   onProxyRes: (proxyRes, req, res) => {
//     console.log(`[GATEWAY] Response from EVENT_SERVICE: ${proxyRes.statusCode} for ${req.originalUrl}`);
//   },
//   onError: (err, req, res) => {
//     // Handle connection errors gracefully
//     if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message.includes('request aborted')) {
//       if (!res.headersSent) {
//         return res.status(408).json({
//           success: false,
//           message: 'Request timeout. The request took too long to process. Please try again with a smaller image or check your connection.'
//         });
//       }
//     }

//     if (!res.headersSent) {
//       res.status(502).json({
//         success: false,
//         message: 'Service temporarily unavailable. Please try again.'
//       });
//     }
//   }
// });

// app.use('/api/auth', createProxyMiddleware({ ...proxyOptions, target: AUTH_SERVICE }));
// app.use('/api/admin', createProxyMiddleware({ ...proxyOptions, target: AUTH_SERVICE }));
// app.use('/api/events', createProxyMiddleware({ ...proxyOptions, target: EVENT_SERVICE }));
// app.use('/api/clubs', clubsProxy);
// app.use('/api/notifications', createProxyMiddleware({ ...proxyOptions, target: NOTIFICATION_SERVICE }));
// app.use('/api/leaderboard', createProxyMiddleware({ ...proxyOptions, target: LEADERBOARD_SERVICE }));
// app.use('/api/settings', createProxyMiddleware({ ...proxyOptions, target: SETTINGS_SERVICE }));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'API Gateway is running' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   // Don't send response if headers already sent
//   if (res.headersSent) {
//     return next(err);
//   }

//   // Handle payload too large error specifically
//   if (err.type === 'entity.too.large' || err.message.includes('request entity too large')) {
//     return res.status(413).json({
//       success: false,
//       message: 'Request payload too large. Please reduce the image size or use a smaller image file.'
//     });
//   }

//   // Handle request aborted/timeout errors
//   if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message.includes('request aborted')) {
//     return res.status(408).json({
//       success: false,
//       message: 'Request timeout. The request took too long to process. Please try again with a smaller image or check your connection.'
//     });
//   }

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // Start server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`API Gateway running on port ${PORT}`);
// });


// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const dotenv = require('dotenv');
// const rateLimit = require('express-rate-limit');

// // Load environment variables
// dotenv.config();

// // Create Express app
// const app = express();

// // Set up rate limiter: max 100 requests per 15 minutes per IP
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// // Apply rate limiting to all requests
// app.use(limiter);

// // Middleware
// app.use(helmet());
// app.use(cors({
//   origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// // Service endpoints
// const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
// const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
// const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
// const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
// const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

// // IMPORTANT: Don't parse body for proxy routes - let the target service handle it
// // Only parse for non-proxy routes (like /health)

// // Proxy middleware options
// const createProxyOptions = (target, pathPrefix) => ({
//   target,
//   changeOrigin: true,
//   proxyTimeout: 120000,
//   timeout: 120000,
//   // Let http-proxy-middleware handle the body parsing
//   parseReqBody: false,
//   onProxyReq: (proxyReq, req, res) => {
//     console.log(`[GATEWAY] Proxying ${req.method} ${req.originalUrl} to ${target}${req.originalUrl}`);

//     // Set longer timeout
//     proxyReq.setTimeout(120000);

//     // Forward Authorization header
//     if (req.headers.authorization) {
//       proxyReq.setHeader('Authorization', req.headers.authorization);
//     }

//     // For requests with body, we need to handle it properly
//     if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
//       const bodyData = JSON.stringify(req.body);

//       // Update headers
//       proxyReq.setHeader('Content-Type', 'application/json');
//       proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

//       // Write body
//       proxyReq.write(bodyData);
//     }
//   },
//   onProxyRes: (proxyRes, req, res) => {
//     console.log(`[GATEWAY] Response from ${target}: ${proxyRes.statusCode} for ${req.originalUrl}`);
//   },
//   onError: (err, req, res) => {
//     console.error(`[GATEWAY] Proxy error:`, err.message);

//     if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.message.includes('timeout')) {
//       if (!res.headersSent) {
//         return res.status(408).json({
//           success: false,
//           message: 'Request timeout. Please try again with a smaller image or check your connection.'
//         });
//       }
//     }

//     if (!res.headersSent) {
//       res.status(502).json({
//         success: false,
//         message: 'Service temporarily unavailable. Please try again.'
//       });
//     }
//   }
// });

// // Parse JSON ONLY for specific routes, not for proxy routes
// app.use('/health', express.json({ limit: '50mb' }));

// // Setup proxies with body parsing
// app.use('/api/auth', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(AUTH_SERVICE, '/api/auth')));
// app.use('/api/admin', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(AUTH_SERVICE, '/api/admin')));
// app.use('/api/events', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(EVENT_SERVICE, '/api/events')));
// app.use('/api/clubs', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(EVENT_SERVICE, '/api/clubs')));
// app.use('/api/notifications', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(NOTIFICATION_SERVICE, '/api/notifications')));
// app.use('/api/leaderboard', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(LEADERBOARD_SERVICE, '/api/leaderboard')));
// app.use('/api/settings', express.json({ limit: '50mb' }), createProxyMiddleware(createProxyOptions(SETTINGS_SERVICE, '/api/settings')));

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok', message: 'API Gateway is running' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);
//   }

//   if (err.type === 'entity.too.large' || err.message.includes('request entity too large')) {
//     return res.status(413).json({
//       success: false,
//       message: 'Request payload too large. Please reduce the image size.'
//     });
//   }

//   if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
//     return res.status(408).json({
//       success: false,
//       message: 'Request timeout. Please try again.'
//     });
//   }

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // Start server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`API Gateway running on port ${PORT}`);
// });

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const dotenv = require('dotenv');
// const rateLimit = require('express-rate-limit');

// dotenv.config();

// const app = express();

// // Rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// app.use(limiter);
// app.use(helmet());
// app.use(cors({
//   origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// // Service endpoints
// const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
// const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
// const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
// const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
// const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

// console.log('[GATEWAY] Service endpoints configured:');
// console.log('[GATEWAY] - AUTH_SERVICE:', AUTH_SERVICE);
// console.log('[GATEWAY] - EVENT_SERVICE:', EVENT_SERVICE);
// console.log('[GATEWAY] - NOTIFICATION_SERVICE:', NOTIFICATION_SERVICE);
// console.log('[GATEWAY] - LEADERBOARD_SERVICE:', LEADERBOARD_SERVICE);
// console.log('[GATEWAY] - SETTINGS_SERVICE:', SETTINGS_SERVICE);

// // CRITICAL: Parse body BEFORE proxy routes
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`\n[GATEWAY] ========================================`);
//   console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
//   console.log(`[GATEWAY] Time: ${new Date().toISOString()}`);
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log(`[GATEWAY] Body keys:`, Object.keys(req.body));
//     console.log(`[GATEWAY] Body.name:`, req.body.name);
//   }
//   console.log(`[GATEWAY] ========================================\n`);
//   next();
// });

// // Simple proxy factory
// const createProxy = (target, serviceName) => {
//   return createProxyMiddleware({
//     target,
//     changeOrigin: true,
//     logLevel: 'warn',
//     timeout: 120000,
//     proxyTimeout: 120000,
//     onProxyReq: (proxyReq, req, res) => {
//       console.log(`[GATEWAY] --> Forwarding to ${serviceName} (${target})`);
//       console.log(`[GATEWAY] --> ${req.method} ${req.path}`);

//       // Forward body for POST/PUT/PATCH requests
//       if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
//         const bodyData = JSON.stringify(req.body);
//         console.log(`[GATEWAY] --> Body size: ${bodyData.length} bytes`);

//         // Set headers
//         proxyReq.setHeader('Content-Type', 'application/json');
//         proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

//         // Write body
//         proxyReq.write(bodyData);
//       }
//     },
//     onProxyRes: (proxyRes, req, res) => {
//       console.log(`[GATEWAY] <-- ${serviceName} responded: ${proxyRes.statusCode}`);
//     },
//     onError: (err, req, res) => {
//       console.error(`[GATEWAY] ERROR proxying to ${serviceName}:`, err.message);
//       console.error(`[GATEWAY] Target was: ${target}`);

//       if (!res.headersSent) {
//         res.status(502).json({
//           success: false,
//           message: `${serviceName} is unavailable. Please ensure it's running.`,
//           error: process.env.NODE_ENV === 'development' ? err.message : undefined
//         });
//       }
//     }
//   });
// };

// // Setup proxy routes
// console.log('[GATEWAY] Setting up proxy routes...');

// app.use('/api/auth', createProxy(AUTH_SERVICE, 'AUTH'));
// app.use('/api/admin', createProxy(AUTH_SERVICE, 'AUTH'));
// app.use('/api/events', createProxy(EVENT_SERVICE, 'EVENT'));
// app.use('/api/clubs', createProxy(EVENT_SERVICE, 'EVENT'));
// app.use('/api/notifications', createProxy(NOTIFICATION_SERVICE, 'NOTIFICATION'));
// app.use('/api/leaderboard', createProxy(LEADERBOARD_SERVICE, 'LEADERBOARD'));
// app.use('/api/settings', createProxy(SETTINGS_SERVICE, 'SETTINGS'));

// console.log('[GATEWAY] Proxy routes configured');

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     message: 'API Gateway is running',
//     services: {
//       auth: AUTH_SERVICE,
//       event: EVENT_SERVICE,
//       notification: NOTIFICATION_SERVICE,
//       leaderboard: LEADERBOARD_SERVICE,
//       settings: SETTINGS_SERVICE
//     }
//   });
// });

// // 404 handler for unmatched routes
// app.use((req, res) => {
//   console.log(`[GATEWAY] 404 - Route not found: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`
//   });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);
//   }

//   console.error('[GATEWAY] Error:', err.message);
//   console.error('[GATEWAY] Stack:', err.stack);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// const PORT = process.env.PORT || 8000;
// const server = app.listen(PORT, () => {
//   console.log(`\n[GATEWAY] ========================================`);
//   console.log(`[GATEWAY] API Gateway running on port ${PORT}`);
//   console.log(`[GATEWAY] Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`[GATEWAY] ========================================\n`);
// });

// // Handle server timeout
// server.setTimeout(120000); // 2 minutes

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('[GATEWAY] SIGTERM received, shutting down gracefully');
//   server.close(() => {
//     console.log('[GATEWAY] Server closed');
//     process.exit(0);
//   });
// });



// Now ye thisk hai 
// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const dotenv = require('dotenv');
// const rateLimit = require('express-rate-limit');

// dotenv.config();

// const app = express();

// // Rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// app.use(limiter);
// app.use(helmet());
// app.use(cors({
//   origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// // Service endpoints
// const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
// const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
// const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
// const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
// const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

// console.log('[GATEWAY] Service endpoints configured:');
// console.log('[GATEWAY] - EVENT_SERVICE:', EVENT_SERVICE);

// // CRITICAL: Parse body BEFORE proxy routes
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Log all incoming requests
// app.use((req, res, next) => {
//   console.log(`\n[GATEWAY] ========================================`);
//   console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
//   console.log(`[GATEWAY] Time: ${new Date().toISOString()}`);
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log(`[GATEWAY] Body keys:`, Object.keys(req.body));
//     console.log(`[GATEWAY] Body.name:`, req.body.name);
//   }
//   console.log(`[GATEWAY] ========================================\n`);
//   next();
// });

// // Proxy configuration - CRITICAL: router option keeps the full path
// const proxyOptions = {
//   changeOrigin: true,
//   logLevel: 'debug',
//   timeout: 120000,
//   proxyTimeout: 120000,
//   router: (req) => {
//     // Route based on the path
//     if (req.originalUrl.startsWith('/api/auth') || req.originalUrl.startsWith('/api/admin')) {
//       return AUTH_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/events') || req.originalUrl.startsWith('/api/clubs')) {
//       console.log(`[GATEWAY] Routing ${req.originalUrl} to ${EVENT_SERVICE}`);
//       return EVENT_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/notifications')) {
//       return NOTIFICATION_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/leaderboard')) {
//       return LEADERBOARD_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/settings')) {
//       return SETTINGS_SERVICE;
//     }
//     return EVENT_SERVICE; // default
//   },
//   onProxyReq: (proxyReq, req, res) => {
//     const targetService = req.originalUrl.includes('clubs') ? 'EVENT' : 'UNKNOWN';
//     console.log(`[GATEWAY] --> Forwarding to ${targetService}`);
//     console.log(`[GATEWAY] --> ${req.method} ${req.originalUrl}`);

//     // Forward body for POST/PUT/PATCH requests
//     if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
//       const bodyData = JSON.stringify(req.body);
//       console.log(`[GATEWAY] --> Body size: ${bodyData.length} bytes`);
//       console.log(`[GATEWAY] --> Body preview:`, bodyData.substring(0, 100) + '...');

//       // Set headers
//       proxyReq.setHeader('Content-Type', 'application/json');
//       proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

//       // Write body
//       proxyReq.write(bodyData);
//     }
//   },
//   onProxyRes: (proxyRes, req, res) => {
//     console.log(`[GATEWAY] <-- Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
//   },
//   onError: (err, req, res) => {
//     console.error(`[GATEWAY] ERROR:`, err.message);

//     if (!res.headersSent) {
//       res.status(502).json({
//         success: false,
//         message: 'Service temporarily unavailable',
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined
//       });
//     }
//   }
// };

// // Apply proxy to all /api routes
// console.log('[GATEWAY] Setting up proxy for /api/*');
// app.use('/api', createProxyMiddleware(proxyOptions));

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     message: 'API Gateway is running',
//     services: {
//       event: EVENT_SERVICE
//     }
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   console.log(`[GATEWAY] 404 - Route not found: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`
//   });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);
//   }

//   console.error('[GATEWAY] Error:', err.message);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// const PORT = process.env.PORT || 8000;
// const server = app.listen(PORT, () => {
//   console.log(`\n[GATEWAY] ========================================`);
//   console.log(`[GATEWAY] API Gateway running on port ${PORT}`);
//   console.log(`[GATEWAY] Proxying /api/* to respective services`);
//   console.log(`[GATEWAY] EVENT_SERVICE: ${EVENT_SERVICE}`);
//   console.log(`[GATEWAY] ========================================\n`);
// });

// server.setTimeout(120000);

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const { createProxyMiddleware } = require('http-proxy-middleware');
// const dotenv = require('dotenv');
// const rateLimit = require('express-rate-limit');

// dotenv.config();

// const app = express();

// // Rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// app.use(limiter);
// app.use(helmet());
// app.use(cors({
//   origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// }));

// // Service endpoints
// const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
// const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
// const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
// const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
// const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

// console.log('[GATEWAY] Service endpoints configured:');
// console.log('[GATEWAY] - EVENT_SERVICE:', EVENT_SERVICE);

// // Log all incoming requests BEFORE body parsing
// app.use((req, res, next) => {
//   console.log(`\n[GATEWAY] ========================================`);
//   console.log(`[GATEWAY] ${req.method} ${req.originalUrl}`);
//   console.log(`[GATEWAY] Time: ${new Date().toISOString()}`);
//   next();
// });

// // CRITICAL: Parse body AND store raw body for proxy
// app.use(express.json({ 
//   limit: '50mb',
//   verify: (req, res, buf, encoding) => {
//     // Store raw body buffer for proxy forwarding
//     req.rawBody = buf;
//   }
// }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Log parsed body
// app.use((req, res, next) => {
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log(`[GATEWAY] Body keys:`, Object.keys(req.body));
//     console.log(`[GATEWAY] Body.name:`, req.body.name);
//   }
//   console.log(`[GATEWAY] ========================================\n`);
//   next();
// });

// // Proxy configuration - CRITICAL: router option keeps the full path
// const proxyOptions = {
//   changeOrigin: true,
//   logLevel: 'debug',
//   timeout: 120000,
//   proxyTimeout: 120000,
//   router: (req) => {
//     // Route based on the path
//     if (req.originalUrl.startsWith('/api/auth') || req.originalUrl.startsWith('/api/admin')) {
//       return AUTH_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/events') || req.originalUrl.startsWith('/api/clubs')) {
//       console.log(`[GATEWAY] Routing ${req.originalUrl} to ${EVENT_SERVICE}`);
//       return EVENT_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/notifications')) {
//       return NOTIFICATION_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/leaderboard')) {
//       return LEADERBOARD_SERVICE;
//     } else if (req.originalUrl.startsWith('/api/settings')) {
//       return SETTINGS_SERVICE;
//     }
//     return EVENT_SERVICE; // default
//   },
//   onProxyReq: (proxyReq, req, res) => {
//     const targetService = req.originalUrl.includes('clubs') ? 'EVENT' : 'UNKNOWN';
//     console.log(`[GATEWAY] --> Forwarding to ${targetService}`);
//     console.log(`[GATEWAY] --> ${req.method} ${req.originalUrl}`);

//     // Forward body for POST/PUT/PATCH requests
//     if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
//       const bodyData = JSON.stringify(req.body);
//       console.log(`[GATEWAY] --> Body size: ${bodyData.length} bytes`);
//       console.log(`[GATEWAY] --> Body preview:`, bodyData.substring(0, 100) + '...');

//       // Set headers
//       proxyReq.setHeader('Content-Type', 'application/json');
//       proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

//       // Write body
//       proxyReq.write(bodyData);
//     }
//   },
//   onProxyRes: (proxyRes, req, res) => {
//     console.log(`[GATEWAY] <-- Response: ${proxyRes.statusCode} for ${req.originalUrl}`);
//   },
//   onError: (err, req, res) => {
//     console.error(`[GATEWAY] ERROR:`, err.message);

//     if (!res.headersSent) {
//       res.status(502).json({
//         success: false,
//         message: 'Service temporarily unavailable',
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined
//       });
//     }
//   }
// };

// // Apply proxy to all /api routes
// console.log('[GATEWAY] Setting up proxy for /api/*');
// app.use('/api', createProxyMiddleware(proxyOptions));

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ 
//     status: 'ok', 
//     message: 'API Gateway is running',
//     services: {
//       event: EVENT_SERVICE
//     }
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   console.log(`[GATEWAY] 404 - Route not found: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} not found`
//   });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   if (res.headersSent) {
//     return next(err);
//   }

//   console.error('[GATEWAY] Error:', err.message);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

// const PORT = process.env.PORT || 8000;
// const server = app.listen(PORT, () => {
//   console.log(`\n[GATEWAY] ========================================`);
//   console.log(`[GATEWAY] API Gateway running on port ${PORT}`);
//   console.log(`[GATEWAY] Proxying /api/* to respective services`);
//   console.log(`[GATEWAY] EVENT_SERVICE: ${EVENT_SERVICE}`);
//   console.log(`[GATEWAY] ========================================\n`);
// });

// server.setTimeout(120000);



const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use(limiter);
app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'https://univento.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Service endpoints
const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';
const EVENT_SERVICE = process.env.EVENT_SERVICE || 'http://localhost:8002';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE || 'http://localhost:8003';
const LEADERBOARD_SERVICE = process.env.LEADERBOARD_SERVICE || 'http://localhost:8004';
const SETTINGS_SERVICE = process.env.SETTINGS_SERVICE || 'http://localhost:8005';

console.log('[GATEWAY] EVENT_SERVICE:', EVENT_SERVICE);

// Log requests
app.use((req, res, next) => {
  console.log(`\n[GATEWAY] ${req.method} ${req.originalUrl}`);
  next();
});

// Parse body and keep raw buffer
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

// Log parsed body
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`[GATEWAY] Body.name:`, req.body.name);
  }
  next();
});

// Proxy options with path preservation
const createProxy = (target) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    // Reconstruct the path to include what was stripped
    pathRewrite: (path, req) => {
      // When mounted at /api/clubs, 'path' will be '/' for '/api/clubs' request
      // We need to add back '/api/clubs'
      const fullPath = req.baseUrl + path;
      console.log(`[GATEWAY] Path: ${req.baseUrl}${path} -> ${fullPath}`);
      return fullPath;
    },
    onProxyReq: (proxyReq, req) => {
      const fullPath = req.baseUrl + req.path;
      console.log(`[GATEWAY] --> Forwarding ${req.method} to ${target}${fullPath}`);

      // Fix body forwarding - when express.json() parses the body, 
      // the original stream is consumed. We need to restream it.
      if (req.body && Object.keys(req.body).length > 0 &&
        (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const bodyData = JSON.stringify(req.body);
        console.log(`[GATEWAY] --> Body size: ${bodyData.length} bytes`);

        // Remove existing content-length header (may be wrong after body parsing)
        proxyReq.removeHeader('Content-Length');

        // Set correct headers and write body
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
        proxyReq.end();
      }
    },
    onProxyRes: (proxyRes, req) => {
      console.log(`[GATEWAY] <-- Response: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error(`[GATEWAY] Proxy ERROR:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Service unavailable' });
      }
    }
  });
};



// Apply proxies - use specific routes
app.use('/api/auth', createProxy(AUTH_SERVICE));
app.use('/api/admin', createProxy(AUTH_SERVICE));
app.use('/api/events', createProxy(EVENT_SERVICE));
app.use('/api/clubs', createProxy(EVENT_SERVICE));
app.use('/api/notifications', createProxy(NOTIFICATION_SERVICE));
app.use('/api/leaderboard', createProxy(LEADERBOARD_SERVICE));
app.use('/api/settings', createProxy(SETTINGS_SERVICE));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gateway running' });
});

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('[GATEWAY] Error:', err.message);
  res.status(500).json({ success: false, message: 'Internal error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n[GATEWAY] Running on port ${PORT}`);
  console.log(`[GATEWAY] Proxying /api/clubs -> ${EVENT_SERVICE}/api/clubs\n`);
});
