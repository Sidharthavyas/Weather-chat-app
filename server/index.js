// server/index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch"); // ensure installed

const app = express();
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.WEATHER_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// ------------------ Helpers ------------------

function extractCityName(query) {
  const cleanQuery = query.trim().toLowerCase();
  const patterns = [
    /(?:what'?s|how'?s|tell me about|check|get)?\s*(?:the\s+)?weather\s+(?:in|for|at|of)\s+(.+)$/i,
    /(?:weather\s+)?(?:in|for|at|of)\s+(.+)$/i,
    /(.+)\s+weather$/i,
    /^(.+)$/ // fallback
  ];
  for (const pattern of patterns) {
    const match = cleanQuery.match(pattern);
    if (match && match[1]) {
      let cityName = match[1].trim();
      cityName = cityName.replace(/\b(today|now|currently|right now|please|thanks|thank you)\b/gi, '').trim();
      cityName = cityName.replace(/\s+/g, ' ').replace(/['"]/g, '').trim();
      if (cityName.length > 0) return cityName;
    }
  }
  return query.trim().replace(/['"]/g, '');
}

function getWeatherEmoji(weatherMain, weatherDescription) {
  const main = weatherMain.toLowerCase();
  const desc = weatherDescription.toLowerCase();
  if (main.includes("clear")) return "☀️";
  if (main.includes("cloud")) {
    if (desc.includes("few clouds")) return "🌤️";
    if (desc.includes("scattered") || desc.includes("broken")) return "⛅";
    return "☁️";
  }
  if (main.includes("rain")) return desc.includes("light") ? "🌦️" : "🌧️";
  if (main.includes("drizzle")) return "🌦️";
  if (main.includes("thunder")) return "⛈️";
  if (main.includes("snow")) return "🌨️";
  if (main.includes("mist") || main.includes("fog")) return "🌫️";
  if (main.includes("haze")) return "😶‍🌫️";
  return "🌤️";
}

function formatWeatherResponse(data) {
  const emoji = getWeatherEmoji(data.weather[0].main, data.weather[0].description);
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const description = data.weather[0].description;
  const cityName = data.name;
  const country = data.sys.country;
  const windSpeedKmh = Math.round(data.wind.speed * 3.6);

  let response = `${emoji} The weather in ${cityName}, ${country} is currently ${description}.\n`;
  response += `🌡️ Temp: ${temp}°C (feels like ${feelsLike}°C)\n`;
  response += `💧 Humidity: ${data.main.humidity}%\n`;
  response += `💨 Wind: ${windSpeedKmh} km/h\n`;

  if (temp < 5) response += "🧥 Bundle up, it's cold!";
  else if (temp > 30) response += "☀️ Stay cool!";
  else if (temp >= 20 && temp <= 25) response += "🌳 Perfect weather!";
  else if (description.includes("rain")) response += "☔ Take an umbrella!";
  else response += "Have a great day! 😊";

  return response;
}

// ------------------ Routes ------------------

// Weather endpoint matching assignment payload
app.post("/api/weather", async (req, res) => {
  const { messages, threadId } = req.body;
  if (!messages || messages.length === 0) return res.status(400).json({ message: "No messages provided." });
  const rawInput = messages[0].content;
  if (!rawInput) return res.status(400).json({ message: "Message content is empty." });

  const cityName = extractCityName(rawInput);
  console.log(`📍 Thread: ${threadId} | Input: "${rawInput}" | City: "${cityName}"`);

  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      if (apiResponse.status === 404) return res.status(404).json({ message: `Couldn't find "${cityName}".` });
      if (apiResponse.status === 401) return res.status(401).json({ message: "API key invalid." });
      return res.status(apiResponse.status).json({ message: data.message || "Failed to fetch weather." });
    }

    const weatherMessage = formatWeatherResponse(data);
    res.json({ message: weatherMessage, success: true, threadId, resourceId: "weatherAgent" });
  } catch (err) {
    console.error("💥 Server error:", err);
    res.status(500).json({ message: "Server error. Try again later.", success: false });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), apiKeyConfigured: !!OPENWEATHER_API_KEY });
});

// Default route
app.get("/", (req, res) => {
  res.json({
    message: "🌤️ Weather API running!",
    endpoints: {
      weather: "POST /api/weather",
      health: "GET /health"
    }
  });
});

// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`🌤️ Server running at http://localhost:${PORT}`);
  console.log(`🔑 OpenWeather API key: ${OPENWEATHER_API_KEY ? "✅ Configured" : "❌ Missing"}`);
});
