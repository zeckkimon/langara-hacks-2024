const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Store active conversations
const activeConversations = new Map();

/**
 * Start a new call
 * Expected input:
 * {
 *   userId: string,
 *   userProfile: {
 *     age: number,
 *     location: string,
 *     language: string
 *   }
 * }
 */
router.post('/start-call', (req, res) => {
  const { userId, userProfile } = req.body;
  if (!userId || !userProfile) {
    return res.status(400).json({ error: 'Missing userId or userProfile' });
  }
  activeConversations.set(userId, { userProfile, context: '' });
  res.json({ message: "Call started", userId });
});

/**
 * Process caller input and generate suggestions
 * Expected input:
 * {
 *   userId: string,
 *   callerInput: string
 * }
 */
router.post('/process-input', async (req, res) => {
  const { userId, callerInput } = req.body;
  if (!userId || !callerInput) {
    return res.status(400).json({ error: 'Missing userId or callerInput' });
  }

  const conversation = activeConversations.get(userId);
  if (!conversation) {
    return res.status(404).json({ error: 'No active call found for this user' });
  }

  conversation.context += `\nCaller: ${callerInput}`;
  
  try {
    const suggestions = await generateSuggestions(conversation.context, conversation.userProfile);
    res.json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

/**
 * Record user's chosen response
 * Expected input:
 * {
 *   userId: string,
 *   chosenResponse: string
 * }
 */
router.post('/user-choice', (req, res) => {
  const { userId, chosenResponse } = req.body;
  if (!userId || !chosenResponse) {
    return res.status(400).json({ error: 'Missing userId or chosenResponse' });
  }

  const conversation = activeConversations.get(userId);
  if (!conversation) {
    return res.status(404).json({ error: 'No active call found for this user' });
  }

  conversation.context += `\nUser: ${chosenResponse}`;
  conversation.userProfile.historicalChoices = conversation.userProfile.historicalChoices || [];
  conversation.userProfile.historicalChoices.push(chosenResponse);

  res.json({ message: 'Response recorded' });
});

/**
 * End the call
 * Expected input:
 * {
 *   userId: string
 * }
 */
router.post('/end-call', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  activeConversations.delete(userId);
  res.json({ message: "Call ended" });
});

async function generateSuggestions(context, user) {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';

  const prompt = `Given the following context:
    User Profile: Age ${user.age}, Location: ${user.location}, Language: ${user.language}
    Historical Choices: ${user.historicalChoices ? user.historicalChoices.join(', ') : 'None'}
    Call Context: ${context}

    Generate 3 appropriate responses for the user, considering their profile and the call context. Each response should be concise and easy to articulate.`;

  const postBody = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    n: 1,
    temperature: 0.7
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  try {
    const response = await axios.post(url, postBody, { headers });
    const content = response.data.choices[0].message.content;
    return content.split('\n').filter(line => line.trim() !== '').map(line => line.replace(/^\d+\.\s*/, '').trim());
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate suggestions from OpenAI');
  }
}

module.exports = router;