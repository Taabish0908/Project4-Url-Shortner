require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const urlRoutes = require('./routes/url.routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

// Initialize Express App
const app = express();

// Connect to Databases
connectDB();
connectRedis();

// Security and Utility Middlewares
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // HTTP request logging
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting to prevent abuse
const limiter = rateLimit({
    max: 100, // Limit each IP to 100 requests per windowMs
    windowMs: 60 * 60 * 1000, // 1 Hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/url/shorten', limiter);

// Routes
app.use('/', urlRoutes);

// Unhandled Routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
