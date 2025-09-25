import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.json({ status: "✅ Weather ChatBot Server Running" });
});

// ✅ Chat endpoint with streaming
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    // Set headers for streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Call OpenAI API with streaming enabled
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // lightweight, fast model
        messages: [
          { role: "system", content: "You are a helpful weather assistant." },
          { role: "user", content: message }
        ],
        stream: true
      })
    });

    if (!openaiRes.ok) {
      console.error("❌ OpenAI API Error:", await openaiRes.text());
      return res.status(500).json({ error: "Failed to get response from OpenAI" });
    }

    const reader = openaiRes.body.getReader();
    const decoder = new TextDecoder();

    // Stream data chunk by chunk
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
          if (token) {
            res.write(token);
          }
        } catch (err) {
          console.error("Error parsing stream chunk:", err.message);
        }
      }
    }
  } catch (err) {
    console.error("Server Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
