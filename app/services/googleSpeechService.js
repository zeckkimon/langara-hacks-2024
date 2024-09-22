const speech = require('@google-cloud/speech');
const fs = require('fs');
const client = new speech.SpeechClient();

const recognizeSpeech = async (audioFile) => {
  const file = fs.readFileSync(audioFile);
  const audioBytes = file.toString('base64');

  const request = {
    audio: {
      content: audioBytes,
    },
    config: {
      encoding: 'LINEAR16', // Ensure your audio file encoding is supported
      sampleRateHertz: 16000, // Adjust based on your input audio file
      languageCode: 'en-US',
    },
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  
  return transcription;
};

module.exports = { recognizeSpeech };
