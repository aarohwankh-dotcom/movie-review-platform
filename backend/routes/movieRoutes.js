const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  getMovieAverageRating,
  createMovie,
  updateMovie,
  deleteMovie,
  getDashboardStats,
} = require('../controllers/movieController');
const { protect } = require('../middleware/authMiddleware');
const { validateMovieInput } = require('../middleware/validationMiddleware');

// Re-route into review router for nested endpoint /api/movies/:id/reviews
const reviewRouter = require('./reviewRoutes');
router.use('/:id/reviews', reviewRouter);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Case study requirement: GET /movies/:id/average-rating
router.get('/:id/average-rating', getMovieAverageRating);

// Movie CRUD
router.route('/')
  .get(getAllMovies)
  .post(protect, validateMovieInput, createMovie);

router.route('/:id')
  .get(getMovieById)
  .patch(protect, updateMovie)
  .delete(protect, deleteMovie);

module.exports = router;
