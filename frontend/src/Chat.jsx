import { useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
} from "@mui/material";
import { Send, Mic } from "@mui/icons-material";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: "auto",
    padding: 2,
  },
  inputContainer: {
    borderTop: 1,
    borderColor: "divider",
    padding: 2,
  },
};

const Chat = () => {
  const [message, setMessage] = useState("");

  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

  const messages = [
    {
      sender: "Alice",
      content: "Hey there! How are you doing?",
      time: "10:00 AM",
    },
    {
      sender: "You",
      content: "Hi Alice! I'm doing great, thanks for asking. How about you?",
      time: "10:05 AM",
    },
    {
      sender: "Alice",
      content:
        "I'm good too! Just wanted to check in. Any plans for the weekend?",
      time: "10:15 AM",
    },
    {
      sender: "You",
      content: "Not yet, but I'm thinking about going hiking. Want to join?",
      time: "10:20 AM",
    },
    {
      sender: "Alice",
      content:
        "That sounds fantastic! I'd love to join. Where are you planning to go?",
      time: "10:25 AM",
    },
    {
      sender: "You",
      content:
        "I was thinking about the trail in the nearby national park. It's beautiful this time of year. I was thinking about the trail in the nearby national park. It's beautiful this time of year.",
      time: "10:28 AM",
    },
    {
      sender: "Alice",
      content: "Perfect! Let's do it. See you tomorrow!",
      time: "10:30 AM",
    },
  ];

  const startRecording = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      recognitionRef.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results);
        const currentTranscript = results
          .map((result) => (result.isFinal ? result[0].transcript : ""))
          .join("");
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setRecording(false);
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

  return (
    <Box sx={styles.container}>
      <Box sx={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: msg.sender === "You" ? "flex-end" : "flex-start",
              mb: 2,
            }}
          >
            <Paper>
              <Typography
                variant="body1"
                sx={{
                  backgroundColor: msg.sender === "You" ? "#f0f0f0" : "#e1f5fe",
                  p: 1,
                }}
              >
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Box>
      <Box sx={styles.inputContainer}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            sx={{ mr: 1 }}
            onClick={recording ? stopRecording : startRecording}
          >
            {recording ? <GraphicEqIcon /> : <Mic />}
          </IconButton>
          {console.log(transcript)}
          <Button variant="contained" endIcon={<Send />}>
            get suggestion
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;
