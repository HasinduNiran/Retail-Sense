const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Provide more descriptive error message based on error type
    if (error.code === 'ENOTFOUND') {
      console.error('Could not resolve the MongoDB host. Please check:');
      console.error('1. Your internet connection');
      console.error('2. The MongoDB connection string in your .env file');
      console.error('3. If the MongoDB Atlas cluster is active and accessible');
    }
    
    // Don't exit the process, let the application handle reconnection
    return false;
  }
  return true;
};

module.exports = connectDB;
