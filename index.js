require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

global.__basedir = __dirname;

const dbConfig = require('./src/configs/database.js');
const apiRoutes = require('./src/routes/api');
const webRoutes = require('./src/routes/web');

const SERVER_PORT = process.env.SERVER_PORT || 5000;
const app = express();

// View Engine Setup
app.set('views', './src/views');
app.set('view engine', 'ejs');

// Middleware
app.use(morgan('dev'));
app.use(cors()); // Adjust as needed
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(dbConfig.url);
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => console.log('Mongoose connected event listener called'));
mongoose.connection.on('error', (err) => console.error('Mongoose connection error event listener called:', err.message));
mongoose.connection.on('disconnected', () => console.log('Mongoose disconnected event listener called'));

connectDB();

// Routes
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Default Route
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start Server
app.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing MongoDB connection.');
    await mongoose.connection.close();
    process.exit(0);
});
