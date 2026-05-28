/**
 * Vercel Serverless Function
 * This wraps the Express app for Vercel deployment
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import the server app from the parent server.js file
// Since Vercel will use this as the entry point, we need to initialize the app here
const app = require('../server');

// Export the Express app for Vercel
module.exports = app;
