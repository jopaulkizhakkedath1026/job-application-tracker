import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in backend/.env file.');
    }
    const conn = await mongoose.connect(uri);
    console.log(`=========================================`);
    console.log(`✅ [MongoDB Atlas Connected]`);
    console.log(`🗄️  Host: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`=========================================`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error.message}`);
    console.log(`👉 Please verify the MONGODB_URI in backend/.env file.`);
  }
};

export default connectDB;
