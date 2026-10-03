/**
 * Request Validation Middleware
 * Case Study 118 - Validation Requirements
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Validates request payloads before reaching database operations.
 */

// Validate Review Input (Rating 1-5, Required review text)
const validateReviewInput = (req, res, next) => {
  const { rating, reviewText } = req.body;

  // Check rating presence
  if (rating === undefined || rating === null || rating === '') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Rating is required',
      field: 'rating',
    });
  }

  const numericRating = Number(rating);

  // Check valid number
  if (isNaN(numericRating)) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Rating must be a valid number',
      field: 'rating',
      received: rating,
    });
  }

  // Check range 1 to 5 (inclusive)
  if (numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Rating value must be between 1 and 5 (inclusive)',
      field: 'rating',
      received: numericRating,
      allowedRange: '1 - 5',
    });
  }

  // Check reviewText presence and length
  if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Review text is required and cannot be empty',
      field: 'reviewText',
    });
  }

  if (reviewText.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Review text must be at least 3 characters long',
      field: 'reviewText',
    });
  }

  // Coerce parsed numeric rating onto body
  req.body.rating = numericRating;
  req.body.reviewText = reviewText.trim();
  next();
};

// Validate Movie Input
const validateMovieInput = (req, res, next) => {
  const { title, description, genre, releaseYear } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Movie title is required',
      field: 'title',
    });
  }

  if (!description || description.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Movie description is required',
      field: 'description',
    });
  }

  if (!genre || genre.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Movie genre is required',
      field: 'genre',
    });
  }

  const year = Number(releaseYear);
  if (!releaseYear || isNaN(year) || year < 1888 || year > 2100) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Release year must be a valid year between 1888 and 2100',
      field: 'releaseYear',
    });
  }

  next();
};

// Validate Auth Registration Input
const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Name is required and must be at least 2 characters',
      field: 'name',
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: A valid email address is required',
      field: 'email',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error: Password must be at least 6 characters long',
      field: 'password',
    });
  }

  next();
};

module.exports = {
  validateReviewInput,
  validateMovieInput,
  validateRegisterInput,
};
