/**
 * Movie Details & Review Ownership Manager
 * Implements Case Study 118 Core Operations:
 * - Dynamic Aggregation Refresh
 * - Review Ownership Authorization UI
 * - Review Posting, Editing & Deletion
 */

let currentMovieId = null;
let selectedStarRating = 5;
let editTargetReviewId = null;

// Get URL query parameter
const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Render star string
const getStarsString = (rating) => {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += i <= Math.round(rating) ? '★' : '☆';
  }
  return s;
};

// Update interactive star selector
const setStarRating = (value, containerId = 'star-selector') => {
  selectedStarRating = value;
  const container = document.getElementById(containerId);
  if (!container) return;

  const stars = container.querySelectorAll('.star-item');
  stars.forEach((star) => {
    const starVal = parseInt(star.dataset.value, 10);
    if (starVal <= value) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });

  const ratingValueLabel = document.getElementById('selected-rating-text');
  if (ratingValueLabel) {
    ratingValueLabel.textContent = `${value} / 5 Stars`;
  }
};

// Fetch and display dedicated average rating aggregation endpoint
const refreshAverageRating = async (movieId) => {
  try {
    const res = await API.get(`/movies/${movieId}/average-rating`);
    if (res.success && res.data) {
      const { averageRating, totalReviews } = res.data;
      const scoreEl = document.getElementById('movie-avg-score');
      const countEl = document.getElementById('movie-review-count');
      const starsEl = document.getElementById('movie-avg-stars');

      if (scoreEl) scoreEl.textContent = averageRating > 0 ? averageRating.toFixed(1) : '0.0';
      if (countEl) countEl.textContent = `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;
      if (starsEl) starsEl.textContent = getStarsString(averageRating);
    }
  } catch (err) {
    console.error('Error fetching average rating aggregation:', err);
  }
};

// Render review cards with ownership-aware buttons
const renderReviews = (reviews) => {
  const container = document.getElementById('reviews-list-container');
  if (!container) return;

  const currentUser = API.getCurrentUser();

  if (!reviews || reviews.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-dim); background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
        <p style="font-size: 16px; margin-bottom: 6px;">No reviews yet for this movie.</p>
        <p style="font-size: 13px;">Be the first audience member to share your thoughts!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = reviews.map((rev) => {
    // Check ownership: does this review belong to currently logged in user?
    const isOwner = currentUser && rev.user && (
      (rev.user._id && rev.user._id === currentUser._id) ||
      (rev.user === currentUser._id)
    );

    const reviewerName = rev.user && rev.user.name ? rev.user.name : 'Verified Viewer';
    const initial = reviewerName.charAt(0).toUpperCase();
    const dateFormatted = new Date(rev.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return `
      <div class="review-item" id="review-${rev._id}">
        <div class="review-top">
          <div class="reviewer-meta">
            <div class="reviewer-avatar">${initial}</div>
            <div>
              <div class="reviewer-name">
                ${reviewerName}
                ${isOwner ? '<span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; margin-left: 6px; font-size: 10px;">YOU</span>' : ''}
              </div>
              <div class="review-date">${dateFormatted}</div>
            </div>
          </div>
          <div class="review-rating-stars" title="${rev.rating} out of 5">
            ${getStarsString(rev.rating)}
          </div>
        </div>
        <div class="review-text-content">
          ${rev.reviewText}
        </div>
        ${isOwner ? `
          <div class="review-actions">
            <button class="btn btn-secondary btn-sm" onclick="openEditModal('${rev._id}', ${rev.rating}, '${encodeURIComponent(rev.reviewText)}')">
              ✏️ Edit Review
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteReview('${rev._id}')">
              🗑 Delete Review
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};

// Load full movie details and reviews
const loadMovieDetails = async () => {
  currentMovieId = getQueryParam('id');
  if (!currentMovieId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const res = await API.get(`/movies/${currentMovieId}`);
    if (res.success && res.data) {
      const movie = res.data;

      // Populate Movie metadata
      document.title = `${movie.title} - Movie Review Platform`;
      const titleEl = document.getElementById('movie-title');
      const posterEl = document.getElementById('movie-poster');
      const genreEl = document.getElementById('movie-genre');
      const yearEl = document.getElementById('movie-year');
      const descEl = document.getElementById('movie-description');

      if (titleEl) titleEl.textContent = movie.title;
      if (posterEl) posterEl.src = movie.posterUrl;
      if (genreEl) genreEl.textContent = movie.genre;
      if (yearEl) yearEl.textContent = movie.releaseYear;
      if (descEl) descEl.textContent = movie.description;

      // Update Aggregation Ratings
      await refreshAverageRating(movie._id);

      // Render Reviews List
      renderReviews(movie.reviews);
    }
  } catch (err) {
    Auth.showToast(`Error loading movie: ${err.message}`, 'error');
  }
};

// Submit New Review Form
const setupReviewForm = () => {
  const form = document.getElementById('new-review-form');
  const loginPrompt = document.getElementById('review-login-prompt');
  const currentUser = API.getCurrentUser();

  if (!currentUser) {
    if (form) form.style.display = 'none';
    if (loginPrompt) loginPrompt.style.display = 'block';
    return;
  }

  if (form) form.style.display = 'block';
  if (loginPrompt) loginPrompt.style.display = 'none';

  // Star selector clicks
  const starSelector = document.getElementById('star-selector');
  if (starSelector) {
    starSelector.querySelectorAll('.star-item').forEach((star) => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.value, 10);
        setStarRating(val);
      });
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textInput = document.getElementById('review-text-input');
      const reviewText = textInput.value.trim();

      if (!reviewText) {
        Auth.showToast('Please enter your review text', 'error');
        return;
      }

      try {
        const res = await API.post(`/movies/${currentMovieId}/reviews`, {
          rating: selectedStarRating,
          reviewText,
        });

        if (res.success) {
          Auth.showToast('Review posted successfully!', 'success');
          textInput.value = '';
          setStarRating(5);
          // Reload details and dynamically recalculated average rating
          await loadMovieDetails();
        }
      } catch (err) {
        Auth.showToast(err.message || 'Failed to submit review', 'error');
      }
    });
  }
};

// Delete Review (Owner-only operation)
window.deleteReview = async (reviewId) => {
  if (!confirm('Are you sure you want to permanently delete this review?')) {
    return;
  }

  try {
    const res = await API.delete(`/reviews/${reviewId}`);
    if (res.success) {
      Auth.showToast('Review deleted successfully', 'success');
      await loadMovieDetails();
    }
  } catch (err) {
    Auth.showToast(err.message || 'Unauthorized: Cannot delete this review', 'error');
  }
};

// Open Edit Modal
window.openEditModal = (reviewId, currentRating, encodedText) => {
  editTargetReviewId = reviewId;
  const decodedText = decodeURIComponent(encodedText);

  const modal = document.getElementById('edit-modal');
  const textInput = document.getElementById('edit-review-text');
  const ratingSelect = document.getElementById('edit-rating-select');

  if (textInput) textInput.value = decodedText;
  if (ratingSelect) ratingSelect.value = currentRating;
  if (modal) modal.classList.add('show');
};

// Close Edit Modal
window.closeEditModal = () => {
  const modal = document.getElementById('edit-modal');
  if (modal) modal.classList.remove('show');
  editTargetReviewId = null;
};

// Save Edited Review
window.saveEditedReview = async () => {
  if (!editTargetReviewId) return;

  const textInput = document.getElementById('edit-review-text');
  const ratingSelect = document.getElementById('edit-rating-select');

  const rating = Number(ratingSelect.value);
  const reviewText = textInput.value.trim();

  if (!reviewText) {
    Auth.showToast('Review text cannot be empty', 'error');
    return;
  }

  try {
    const res = await API.patch(`/reviews/${editTargetReviewId}`, {
      rating,
      reviewText,
    });

    if (res.success) {
      Auth.showToast('Review updated successfully!', 'success');
      closeEditModal();
      await loadMovieDetails();
    }
  } catch (err) {
    Auth.showToast(err.message || 'Unauthorized: Only the author can edit this review', 'error');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  loadMovieDetails();
  setupReviewForm();
  setStarRating(5);
});
