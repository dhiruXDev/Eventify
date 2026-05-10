// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const helmet = require("helmet");
// const dotenv = require("dotenv");
// const rateLimit = require("express-rate-limit");

// // Load environment variables
// dotenv.config();

// // Import routes
// const eventRoutes = require("./src/routes/event.routes");
// const clubRoutes = require("./src/routes/club.routes");

// // Import error handler
// const errorHandler = require("./src/middleware/error.middleware");

// // Create Express app
// const app = express();

// // Set up rate limiter: max 500 requests per 15 minutes per IP
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 500, // Increased limit from 100 to 500 requests per windowMs
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
//   message: "Too many requests from this IP, please try again after 15 minutes",
// });

// // Apply rate limiting to all requests
// app.use(limiter);

// // Middleware
// app.use(helmet()); // Set security headers

// // CORS options
// const corsOptions = {
//   origin: [
//     process.env.CLIENT_URL,
//     "http://localhost:5173",
//     "https://univento.vercel.app",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };


// // Apply CORS middleware
// app.use(cors(corsOptions));

// // Parse JSON request body with increased size limit for base64 images (50MB)
// // Use extended timeout for large payloads
// app.use(express.json({ 
//   limit: '50mb',
//   // Increase parameter limit
//   parameterLimit: 50000,
//   // Don't abort on error - let error handler deal with it
//   strict: false
// }));
// app.use(express.urlencoded({ 
//   extended: true, 
//   limit: '50mb',
//   parameterLimit: 50000
// }));


// // Import database connection
// const connectDB = require("./src/config/db.config");

// // Connect to MongoDB
// connectDB();

// // Routes
// app.use("/api/events", eventRoutes);
// app.use("/api/clubs", (req, res, next) => {
//   console.log(`[EVENT-SERVICE] Club routes middleware - ${req.method} ${req.originalUrl}`);
//   next();
// }, clubRoutes);

// // Health check route
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Event service is running",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Error handling middleware
// app.use(errorHandler);

// module.exports = app;

// // Start server with increased timeout for large requests
// const PORT = process.env.PORT || 8002;
// const server = app.listen(PORT, () => {
//   console.log(`Event service running on port ${PORT}`);
// });

// // Increase server timeout for large payloads (base64 images)
// server.timeout = 120000; // 120 seconds (2 minutes)
// server.keepAliveTimeout = 120000;
// server.headersTimeout = 120000;

//n Ye thisk hai 

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const helmet = require("helmet");
// const dotenv = require("dotenv");
// const rateLimit = require("express-rate-limit");

// // Load environment variables
// dotenv.config();

// // Import routes
// const eventRoutes = require("./src/routes/event.routes");
// const clubRoutes = require("./src/routes/club.routes");

// // Import error handler
// const errorHandler = require("./src/middleware/error.middleware");

// // Create Express app
// const app = express();

// // Set up rate limiter
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 500,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: "Too many requests from this IP, please try again after 15 minutes",
// });

// app.use(limiter);

// // Middleware
// app.use(helmet());

// // CORS options
// const corsOptions = {
//   origin: [
//     process.env.CLIENT_URL,
//     "http://localhost:5173",
//     "http://localhost:8000", // Add gateway
//     "https://univento.vercel.app",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// // Add request logging middleware BEFORE body parsing
// app.use((req, res, next) => {
//   console.log(`[EVENT-SERVICE] ${req.method} ${req.originalUrl}`);
//   console.log(`[EVENT-SERVICE] Headers:`, JSON.stringify(req.headers, null, 2));
//   next();
// });

// // Parse JSON with increased size limit
// app.use(express.json({ 
//   limit: '50mb',
//   parameterLimit: 50000,
//   strict: false
// }));

// app.use(express.urlencoded({ 
//   extended: true, 
//   limit: '50mb',
//   parameterLimit: 50000
// }));

// // Log body after parsing
// app.use((req, res, next) => {
//   if (req.body && Object.keys(req.body).length > 0) {
//     console.log(`[EVENT-SERVICE] Parsed body keys:`, Object.keys(req.body));
//     console.log(`[EVENT-SERVICE] Body name field:`, req.body.name);
//   } else {
//     console.log(`[EVENT-SERVICE] No body or empty body`);
//   }
//   next();
// });

// // Import database connection
// const connectDB = require("./src/config/db.config");

// // Connect to MongoDB
// connectDB();

// // Routes
// app.use("/api/events", eventRoutes);
// app.use("/api/clubs", clubRoutes);

// // Health check route
// app.get("/health", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Event service is running",
//     timestamp: new Date().toISOString(),
//   });
// });

// // Error handling middleware
// app.use(errorHandler);

// module.exports = app;

// // Start server
// const PORT = process.env.PORT || 8002;
// const server = app.listen(PORT, () => {
//   console.log(`Event service running on port ${PORT}`);
// });

// // Increase server timeout
// server.timeout = 120000;
// server.keepAliveTimeout = 120000;
// server.headersTimeout = 120000;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const eventRoutes = require("./src/routes/event.routes");
const clubRoutes = require("./src/routes/club.routes");
const recruitmentRoutes = require("./src/routes/recruitment.routes");
const errorHandler = require("./src/middleware/error.middleware");

const app = express();

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);
app.use(helmet());

// CORS
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:8000", // Gateway
    "https://univento.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Request logging BEFORE body parsing
app.use((req, res, next) => {
  console.log(`\n[EVENT-SERVICE] ========================================`);
  next();
});

// Body parsing
app.use(express.json({
  limit: '50mb',
  parameterLimit: 50000
}));

app.use(express.urlencoded({
  extended: true,
  limit: '50mb',
  parameterLimit: 50000
}));

// Log parsed body AFTER parsing
app.use((req, res, next) => {
  // console.log(`[EVENT-SERVICE] Body parsed:`, !!req.body);
  // if (req.body && Object.keys(req.body).length > 0) {
  //  } else { 
  //   console.log(`[EVENT-SERVICE] No body or empty body`);
  // }
  // console.log(`[EVENT-SERVICE] ========================================\n`);
  next();
});

// Database connection
const connectDB = require("./src/config/db.config");
connectDB();

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/recruitment", recruitmentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event service is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(errorHandler);

module.exports = app;

const PORT = process.env.PORT || 8002;
const server = app.listen(PORT, () => {
  console.log(`[EVENT-SERVICE] Server running on port ${PORT}`);
  console.log(`[EVENT-SERVICE] VERSION: 1.0.1 - DEBUG ROUTES ACTIVE`);
  console.log(`[EVENT-SERVICE] Listening for club requests at /api/clubs`);
});

server.timeout = 120000;
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000; 