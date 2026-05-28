/**
 * Vercel API Route Handler
 * Catches all API requests and forwards to Express backend
 */

const app = require('../backend/server');

// Export as a serverless function handler
module.exports = app;
