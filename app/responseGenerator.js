const readline = require('readline');
const util = require('util');
const fs = require('fs');
const fetch = require('node-fetch');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const player = require('play-sound')();

// Define conversation states
const State = {
  WAITING_FOR_CALLER_INPUT: 0,
  GENERATING_RESPONSES: 1,
  WAITING_FOR_USER_CHOICE: 2,
  PREPARING_SPEECH_OUTPUT: 3
};

class ResponseGenerator {
  constructor(userProfile) {
    this.userProfile = userProfile;
    this.state = State.WAITING_FOR_CALLER_INPUT;
    this.currentResponses = [];
    this.currentOutput = '';
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.ttsClient = new TextToSpeechClient(); // Initialize Google Text-to-Speech client
  }

  async processCall() {
    console.log("Simulating incoming call...");
    while (true) {
      switch (this.state) {
        case State.WAITING_FOR_CALLER_INPUT:
          await this.processCallerInput();
          break;
        case State.GENERATING_RESPONSES:
          await this.generateResponses();
          break;
        case State.WAITING_FOR_USER_CHOICE:
          await this.getUserChoice();
          break;
        case State.PREPARING_SPEECH_OUTPUT:
          await this.prepareSpeechOutput();
          break;
        default:
          throw new Error(`Unknown state: ${this.state}`);
      }
    }
  }

  // Process the caller's input
  async processCallerInput() {
    const callerInput = await this.prompt("\n[Simulating Speech-to-Text] Enter caller's speech (or 'end call' to finish):");
    if (callerInput.toLowerCase() === 'end call') {
      console.log("Call ended.");
      this.rl.close();
      process.exit(0);
    }
    console.log(`Caller: ${callerInput}`);
    this.state = State.GENERATING_RESPONSES;
  }

  // Generate response options
  async generateResponses() {
    console.log("Generating response options...");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating processing time

    // Example response options
    this.currentResponses = [
      "I'm interested in hearing more about that.",
      "Could you explain further?",
      "I'm not interested, but thanks for calling."
    ];
    this.state = State.WAITING_FOR_USER_CHOICE;
  }

  // Get user's response choice
  async getUserChoice() {
    console.log("Response options:");
    this.currentResponses.forEach((response, index) => {
      console.log(`${index + 1}. ${response}`);
    });
    console.log("4. [Custom response]");

    while (true) {
      const choice = await this.prompt("Enter your choice (1-4): ");
      if (['1', '2', '3'].includes(choice)) {
        this.currentOutput = this.currentResponses[parseInt(choice) - 1];
        break;
      } else if (choice === '4') {
        this.currentOutput = await this.prompt("Enter your custom response: ");
        break;
      } else {
        console.log("Invalid choice. Please try again.");
      }
    }
    this.state = State.PREPARING_SPEECH_OUTPUT;
  }

  // Convert the selected text to speech and play the audio
  async prepareSpeechOutput() {
    console.log(`[Simulating Text-to-Speech] Converting to speech: ${this.currentOutput}`);

    // Prepare the request to Google Text-to-Speech
    const request = {
      input: { text: this.currentOutput },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' }, // Modify languageCode and gender as needed
      audioConfig: { audioEncoding: 'MP3' }
    };

    // Perform the Text-to-Speech request
    const [response] = await this.ttsClient.synthesizeSpeech(request);

    // Save the audio content to a file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');

    console.log('Audio content written to file: output.mp3');

    // Play the MP3 file using play-sound
    player.play('output.mp3', (err) => {
      if (err) {
        console.error('Error playing the audio:', err);
      } else {
        console.log('Audio playback complete!');
      }
    });

    this.state = State.WAITING_FOR_CALLER_INPUT;
  }

  // Helper function to prompt user input
  prompt(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => resolve(answer));
    });
  }
}

module.exports = ResponseGenerator;
