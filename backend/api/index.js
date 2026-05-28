/**
 * Vercel Serverless Function Handler
 * Entry point for all API requests
 */

// Import the Express app (with all middleware and routes configured)
const app = require('../server');

// Export for Vercel serverless
module.exports = app;
