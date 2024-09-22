import { useState } from "react";

import "./App.css";
import Chat from "./Chat";
import Header from "./Header";
import UserProfile from "./UserProfile";
// import SpeechToTextComponent from "./SpeechToText";

const getCurrentPath = () => window.location.pathname;

function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath());

  window.onpopstate = () => {
    setCurrentPath(getCurrentPath());
  };

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  return (
    <>
      <Header navigate={navigate} getCurrentPath={getCurrentPath} />
      {/* <SpeechToTextComponent /> */}

      {(currentPath === "/" || currentPath === "/chat") && <Chat />}
      {currentPath === "/profile" && <UserProfile />}
    </>
  );
}

export default App;
