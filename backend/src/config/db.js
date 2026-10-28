import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/job_tracker';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB Connected]: Host -> ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Notice]: ${error.message}`);
    console.log('[MongoDB]: Awaiting active database connection. Ensure MONGODB_URI in backend/.env points to your Atlas cluster or local MongoDB instance.');
  }
};

export default connectDB;
