import { useState, useRef, useEffect } from "react";

export const useChat = (API_BASE) => {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Weather Chat Agent 🌙", timestamp: Date.now() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const chatWindowRef = useRef(null);

  // ✅ Clear chat
  const clearChat = () => {
    setMessages([
      { role: "agent", content: "Weather Chat Agent 🌙", timestamp: Date.now() },
    ]);
  };

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ✅ Send message to backend (weather only)
  const sendMessage = async (content) => {
    if (!content.trim() || isTyping) return;

    const userMessage = { role: "user", content, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/weather`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [userMessage],
          threadId: Date.now().toString(),
        }),
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

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.message || "⚠️ No response received.",
          timestamp: Date.now(),
        },
      ]);

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
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json",
    });
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
