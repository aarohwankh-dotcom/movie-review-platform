/**
 * Database Seeder Utility - Real Movies & Authentic Critiques
 * Case Study 118: Movie Review Platform
 * Semester 3 Backend Development - ITM Skills University
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
    password: 'password123',
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
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral culpability, geopolitical tensions, and scientific ambition.',
    genre: 'Drama',
    releaseYear: 2023,
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  },
  {
    title: 'Interstellar',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humanity.',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  },
  {
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    genre: 'Action',
    releaseYear: 2008,
    posterUrl: 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., while grappling with tragic personal memories.',
    genre: 'Sci-Fi',
    releaseYear: 2010,
    posterUrl: 'https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
  },
  {
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence, dark humor, and unexpected redemption in Los Angeles.',
    genre: 'Crime',
    releaseYear: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w780/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence, forcing him to redefine what it means to be a hero.',
    genre: 'Animation',
    releaseYear: 2023,
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
  },
  {
    title: 'Spirited Away',
    description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, where humans are changed into beasts.',
    genre: 'Animation',
    releaseYear: 2001,
    posterUrl: 'https://image.tmdb.org/t/p/w780/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    title: 'The Shawshank Redemption',
    description: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion within the harsh walls of Shawshank prison.',
    genre: 'Drama',
    releaseYear: 1994,
    posterUrl: 'https://image.tmdb.org/t/p/w780/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting database population with real cinematic catalog...');

    await Review.deleteMany({});
    await Movie.deleteMany({});
    await User.deleteMany({});
    console.log('[Seeder] Cleared previous records');

    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`[Seeder] Created ${createdUsers.length} test users`);

    const createdMovies = [];
    for (const m of moviesData) {
      const movie = await Movie.create({
        ...m,
        createdBy: createdUsers[0]._id,
      });
      createdMovies.push(movie);
    }
    console.log(`[Seeder] Created ${createdMovies.length} real movies`);

    const reviewsData = [
      {
        movie: createdMovies[0]._id, // Oppenheimer
        user: createdUsers[0]._id,  // Aaroh
        rating: 5,
        reviewText: 'A monolithic cinematic achievement. Cillian Murphy delivers a haunting, career-defining performance as the father of the atomic bomb. Ludwig Göransson\'s pulsating score ratchets up unbearable tension in the Trinity test sequence.',
      },
      {
        movie: createdMovies[0]._id, // Oppenheimer
        user: createdUsers[1]._id,  // Priya
        rating: 5,
        reviewText: 'Nolan crafts an intense biographical thriller that feels like a psychological horror film. The sound design during the gymnasium speech gives goosebumps.',
      },
      {
        movie: createdMovies[1]._id, // Interstellar
        user: createdUsers[0]._id,  // Aaroh
        rating: 5,
        reviewText: 'Hans Zimmer\'s organ score and Hoyte van Hoytema\'s 70mm cinematography create pure emotional resonance. The docking sequence remains one of the greatest moments in sci-fi history.',
      },
      {
        movie: createdMovies[1]._id, // Interstellar
        user: createdUsers[2]._id,  // Rajesh
        rating: 4,
        reviewText: 'Ambitious, breathtaking, and scientifically grounded. The emotional core between Cooper and Murph anchors the expansive theoretical physics concepts.',
      },
      {
        movie: createdMovies[2]._id, // The Dark Knight
        user: createdUsers[0]._id,  // Aaroh
        rating: 5,
        reviewText: 'Heath Ledger\'s Joker is legendary. The gold standard for comic book adaptations and psychological crime thrillers that transcended the superhero genre completely.',
      },
      {
        movie: createdMovies[2]._id, // The Dark Knight
        user: createdUsers[1]._id,  // Priya
        rating: 5,
        reviewText: 'A relentless ethical debate disguised as a summer blockbuster. Practical stunts, IMAX cameras, and impeccable pacing from start to finish.',
      },
      {
        movie: createdMovies[3]._id, // Inception
        user: createdUsers[2]._id,  // Rajesh
        rating: 5,
        reviewText: 'Mind-bending architecture and layered narrative structure. Nolan balances complex dream mechanics with intimate emotional stakes effortlessly.',
      },
      {
        movie: createdMovies[5]._id, // Across the Spider-Verse
        user: createdUsers[1]._id,  // Priya
        rating: 5,
        reviewText: 'A visual revolution in animation. Each universe has its own distinct art style, and the musical pacing by Metro Boomin and Daniel Pemberton is extraordinary.',
      },
    ];

    await Review.insertMany(reviewsData);
    console.log(`[Seeder] Inserted ${reviewsData.length} genuine critiques`);
    console.log('[Seeder] ✓ Database populated successfully with authentic cinematic catalog!');
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
  }
};

if (require.main === module) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
