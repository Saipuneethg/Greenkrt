// Central API base URL config.
// In development, leave this empty so Vite's /api proxy (vite.config.js) handles it.
// In production, set VITE_API_URL=https://your-backend-domain.com in your .env file.
const API_BASE = import.meta.env.VITE_API_URL || ''

export default API_BASE
