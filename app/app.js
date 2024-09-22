require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const fs = require('fs');
const util = require('util');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const ResponseGenerator = require('./responseGenerator'); // Import the response generator class

const app = express();
app.use(express.json()); // Middleware to parse incoming requests with JSON payloads

// Initialize Google Cloud Text-to-Speech client
const textToSpeechClient = new TextToSpeechClient();

// Endpoint to handle text-to-speech requests
app.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Text-to-Speech request
    const request = {
      input: { text: text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' }, // You can change the language or gender here
      audioConfig: { audioEncoding: 'MP3' }
    };

    // Perform Text-to-Speech request
    const [response] = await textToSpeechClient.synthesizeSpeech(request);

    // Save the audio content to an MP3 file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');

    console.log('Audio content written to file: output.mp3');

    // Send the generated MP3 as response
    res.set('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);

  } catch (error) {
    console.error('Error during Text-to-Speech:', error);
    res.status(500).json({ error: 'Failed to convert text to speech' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start simulating calls with ResponseGenerator class
const generator = new ResponseGenerator({ name: 'John', age: 30 });
generator.processCall();
