const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createReview,
  getMovieReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeReviewOwner } = require('../middleware/ownershipMiddleware');
const { validateReviewInput } = require('../middleware/validationMiddleware');

// Routes mounted at /api/movies/:id/reviews
router.route('/')
  .post(protect, validateReviewInput, createReview)
  .get(getMovieReviews);

// Direct review operations mounted at /api/reviews/:id
router.route('/:id')
  .patch(protect, authorizeReviewOwner, validateReviewInput, updateReview)
  .delete(protect, authorizeReviewOwner, deleteReview);

module.exports = router;
