const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventflow_settings', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Settings Service: MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Settings Service: Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;