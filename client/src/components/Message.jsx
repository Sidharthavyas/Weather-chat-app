import React from "react";

const Message = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`message-wrapper ${isUser ? "user" : "agent"}`}>
      <div className={`message ${isUser ? "user" : "agent"}`}>
        <div className="message-content">{message.content}</div>
        <div className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default Message;
