import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import fs from "fs";
import { exec } from "child_process";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// استبدل بمفتاحك في Vercel Environment Variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.get("/", (req, res) => {
  res.send("✅ ChatGPT Second Life Bridge Server is running!");
});

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
            content: "You are a helpful AI assistant inside Second Life.",
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
    console.error("Error:", error.response?.data || error.message);
    res.status(500).json({ reply: "❌ Server Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
