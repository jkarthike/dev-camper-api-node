const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load Env vars
dotenv.config({
    path: './config/config.env',
});

// Connect to Database
connectDB();

// Routers
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

// Create an app with express
const app = express();

// Body Parser
app.use(express.json());

// Sanitize data
app.use(mongoSanitize());

// Set Security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Limit number of requests to server
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

// To limit num of requests
app.use(limiter);

// To precent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

// App runs in port 5000
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}!`);
});

// Handle unhandled exceptions
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => {
        process.exit(1);
    });
});
