import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import InputSection from "./components/InputSection";
import { useChat } from "./hooks/useChat";

const COLLEGE_ROLL_NUMBER = "22-E&CS61-26";
const API_BASE =""

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [input, setInput] = useState("");

  const {
    messages,
    filteredMessages,
    isTyping,
    connectionError,
    chatWindowRef,
    sendMessage,
    searchTerm,
    setSearchTerm,
    exportChat,
    clearChat
  } = useChat(API_BASE, COLLEGE_ROLL_NUMBER);

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="bubbles-container">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="chat-container">
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          connectionError={connectionError}
          exportChat={exportChat}
           clearChat={clearChat}
        />
        <ChatWindow
          messages={messages}
          filteredMessages={filteredMessages}
          isTyping={isTyping}
          chatWindowRef={chatWindowRef}
          sendMessage={sendMessage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <InputSection input={input} setInput={setInput} sendMessage={sendMessage} isTyping={isTyping} />
      </div>
    </div>
  );
}

export default App;
