const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

async function test() {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly assistant." },
        { role: "user", content: "Say hello in a friendly way." },
      ],
    });
    console.log(completion.choices[0].message.content);
  } catch (err) {
    console.error("OpenAI test error:", err);
  }
}

test();
