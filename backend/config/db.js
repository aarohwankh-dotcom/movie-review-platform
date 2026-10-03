/**
 * Database Connection Configuration
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Supports:
 * 1. MongoDB Atlas (Cloud) via process.env.MONGODB_URI
 * 2. Local MongoDB Daemon (mongodb://127.0.0.1:27017/movie_review_db)
 * 3. In-Memory MongoDB Server fallback (ensures zero-crash local execution)
 */

const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. If explicit Atlas or local URI is provided, attempt connection
  if (uri && uri.trim() !== '') {
    try {
      console.log(`[MongoDB] Attempting connection to: ${uri.split('@')[1] ? 'MongoDB Atlas (Cluster)' : uri}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000, // 5s timeout
      });
      console.log(`[MongoDB] Connected successfully to: ${conn.connection.host} / ${conn.connection.name}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB Warning] Could not connect to configured URI (${err.message}).`);
      console.log('[MongoDB] Falling back to automated in-memory MongoDB instance for local demonstration...');
    }
  }

  // 2. Fallback: Launch in-memory MongoDB instance for reliable offline demo
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[MongoDB] In-Memory MongoDB running and connected at: ${memoryUri}`);
  } catch (err) {
    console.error(`[MongoDB Error] Failed to connect to any MongoDB instance: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
