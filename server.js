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
    return res.status(400).json({ error: "❌ Missing 'name' or 'message' in body." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "❌ OPENAI_API_KEY is not set in environment variables." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "أنت روبوت داخل Second Life، تتحدث بطريقة ودودة وطبيعية." },
        { role: "user", content: `${name} قال: ${message}` },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "لم أستطع توليد رد.";

    console.log("✅ طلب من:", name);
    console.log("💬 الرسالة:", message);
    console.log("🤖 الرد:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ خطأ أثناء الاتصال بـ ChatGPT:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

export default app;
