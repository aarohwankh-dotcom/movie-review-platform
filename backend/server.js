/**
 * Movie Review Platform - Backend Server
 * Semester 3 Backend Development Project
 * Student: Aaroh Wankhade (Student ID: 150096726175)
 * Institution: ITM Skills University / School of FutureTech
 * Academic Year: 2025–2029
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment configuration
dotenv.config();

const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Movie = require('./models/Movie');
const { seedDatabase } = require('./utils/seedData');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const movieRoutes = require('./routes/movieRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for all cross-origin REST requests
app.use(cors());

// Request logging (morgan)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Built-in body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets for seamless local development
app.use(express.static(path.join(__dirname, '../frontend')));

// Simple Health Check Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Movie Review Platform REST API Running',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server and Database Connection
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is brand new and empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Server] Database is empty. Seeding initial demo data...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log('===========================================================');
      console.log(`🎬 MOVIE REVIEW PLATFORM - REST API RUNNING`);
      console.log(`📍 Server Port    : http://localhost:${PORT}`);
      console.log(`📡 API Base URL   : http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend UI    : http://localhost:${PORT}/index.html`);
      console.log(`👤 Student        : Aaroh Wankhade (ID: 150096726175)`);
      console.log(`🏫 Institution    : ITM Skills University`);
      console.log('===========================================================');
    });

    return server;
  } catch (error) {
    console.error(`[Server Startup Error]: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
