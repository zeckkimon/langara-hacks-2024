require('dotenv').config(); // Load environment variables from .env
const path = require('path');
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
const express = require('express');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes'); // Import chat routes
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});



// Use chat routes for all /api/chat endpoints
app.use('/api/chat', chatRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Welcome to OpenAI Node.js Integration' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Not Found' });
});