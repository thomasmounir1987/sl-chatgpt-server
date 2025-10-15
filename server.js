import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// ✅ الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("✅ ChatGPT Second Life Bridge is running fine!");
});

// ✅ المسار الذي يستقبل الرسائل من LSL
app.post("/sl-to-openai", async (req, res) => {
  try {
    const { message, avatar_name } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "⚠️ No message received." });
    }

    const openaiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: OPENAI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an AI assistant living inside Second Life. Respond conversationally and briefly.",
          },
          { role: "user", content: message },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = openaiRes.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ reply: "❌ Server error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
app.post("/sl-to-openai", async (req, res) => {
  try {
    const { message, avatar_name } = req.body;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        { role: "system", content: "You are a helpful AI assistant inside Second Life." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
});
