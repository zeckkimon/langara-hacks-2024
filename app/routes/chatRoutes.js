const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const usersFilePath = path.join(__dirname, '../../data/users.json');

const State = {
  WAITING_FOR_CALLER_INPUT: 0,
  GENERATING_RESPONSES: 1,
  WAITING_FOR_USER_CHOICE: 2,
  PREPARING_SPEECH_OUTPUT: 3
};

class ResponseGenerator {
  constructor(userProfile) {
    this.userProfile = userProfile;
    this.conversationHistory = [];
    this.state = State.WAITING_FOR_CALLER_INPUT;
    this.currentResponses = [];
    this.callContext = "";
    this.currentOutput = "";
  }

  async processCallerInput(callerInput) {
    this.callContext += `\nCaller: ${callerInput}`;
    this.state = State.GENERATING_RESPONSES;
    return await this.generateResponses();
  }

  async generateResponses() {
    try {
      this.currentResponses = await generateSuggestions(this.callContext, this.userProfile);
      this.state = State.WAITING_FOR_USER_CHOICE;
      return this.currentResponses;
    } catch (error) {
      console.error('Error generating responses:', error);
      this.currentResponses = [
        "I'm sorry, I'm having trouble generating a response. Could you please repeat that?",
        "I apologize, but I didn't quite catch that. Could you rephrase?",
        "I'm experiencing some technical difficulties. Could we try that again?"
      ];
      return this.currentResponses;
    }
  }

  async processUserChoice(choice) {
    if (choice >= 1 && choice <= 3) {
      this.currentOutput = this.currentResponses[choice - 1];
    } else if (choice === 4) {
      // For custom response, we'll need to handle this differently in the route
      this.currentOutput = "Custom response placeholder";
    } else {
      throw new Error("Invalid choice");
    }
    this.state = State.PREPARING_SPEECH_OUTPUT;
    return this.prepareSpeechOutput();
  }

  async prepareSpeechOutput() {
    this.conversationHistory.push(this.currentOutput);
    this.state = State.WAITING_FOR_CALLER_INPUT;
    return this.currentOutput;
  }
}

// Store active conversations
const activeConversations = new Map();

router.post('/start-call', async (req, res) => {
  try {
    const { userId } = req.body;
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data).users;
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const generator = new ResponseGenerator(user);
    activeConversations.set(userId, generator);

    res.json({ message: "Call started", userId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/process-call', async (req, res) => {
  try {
    const { userId, transcribedText } = req.body;
    const generator = activeConversations.get(userId);
    if (!generator) throw new Error('No active call found for this user');

    const responses = await generator.processCallerInput(transcribedText);
    res.json({ suggestions: responses });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/user-choice', async (req, res) => {
  try {
    const { userId, choice } = req.body;
    const generator = activeConversations.get(userId);
    if (!generator) throw new Error('No active call found for this user');

    const output = await generator.processUserChoice(choice);
    res.json({ output });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/end-call', async (req, res) => {
  try {
    const { userId } = req.body;
    activeConversations.delete(userId);
    res.json({ message: "Call ended" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

async function generateSuggestions(context, user) {
  const apiKey = process.env.OPENAI_API_KEY;
  const url = 'https://api.openai.com/v1/chat/completions';

  const prompt = `Given the following context:
    User Profile: Age ${user.age}, Location: ${user.location}, Language: ${user.language}
    Historical Choices: ${user.historicalChoices.join(', ')}
    Call Context: ${context}

    Generate 3 appropriate responses for the user with a stutter, considering their profile and the call context. Each response should be concise and easy to articulate.`;

  const postBody = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    n: 3
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  try {
    const response = await axios.post(url, postBody, { headers });
    return response.data.choices.map(choice => choice.message.content.trim());
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new Error('Failed to generate suggestions');
  }
}

module.exports = router;