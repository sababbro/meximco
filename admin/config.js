// ================================================
// MEXIMCO ADMIN — API CONFIGURATION
// ================================================
// Change this URL after deploying the backend to Render/Railway
// For local development: 'http://localhost:3001'
// For production: 'https://your-app-name.onrender.com'

const CONFIG = {
    API_URL: window.location.hostname === 'localhost' 
        ? window.location.origin 
        : 'https://meximco-admin.onrender.com'  // ← UPDATE THIS after Render deployment
};
