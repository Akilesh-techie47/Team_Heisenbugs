import mongoose from 'mongoose';

// Reusable MongoDB connection for LostFound+ backend.
// A single shared connection is established at server startup;
// never create a new connection per API request.
export async function connectDB(): Promise<void> {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostfoundplus';

  try {
    const conn = await mongoose.connect(uri);
    console.log(
      `MongoDB connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
    );
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

export default connectDB;
