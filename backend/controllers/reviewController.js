/**
 * Review Controller
 * Case Study 118: Movie Review Platform
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Features:
 * - Post new review referencing Movie and User
 * - Get all reviews for a movie
 * - Edit own review (protected by ownership authorization)
 * - Delete own review (protected by ownership authorization)
 */

const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

// @desc    Post a new review for a movie
// @route   POST /api/movies/:id/reviews
// @access  Private (Requires JWT)
const createReview = async (req, res, next) => {
  try {
    const movieId = req.params.id;
    const { rating, reviewText } = req.body;

    // 1. Verify valid Movie ObjectId
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid movie ID format: ${movieId}`,
      });
    }

    // 2. Verify target movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: `Movie not found with id: ${movieId}`,
      });
    }

    // 3. Create review document with references to Movie and User
    const review = await Review.create({
      movie: movieId,
      user: req.user._id,
      rating,
      reviewText,
    });

    // Populate author details for immediate display
    await review.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a movie
// @route   GET /api/movies/:id/reviews
// @access  Public
const getMovieReviews = async (req, res, next) => {
  try {
    const movieId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid movie ID format: ${movieId}`,
      });
    }

    const reviews = await Review.find({ movie: movieId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review (Owner only)
// @route   PATCH /api/reviews/:id
// @access  Private (Requires JWT + authorizeReviewOwner)
const updateReview = async (req, res, next) => {
  try {
    // req.review is attached by authorizeReviewOwner middleware
    const review = req.review;
    const { rating, reviewText } = req.body;

    if (rating !== undefined) {
      review.rating = rating;
    }
    if (reviewText !== undefined) {
      review.reviewText = reviewText.trim();
    }

    await review.save();
    await review.populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review (Owner only)
// @route   DELETE /api/reviews/:id
// @access  Private (Requires JWT + authorizeReviewOwner)
const deleteReview = async (req, res, next) => {
  try {
    // req.review is attached by authorizeReviewOwner middleware
    const review = req.review;

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      deletedReviewId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
};
