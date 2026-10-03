/**
 * Review Schema & Model
 * Case Study 118: Movie Review Platform
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Demonstrates:
 * - Foreign Key / Document References (movie -> Movie, user -> User)
 * - Strict Rating Range Validation (min: 1, max: 5)
 * - Required Review Text Validation
 * - Timestamps for audit tracking
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User author reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      validate: {
        validator: function (v) {
          // Ensure rating is a valid number between 1 and 5
          return typeof v === 'number' && !isNaN(v) && v >= 1 && v <= 5;
        },
        message: 'Rating must be a valid number between 1 and 5',
      },
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [3, 'Review text must be at least 3 characters long'],
      maxlength: [2000, 'Review text cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Optional: ensure a user posts one review per movie (or can update it),
// but we leave compound indexing flexible for academic testing.
reviewSchema.index({ movie: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
