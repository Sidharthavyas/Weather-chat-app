import React from "react";

const Header = ({ darkMode, setDarkMode, connectionError, exportChat, clearChat }) => {
  return (
    <header className="chat-header">
      <div className="header-left">
        <div className="header-icon" aria-label="Weather Chat Icon">☁️</div>
        <div className="header-text">
          <h1>Weather Chat</h1>
          <p className={connectionError ? "status-offline" : "status-online"}>
            {connectionError ? "Disconnected" : "Online"}
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark/Light Mode"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        <button
          className="export-btn"
          onClick={exportChat}
          aria-label="Export Chat History"
        >
          📤 Export
        </button>

        <button
          className="clear-btn"
          onClick={clearChat}
          aria-label="Clear Chat History"
        >
          🗑 Clear
        </button>
      </div>
    </header>
  );
};

export default Header;
