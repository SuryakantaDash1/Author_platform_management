import mongoose from 'mongoose';

// Cache the connection across serverless invocations. Vercel reuses the Node
// process between requests, so caching avoids opening a brand-new connection
// (and exhausting the Atlas connection limit) on every single request.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = global as unknown as { _mongoose?: MongooseCache };
const cached: MongooseCache = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cached;

export const connectDB = async (): Promise<typeof mongoose> => {
  // Already connected (e.g. the long-running local server opened it at startup).
  if (mongoose.connection.readyState === 1) return mongoose;
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI || process.env.MONGODB_URI_PROD;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    cached.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
