import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.WEATHER_KEY;

app.use(
  cors({
    origin: ["https://weather-chat-app-4ey4.vercel.app", "*"], // allow frontend
    methods: ["GET", "POST"],
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

  let rawInput = messages[0].content;
  if (!rawInput) {
    return res.status(400).json({ message: "Message content is empty." });
  }

  // Extract city name more intelligently
  let cityName = rawInput.trim();
  if (/weather|forecast|temperature|climate/i.test(cityName)) {
    const words = cityName.split(" ");
    cityName = words[words.length - 1]; // pick last word
  }

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
      message: `🌤️ ${data.weather[0].description} in ${data.name}, ${data.sys.country}, Temperature: ${data.main.temp}°C`,
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

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
