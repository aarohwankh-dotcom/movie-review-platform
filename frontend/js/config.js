/**
 * Frontend Configuration
 * Automatically detects whether running locally, through Express static hosting,
 * or on cloud deployment platforms (Vercel, Render, Railway, Netlify).
 */

const getApiBaseUrl = () => {
  // If hosted directly on Render or Railway with the backend
  if (window.location.hostname.includes('onrender.com') || window.location.hostname.includes('railway.app')) {
    return `${window.location.origin}/api`;
  }
  // If hosted on Vercel or Netlify, connect to the live Render backend API
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app')) {
    return 'https://cinereview-api.onrender.com/api';
  }
  // Local development default
  return 'http://localhost:5001/api';
};

const CONFIG = {
  API_BASE_URL: getApiBaseUrl(),
};
