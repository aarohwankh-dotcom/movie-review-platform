/**
 * Movie Controller
 * Case Study 118: Movie Review Platform
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Features:
 * - CRUD operations for Movie documents
 * - MongoDB Aggregation Pipeline for calculating dynamic average rating ($match, $group, $avg, $sum)
 * - Automatic cascade cleanup on movie deletion
 */

const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Review = require('../models/Review');

// Helper function: Run MongoDB Aggregation Pipeline to compute movie average rating
const computeMovieAverageRating = async (movieId) => {
  const objectId = new mongoose.Types.ObjectId(movieId);

  const stats = await Review.aggregate([
    // Stage 1: Filter reviews strictly matching this specific Movie ID
    {
      $match: { movie: objectId },
    },
    // Stage 2: Group all matching reviews to compute average rating and total count
    {
      $group: {
        _id: '$movie',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    return {
      movieId: movieId.toString(),
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal place (e.g. 4.3)
      totalReviews: stats[0].totalReviews,
    };
  }

  // Fallback when no reviews have been submitted yet
  return {
    movieId: movieId.toString(),
    averageRating: 0,
    totalReviews: 0,
  };
};

// @desc    Get all movies with dynamically computed average ratings
// @route   GET /api/movies
// @access  Public
const getAllMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });

    // Aggregate rating statistics for all movies in parallel
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        const ratingStats = await computeMovieAverageRating(movie._id);
        return {
          ...movie.toObject(),
          averageRating: ratingStats.averageRating,
          totalReviews: ratingStats.totalReviews,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: moviesWithRatings.length,
      data: moviesWithRatings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single movie by ID with rating stats and populated reviews
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: `Movie not found with id: ${req.params.id}`,
      });
    }

    // Dynamic aggregation for this movie
    const ratingStats = await computeMovieAverageRating(movie._id);

    // Fetch all reviews for this movie, populated with reviewer name and email
    const reviews = await Review.find({ movie: movie._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...movie.toObject(),
        averageRating: ratingStats.averageRating,
        totalReviews: ratingStats.totalReviews,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate average rating for a movie using Mongoose Aggregation ($avg, $group, $match)
// @route   GET /api/movies/:id/average-rating
// @access  Public (Case Study Core Requirement Part 10)
const getMovieAverageRating = async (req, res, next) => {
  try {
    const movieId = req.params.id;

    // Verify valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid movie ID format: ${movieId}`,
      });
    }

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: `Movie not found with id: ${movieId}`,
      });
    }

    // Run Mongoose aggregation pipeline
    const stats = await computeMovieAverageRating(movieId);

    res.status(200).json({
      success: true,
      message: 'Average rating calculated successfully via MongoDB aggregation pipeline',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private (Requires JWT)
const createMovie = async (req, res, next) => {
  try {
    const { title, description, genre, releaseYear, posterUrl } = req.body;

    const movie = await Movie.create({
      title,
      description,
      genre,
      releaseYear,
      posterUrl: posterUrl || undefined,
      createdBy: req.user ? req.user._id : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update movie details
// @route   PATCH /api/movies/:id
// @access  Private (Requires JWT)
const updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: `Movie not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete movie and cascade delete all its reviews
// @route   DELETE /api/movies/:id
// @access  Private (Requires JWT)
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: `Movie not found with id: ${req.params.id}`,
      });
    }

    // Delete all reviews associated with this movie
    await Review.deleteMany({ movie: movie._id });

    // Delete movie document
    await movie.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Movie and associated reviews deleted successfully',
      deletedMovieId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics (Total movies, total reviews, platform average rating)
// @route   GET /api/movies/dashboard/stats
// @access  Public
const getDashboardStats = async (req, res, next) => {
  try {
    const totalMovies = await Movie.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Aggregation across all reviews on the platform
    const platformAvgResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          platformAvgRating: { $avg: '$rating' },
        },
      },
    ]);

    const platformAvg =
      platformAvgResult.length > 0
        ? Math.round(platformAvgResult[0].platformAvgRating * 10) / 10
        : 0;

    const recentMovies = await Movie.find().sort({ createdAt: -1 }).limit(4);

    res.status(200).json({
      success: true,
      data: {
        totalMovies,
        totalReviews,
        platformAverageRating: platformAvg,
        recentMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  getMovieAverageRating,
  createMovie,
  updateMovie,
  deleteMovie,
  getDashboardStats,
};
