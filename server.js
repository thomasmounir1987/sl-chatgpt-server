import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("✅ SL ChatGPT Server is running!");
});

app.post("/api/message", async (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Missing 'name' or 'message' in request body." });
  }

  try {
    // استدعاء نموذج ChatGPT
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "أنت روبوت داخل Second Life، تتحدث بشكل ودود، لبق، وممتع."
        },
        {
          role: "user",
          content: `${name} قال: ${message}`
        }
      ],
    });

    const reply = completion.choices[0].message.content.trim();
    console.log(`💬 ${name}: ${message}`);
    console.log(`🤖 ChatGPT: ${reply}`);

    res.json({ reply });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بـ ChatGPT API." });
  }
});

export default app;
