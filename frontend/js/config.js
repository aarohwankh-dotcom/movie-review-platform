/**
 * Frontend Configuration
 * Automatically detects whether running locally, through Express static hosting,
 * or on cloud deployment platforms (Vercel, Render, Railway, Netlify).
 */

const getApiBaseUrl = () => {
  // If hosted together with the Express backend
  if (window.location.port === '5001' || window.location.hostname.includes('onrender.com') || window.location.hostname.includes('railway.app')) {
    return `${window.location.origin}/api`;
  }
  // If opened as a local static file or via live-server (e.g. port 5500, 3000)
  return 'http://localhost:5001/api';
};

const CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
};
