import React from "react";
import Message from "./Message";

const EXAMPLE_QUERIES = [
  "What's the weather today?",
  "Weather forecast for Mumbai",
  "Temperature tomorrow",
];

const ChatWindow = ({ messages, filteredMessages, isTyping, chatWindowRef, sendMessage, searchTerm, setSearchTerm }) => {
  return (
    <div className="chat-window-container">
      <input
        type="text"
        placeholder="Search messages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
        aria-label="Search messages"
      />

      <div className="chat-window" ref={chatWindowRef}>
        {messages.length === 1 && (
          <div className="welcome-section">
            <div className="welcome-icon">🌤️</div>
            <h2>Welcome to Weather Chat!</h2>
            <p>Ask me about the weather anywhere in the world.</p>
            <div className="example-queries">
              {EXAMPLE_QUERIES.map((query, i) => (
                <div key={i} className="example-query" onClick={() => sendMessage(query)}>
                  {query}
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredMessages.map((msg, idx) => (
          <Message key={idx} message={msg} />
        ))}

        {isTyping && (
          <div className="message agent-message typing-wrapper">
            <div className="message typing-message">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
