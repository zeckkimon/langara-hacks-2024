import { useState, useRef } from "react";

// const apiKey = import.meta.env.VITE_SPEECH_KEY;

// function SpeechToTextGoogle() {
//   const [transcript, setTranscript] = useState("");
//   const [recording, setRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(audioChunksRef.current, {
//           type: "audio/wav",
//         });
//         console.log(audioBlob);
//         const audioBase64 = await blobToBase64(audioBlob);
//         console.log(audioBase64);

//         // Send the audio file to Google Speech-to-Text API
//         const response = await transcribeAudio(audioBase64);
//         setTranscript(response);
//       };

//       mediaRecorderRef.current.start();
//       setRecording(true);
//     } catch (error) {
//       console.error("Error accessing microphone:", error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//     }
//     setRecording(false);
//   };

//   const blobToBase64 = (blob) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result.split(",")[1]); // Get base64 without the header
//       reader.onerror = reject;
//       reader.readAsDataURL(blob);
//     });
//   };

//   const transcribeAudio = async (audioBase64) => {
//     const body = {
//       config: {
//         encoding: "LINEAR16",
//         // sampleRateHertz: 16000,
//         languageCode: "en-US",
//       },
//       audio: {
//         content: audioBase64,
//       },
//     };

//     const response = await fetch(
//       `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       }
//     );

//     const data = await response.json();
//     const transcript =
//       data.results
//         ?.map((result) => result.alternatives[0].transcript)
//         .join("\n") || "";
//     return transcript;
//   };

//   return (
//     <div>
//       <h1>Google Speech to Text</h1>
//       <button onClick={recording ? stopRecording : startRecording}>
//         {recording ? "Stop Recording" : "Start Recording"}
//       </button>
//       <p>Transcript: {transcript}</p>
//     </div>
//   );
// }

function SpeechToTextBrowser() {
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef(null);

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
    <div>
      <h1>Browser Speech to Text</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
      <p>Transcript: {transcript}</p>
    </div>
  );
}

export default SpeechToTextBrowser;
