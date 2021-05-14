const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load Env vars
dotenv.config({
    path: './config/config.env',
});

// Connect to Database
connectDB();

const bootcamps = require('./routes/bootcamps');

const app = express();

// Body Parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount Routers
app.use('/api/v1/bootcamps', bootcamps);

app.use(errorHandler);

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
