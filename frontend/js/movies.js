/**
 * Movie Catalog & Dashboard Operations - Apple Design System
 */

let allMovies = [];
let currentGenreFilter = 'ALL';

// Helper to render star rating representation
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    starsHtml += i <= fullStars ? '★' : '☆';
  }
  return starsHtml;
};

// Fetch and render dashboard metrics
const loadDashboardStats = async () => {
  try {
    const res = await API.get('/movies/dashboard/stats');
    if (res.success && res.data) {
      const { totalMovies, totalReviews, platformAverageRating } = res.data;
      const elMovies = document.getElementById('stat-total-movies');
      const elReviews = document.getElementById('stat-total-reviews');
      const elAvg = document.getElementById('stat-platform-avg');

      if (elMovies) elMovies.textContent = totalMovies;
      if (elReviews) elReviews.textContent = totalReviews;
      if (elAvg) elAvg.textContent = platformAverageRating > 0 ? platformAverageRating.toFixed(1) : '—';
    }
  } catch (err) {
    console.warn('Could not load dashboard statistics:', err);
  }
};

// Render Movie Cards to Grid (Apple TV+ Style)
const renderMovieGrid = (movies) => {
  const grid = document.getElementById('movie-grid');
  if (!grid) return;

  if (movies.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-tertiary);">
        <p style="font-size: 19px; font-weight: 600; color: #fff; margin-bottom: 6px;">No films found.</p>
        <p style="font-size: 14px;">Try searching for another title or clear your genre filter.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = movies.map((movie) => {
    const avgRating = movie.averageRating > 0 ? `${movie.averageRating.toFixed(1)}` : 'Unrated';
    const totalReviews = movie.totalReviews || 0;

    return `
      <div class="movie-card" data-genre="${movie.genre}">
        <div class="poster-wrapper">
          <img 
            src="${movie.posterUrl}" 
            alt="${movie.title}" 
            class="poster-img" 
            loading="lazy"
            onerror="this.src='https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg'"
          >
          <div class="rating-badge">
            <span>★</span>
            <span>${avgRating}</span>
          </div>
          <div class="genre-tag">${movie.genre}</div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
          <div class="movie-meta">
            <span>${movie.releaseYear}</span>
            <span>${totalReviews} ${totalReviews === 1 ? 'critique' : 'critiques'}</span>
          </div>
          <p class="movie-desc">${movie.description}</p>
          <a href="movie-details.html?id=${movie._id}" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: auto;">
            Details &amp; Reviews →
          </a>
        </div>
      </div>
    `;
  }).join('');
};

// Filter movies by genre
const filterMovies = (genre) => {
  currentGenreFilter = genre;

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    if (pill.dataset.genre.toLowerCase() === genre.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  if (genre === 'ALL') {
    renderMovieGrid(allMovies);
  } else {
    const filtered = allMovies.filter((m) => m.genre.toLowerCase() === genre.toLowerCase());
    renderMovieGrid(filtered);
  }
};

// Fetch movies list from REST API
const loadMovies = async () => {
  const grid = document.getElementById('movie-grid');
  if (grid) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; color: var(--text-tertiary);">
        <p style="font-size: 15px;">Loading catalog...</p>
      </div>
    `;
  }

  try {
    const res = await API.get('/movies');
    if (res.success && res.data) {
      allMovies = res.data;
      renderMovieGrid(allMovies);
    }
  } catch (err) {
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--apple-red);">
          <p style="font-weight: 600;">Unable to connect to CineReview API</p>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">Ensure server is running on port 5001.</p>
        </div>
      `;
    }
  }
};

// Setup real-time search
const setupSearch = () => {
  const searchInput = document.getElementById('movie-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = allMovies.filter((m) => {
      const matchGenre = currentGenreFilter === 'ALL' || m.genre.toLowerCase() === currentGenreFilter.toLowerCase();
      const matchTitle = m.title.toLowerCase().includes(query) || m.description.toLowerCase().includes(query);
      return matchGenre && matchTitle;
    });
    renderMovieGrid(filtered);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  loadDashboardStats();
  loadMovies();
  setupSearch();

  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      filterMovies(pill.dataset.genre);
    });
  });
});
