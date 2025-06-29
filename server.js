const express = require('express');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to database with retry mechanism
const connectWithRetry = async () => {
  console.log('Attempting to connect to MongoDB...');
  const connected = await connectDB();
  
  if (!connected) {
    console.log('Will retry MongoDB connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// ...existing code...