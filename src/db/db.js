const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecting to MongoDB...');
  } catch (error) {
    console.error(
      `Failed to connect to MongoDB. URI: ${process.env.MONGO_URI}`
    );
    console.error('Error Details:', error);
    console.error('Error Name:', error.name);
    console.error('Stack Trace:', error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
