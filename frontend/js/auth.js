/**
 * Authentication & UI Session Manager - Apple Design System
 */

const Auth = {
  // Update navigation bar across all pages
  updateNavbar() {
    const navAuthContainer = document.getElementById('nav-auth-container');
    if (!navAuthContainer) return;

    const user = API.getCurrentUser();

    if (user) {
      navAuthContainer.innerHTML = `
        <div class="user-pill">
          <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <span class="user-name">${user.name}</span>
        </div>
        <a href="add-movie.html" class="btn btn-secondary btn-sm">+ Add Film</a>
        <button id="logout-btn" class="btn btn-outline btn-sm">Sign Out</button>
      `;

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          API.clearAuth();
          Auth.showToast('Signed out', 'info');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 600);
        });
      }
    } else {
      navAuthContainer.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Sign In</a>
        <a href="register.html" class="btn btn-primary btn-sm">Create Account</a>
      `;
    }
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavbar();
});
