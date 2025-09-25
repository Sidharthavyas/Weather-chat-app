import { useState, useRef, useEffect } from "react";

export const useChat = (apiBase) => {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Weather Chat Agent 🌙", timestamp: Date.now() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const chatWindowRef = useRef(null);

  // ✅ Clear chat
  const clearChat = () => {
    setMessages([{ role: "agent", content: "Weather Chat Agent 🌙", timestamp: Date.now() }]);
  };

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ✅ Send message with streaming support
  const sendMessage = async (content) => {
    if (!content.trim() || isTyping) return;

    const userMessage = { role: "user", content, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // POST to backend
      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: "❌ Failed to fetch weather data.",
            timestamp: Date.now(),
          },
        ]);
        setConnectionError(true);
        return;
      }

      // Prepare assistant message container
      let fullMessage = "";
      const agentMessage = { role: "agent", content: "", timestamp: Date.now() };
      setMessages((prev) => [...prev, agentMessage]);

      // ✅ Stream response in real time
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullMessage += decoder.decode(value, { stream: true });

        // Update the last message incrementally
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...agentMessage, content: fullMessage };
          return updated;
        });
      }

      setConnectionError(false);
    } catch (err) {
      console.error("Network/server error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "⚠️ Something went wrong. Please try again later.",
          timestamp: Date.now(),
        },
      ]);
      setConnectionError(true);
    } finally {
      setIsTyping(false);
    }
  };

  // ✅ Filtering messages by search term
  const filteredMessages = messages.filter((msg) =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Export chat as JSON
  const exportChat = () => {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weather_chat.json";
    a.click();
  };

  return {
    messages,
    filteredMessages,
    isTyping,
    connectionError,
    chatWindowRef,
    sendMessage,
    searchTerm,
    setSearchTerm,
    exportChat,
    clearChat,
  };
};
