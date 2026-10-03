/**
 * Ownership-Based Authorization Middleware
 * Case Study 118 - Core Academic Requirement
 * Semester 3 Backend Development - ITM Skills University
 * 
 * Logic:
 * 1. Checks that the user is authenticated (req.user exists)
 * 2. Fetches the target review by ID (req.params.id)
 * 3. Compares review.user with req.user._id
 * 4. Rejects with HTTP 403 Forbidden if the requester is not the author
 * 5. Passes control via next() if ownership is verified
 */

const Review = require('../models/Review');

const authorizeReviewOwner = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    // 1. Find review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: `Review not found with id: ${reviewId}`,
      });
    }

    // 2. Ownership verification: compare review.user with req.user._id
    const isOwner = review.user.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are only authorized to edit or delete reviews authored by you',
        reviewOwnerId: review.user,
        requesterId: req.user._id,
      });
    }

    // 3. Attach found review to request so controller doesn't need to re-fetch
    req.review = review;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authorizeReviewOwner };
