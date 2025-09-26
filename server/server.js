// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.WEATHER_KEY;

// ✅ Allow only your Vercel frontend to access the API
const allowedOrigins = [
  "https://weather-chat-app-4ey4-bk4aoghd4-vyassidhartha5-9029s-projects.vercel.app", // Replace with your actual Vercel domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., Postman, local dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: Not allowed by server."));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ---------------- Weather route ----------------
app.post("/api/weather", async (req, res) => {
  const { messages, threadId } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ message: "No messages provided." });
  }

  const rawInput = messages[0].content;
  if (!rawInput) {
    return res.status(400).json({ message: "Message content is empty." });
  }

  const cityName = rawInput.trim();
  console.log(`📍 Thread: ${threadId} | Input: "${rawInput}" | City: "${cityName}"`);

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cityName
    )}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      return res
        .status(apiResponse.status)
        .json({ message: data.message || "Failed to fetch weather." });
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

// ---------------- Health check ----------------
app.get("/", (req, res) =>
  res.json({ status: "✅ Weather ChatBot Server Running" })
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔑 OpenWeather API Key: ${OPENWEATHER_API_KEY ? "✅ Found" : "❌ Missing"}`);
});
