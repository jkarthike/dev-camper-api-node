const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');

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

// Create an app with express
const app = express();

// Body Parser
app.use(express.json());

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
