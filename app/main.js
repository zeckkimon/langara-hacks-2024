const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({status: 'ok'});
});

// Your original /prompt route
app.post('/prompt', async (req, res) => {
  const promptText = req.body.prompt;
  
  if (!promptText) {
    return res.status(400).json({ status: 'error', message: 'Prompt is required' });
  }

  const messages = [
    {role: 'user', content: promptText},
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';

  const postBody = {
    model: 'gpt-3.5-turbo',
    messages: messages,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  try {
    const response = await axios.post(url, postBody, {headers: headers});
    res.json({status: 'ok', response: response.data});
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response ? error.response.data : error.message);
    res.status(500).json({
      status: 'error', 
      message: 'An error occurred while processing your request',
      details: error.response ? error.response.data : error.message
    });
  }
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});