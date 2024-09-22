import { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import { Mic } from "@mui/icons-material";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import AssistantIcon from "@mui/icons-material/Assistant";
import ButtonGroup from "@mui/material/ButtonGroup";
import axios from "axios";
// import { use } from "../../app/routes/chatRoutes";

const styles = {
  messagesContainer: {
    flexGrow: 1,
    overflowY: "auto",
    padding: 2,
    paddingTop: "75px",
    paddingBottom: "150px",
  },
  inputContainer: {
    borderTop: 1,
    borderColor: "divider",
    padding: 2,
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "white",
    margin: "0 auto",
    maxWidth: "900px",
    width: "95%",
  },
};

const Chat = () => {
  const [input, setInput] = useState("");

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const [keywords, setKeywords] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [messages, setMessages] = useState([
    {
      sender: "Caller",
      content: "Hey there! How are you doing?",
    },
    {
      sender: "Agent",
      content:
        "Hi Caller! I'm doing great, thanks for asking. How about you? Hi Caller! I'm doing great, thanks for asking. How about you? Hi Caller! I'm doing great, thanks for asking. How about you?",
    },
  ]);

  // const messages = [
  //   {
  //     sender: "Caller",
  //     content: "Hey there! How are you doing?",
  //     time: "10:00 AM",
  //   },
  //   {
  //     sender: "Agent",
  //     content: "Hi Caller! I'm doing great, thanks for asking. How about you?",
  //     time: "10:05 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content:
  //       "I'm good too! Just wanted to check in. Any plans for the weekend?",
  //     time: "10:15 AM",
  //   },
  //   {
  //     sender: "Agent",
  //     content: "Not yet, but I'm thinking about going hiking. Want to join?",
  //     time: "10:20 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content:
  //       "That sounds fantastic! I'd love to join. Where are you planning to go?",
  //     time: "10:25 AM",
  //   },
  //   {
  //     sender: "Agent",
  //     content:
  //       "I was thinking about the trail in the nearby national park. It's beautiful this time of year. I was thinking about the trail in the nearby national park. It's beautiful this time of year.",
  //     time: "10:28 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content: "Perfect! Let's do it. See you tomorrow!",
  //     time: "10:30 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content: "Hey there! How are you doing?",
  //     time: "10:00 AM",
  //   },
  //   {
  //     sender: "Agent",
  //     content: "Hi Caller! I'm doing great, thanks for asking. How about you?",
  //     time: "10:05 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content:
  //       "I'm good too! Just wanted to check in. Any plans for the weekend?",
  //     time: "10:15 AM",
  //   },
  //   {
  //     sender: "Agent",
  //     content: "Not yet, but I'm thinking about going hiking. Want to join?",
  //     time: "10:20 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content:
  //       "That sounds fantastic! I'd love to join. Where are you planning to go?",
  //     time: "10:25 AM",
  //   },
  //   {
  //     sender: "Agent",
  //     content:
  //       "I was thinking about the trail in the nearby national park. It's beautiful this time of year. I was thinking about the trail in the nearby national park. It's beautiful this time of year.",
  //     time: "10:28 AM",
  //   },
  //   {
  //     sender: "Caller",
  //     content: "Perfect! Let's do it. See you tomorrow!",
  //     time: "10:30 AM",
  //   },
  // ];

  const startRecording = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      recognitionRef.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      let finalTranscript = "";

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results);
        const currentTranscript = results
          .map((result) => (result.isFinal ? result[0].transcript : ""))
          .join("");

        if (currentTranscript) {
          finalTranscript += currentTranscript; // Accumulate the final transcript
          setTranscript(finalTranscript); // Update state for debugging purposes
        }
        // setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setRecording(false);
        if (finalTranscript) {
          // Use the accumulated transcript directly
          const newMessage = {
            sender: "Caller",
            content: finalTranscript, // Add the final transcript here
          };

          // Update the messages state with the new message
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      };

      recognitionRef.current.start();
      setRecording(true);
    } else {
      console.error("Speech Recognition not supported in this browser.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const getSuggestions = async () => {
    console.log(transcript, keywords);
    const res = await axios.post(
      "http://localhost:3000/api/chat/process-input",
      {
        userId: "1",
        callerInput: transcript,
        keywordInput: keywords,
      }
    );

    console.log(res.data);
    setSuggestions(res.data.suggestions);

    setTranscript("");
    setInput("");
    setKeywords("");
  };

  const chooseSuggestion = async (suggestion) => {
    console.log(suggestion.replace(/"/g, ""));
    const formattedSuggestion = suggestion.replace(/"/g, "");

    // Backend: store the chosen one in json file and generate audio response for the chosen suggestion
    const res = await axios.post(
      "http://localhost:3000/api/chat/choose-suggestion",
      {
        userId: "1",
        chosenSuggestion: formattedSuggestion,
      },
      {
        responseType: "arraybuffer", // Important to handle binary data
      }
    );

    // Create a Blob from the response data (audio data)
    const audioBlob = new Blob([res.data], { type: "audio/mpeg" });

    // Generate a URL for the Blob
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create a new Audio object
    const audio = new Audio(audioUrl);

    // Play the audio
    audio.play();

    // Frontend: add the chosen suggestion to the messages
    const newReponse = {
      sender: "Agent",
      content: formattedSuggestion,
    };
    setMessages((prevMessages) => [...prevMessages, newReponse]);

    // Frontend: dismiss the suggestions
    setSuggestions([]);
  };

  return (
    <>
      <Box sx={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent:
                msg.sender === "Agent" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Paper sx={{ maxWidth: "90%" }}>
              <Typography
                variant="body1"
                sx={{
                  backgroundColor:
                    msg.sender === "Agent" ? "#f0f0f0" : "#e1f5fe",
                  p: 1,
                  textAlign: "left",
                }}
              >
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}

        {suggestions.length > 0 ? (
          <ButtonGroup
            orientation="vertical"
            aria-label="Vertical button group"
            sx={{
              padding: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography sx={{ textAlign: "left", marginBottom: "0.5rem" }}>
              Choose the one that best fits as your response:
            </Typography>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => chooseSuggestion(suggestion)}
                sx={{ textTransform: "none" }}
              >
                {suggestion}
              </Button>
            ))}
          </ButtonGroup>
        ) : null}
      </Box>

      <Box sx={styles.inputContainer}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {/* <form> */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type keywords..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setKeywords(e.target.value);
            }}
            sx={{ mr: 1 }}
          />

          <Button
            variant="contained"
            endIcon={<AssistantIcon />}
            onClick={getSuggestions}
            disabled={recording || !input}
          >
            get suggestions
          </Button>
          {/* </form> */}
        </Box>
        <IconButton
          color="primary"
          sx={{
            mr: 1,
            mt: 1,
            width: "100%",
            borderRadius: "4px",
            border: 1,
            bgcolor: recording ? "#FFCED5" : "white",
            "&:hover": {
              outline: "solid",
              bgcolor: recording ? "#FFCED5" : "white",
            },
          }}
          onClick={recording ? stopRecording : startRecording}
        >
          {recording ? <GraphicEqIcon /> : <Mic />}
        </IconButton>
        {console.log(transcript)}
      </Box>
    </>
  );
};

export default Chat;
