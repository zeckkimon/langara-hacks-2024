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
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.googleApiService = new this.googleApiService()
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

  async processCallerInput() {
    const callerInput = await this.prompt("\n[Simulating Speech-to-Text] Enter caller's speech (or 'end call' to finish):");
    if (callerInput.toLowerCase() === 'end call') {
      console.log("Call ended.");
      this.rl.close();
      process.exit(0);
    }
    console.log(`Caller: ${callerInput}`);
    this.callContext += `\nCaller: ${callerInput}`;
    this.state = State.GENERATING_RESPONSES;
  }

  async generateResponses() {
    console.log("Generating response options...");
    try {
      this.currentResponses = await this.googleApiService.generateResponses(this.callContext);
    } catch (error) {
      console.error('Error generating responses:', error);
      this.currentResponses = [
        "I'm sorry, I'm having trouble generating a response. Could you please repeat that?",
        "I apologize, but I didn't quite catch that. Could you rephrase?",
        "I'm experiencing some technical difficulties. Could we try that again?"
      ];
    }
    this.state = State.WAITING_FOR_USER_CHOICE;
  }

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

  async prepareSpeechOutput() {
    console.log(`[Simulating Text-to-Speech] Converting to speech: ${this.currentOutput}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating text-to-speech processing time
    this.conversationHistory.push(this.currentOutput);
    console.log(`User (via speech synthesis): ${this.currentOutput}`);
    this.state = State.WAITING_FOR_CALLER_INPUT;
  }

  prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

async function main() {
  const userProfile = { name: "John", age: 30 };
  const generator = new ResponseGenerator(userProfile);
  await generator.processCall();
}

main().catch(console.error);
