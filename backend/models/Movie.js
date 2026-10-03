/**
 * Movie Schema & Model
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Demonstrates:
 * - Complex Schema validation (enums, min/max numbers, required fields)
 * - Mongoose ObjectId references (createdBy -> User)
 * - Timestamps (createdAt, updatedAt)
 */

const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    genre: {
      type: String,
      required: [true, 'Movie genre is required'],
      trim: true,
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      min: [1888, 'Release year must be 1888 or later'],
      max: [2100, 'Release year must be a realistic year'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Movie poster image URL is required'],
      trim: true,
      default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
