/**
 * Database Seeder Utility
 * Case Study 118: Movie Review Platform
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Populates realistic movies, demo users, and initial reviews to demonstrate:
 * - Dynamic MongoDB average rating aggregation
 * - Ownership-based review authorization (User A vs User B)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const { connectDB, disconnectDB } = require('../config/db');

dotenv.config();

const usersData = [
  {
    name: 'Aaroh Wankhade',
    email: 'aaroh@example.com',
    password: 'password123', // Will be hashed via pre-save hook
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
  },
  {
    name: 'Rajesh Mehta',
    email: 'rajesh@example.com',
    password: 'password123',
  },
];

const moviesData = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    genre: 'Sci-Fi',
    releaseYear: 2010,
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop',
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: 'Action',
    releaseYear: 2008,
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop',
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    genre: 'Crime',
    releaseYear: 1994,
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=800&auto=format&fit=crop',
  },
  {
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, a world where humans are changed into beasts.',
    genre: 'Animation',
    releaseYear: 2001,
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop',
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
    genre: 'Drama',
    releaseYear: 1994,
    posterUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting database population...');

    // Clear existing collections
    await Review.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Cleared previous records');

    // Create Users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seeder] Created ${createdUsers.length} test users`);

    // Create Movies
    const createdMovies = [];
    for (const m of moviesData) {
      const movie = await Movie.create({
        ...m,
        createdBy: createdUsers[0]._id,
      });
      createdMovies.push(movie);
    }
    console.log(`[Seeder] Created ${createdMovies.length} movies`);

    // Create Initial Reviews
    const reviewsData = [
      {
        movie: createdMovies[0]._id, // Inception
        user: createdUsers[0]._id,  // Aaroh
        rating: 5,
        reviewText: 'Christopher Nolan at his pinnacle! Mind-bending visuals and Hans Zimmer score is pure perfection.',
      },
      {
        movie: createdMovies[0]._id, // Inception
        user: createdUsers[1]._id,  // Priya
        rating: 4,
        reviewText: 'Incredible storytelling and complex concepts. Demands your full attention from start to finish.',
      },
      {
        movie: createdMovies[1]._id, // Dark Knight
        user: createdUsers[0]._id,  // Aaroh
        rating: 5,
        reviewText: 'Heath Ledger\'s Joker is legendary. The gold standard for comic book adaptations and psychological thrillers.',
      },
      {
        movie: createdMovies[1]._id, // Dark Knight
        user: createdUsers[2]._id,  // Rajesh
        rating: 5,
        reviewText: 'Masterpiece cinema. Gripping pacing, intense moral conflicts, and unforgettable acting.',
      },
      {
        movie: createdMovies[2]._id, // Interstellar
        user: createdUsers[1]._id,  // Priya
        rating: 5,
        reviewText: 'A deeply emotional journey through space and time. The docking scene gives goosebumps every single time.',
      },
      {
        movie: createdMovies[3]._id, // Pulp Fiction
        user: createdUsers[2]._id,  // Rajesh
        rating: 4,
        reviewText: 'Iconic dialogue and non-linear narrative structure. Tarantino defined 90s cinema with this one.',
      },
    ];

    await Review.insertMany(reviewsData);
    console.log(`[Seeder] Inserted ${reviewsData.length} initial reviews`);

    console.log('[Seeder] ✓ Database populated successfully with demo data!');
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
  }
};

// If run directly from CLI
if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
