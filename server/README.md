
---

## 📄 **Backend – `server/README.md`**

```markdown
# ☁️ Weather ChatBot – Backend

This is the **backend API** for the Weather ChatBot project, built by **Sidhartha Vyas** (Roll No: **22-E&CS61-26**).

---

## 🧑‍🎓 Assignment Note
Although the assignment focused on frontend development, I implemented this lightweight backend so that the chatbot works with **real weather data** and **AI-powered responses**.  
This improves the overall user experience and makes the project deployable.

---

## ✨ Features
- 🖥️ **Express.js Server**
- 🔑 **OpenAI API Integration**
- 🌍 **Weather Data Fetching**
- 🔄 **Streaming Support** for smooth typewriter effect in the chat
- 🌐 **CORS Configured** to allow frontend requests
- ⚠️ **Graceful Error Handling**

---

## 🛠️ Tech Stack
- **Node.js + Express**
- **dotenv** for environment variables
- **cors** for cross-origin requests
- **OpenAI SDK**

---

## 📦 Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Sidharthavyas/viteWeather-chat.git
cd viteWeather-chat/server

Install dependencies

npm install


Create a .env file

PORT=5000
OPENAI_API_KEY=your-openai-api-key


Run the server

npm start


Backend will run on: http://localhost:5000

📡 API Endpoint
POST /api/weather

Request Body Example:

{
  "messages": [{ "role": "user", "content": "What's the weather in Delhi?" }],
  "threadId": "22-E&CS61-26",
  "resourceId": "weatherAgent",
  "temperature": 0.5
}


Response Example:

{
  "message": "The weather in Delhi is currently 32°C with clear skies."
}

🌐 Deployment

The backend is deployed on Render and integrated with the frontend hosted on Netlify.

👨‍💻 Author

Sidhartha Vyas
🎓 Roll No: 22-E&CS61-26