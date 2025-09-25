import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.WEATHER_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------- Weather route ----------------
app.post("/api/weather", async (req, res) => {
  const { messages, threadId } = req.body;
  if (!messages || messages.length === 0) return res.status(400).json({ message: "No messages provided." });

  const rawInput = messages[0].content;
  if (!rawInput) return res.status(400).json({ message: "Message content is empty." });

  const cityName = rawInput.trim();
  console.log(`📍 Thread: ${threadId} | Input: "${rawInput}" | City: "${cityName}"`);

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ message: data.message || "Failed to fetch weather." });
    }

    res.json({
      success: true,
      message: `🌤️ ${data.weather[0].description} in ${data.name}, ${data.sys.country}`,
      threadId,
      resourceId: "weatherAgent",
    });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).json({ message: "Server error", success: false });
  }
});

// ---------------- OpenAI Chat route ----------------
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message provided" });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    console.log(`📩 Incoming message: ${message}`);

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful weather assistant." },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!openaiRes.ok) {
      const errorText = await openaiRes.text();
      console.error("❌ OpenAI API Error:", errorText);
      return res.status(500).json({ error: "Failed to get response from OpenAI" });
    }

    const reader = openaiRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        if (trimmed === "data: [DONE]") {
          res.write("\n");
          return res.end();
        }

        try {
          const json = JSON.parse(trimmed.replace("data: ", ""));
          const token = json.choices?.[0]?.delta?.content || "";
          if (token) res.write(token);
        } catch (err) {
          console.error("⚠️ Error parsing stream chunk:", err.message);
        }
      }
    }
  } catch (err) {
    console.error("🔥 Server Error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
    else res.end();
  }
});

// ---------------- Health check ----------------
app.get("/", (req, res) => res.json({ status: "✅ Weather ChatBot Server Running" }));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
