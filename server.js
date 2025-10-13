// server.js
// Simple Express proxy: receives POST from LSL, calls OpenAI Chat API, returns JSON {reply, audio_url?}
// Requirements: set env OPENAI_API_KEY
import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { execSync } from "child_process";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req,res,next)=>{ res.setHeader('Access-Control-Allow-Origin','*'); next(); });

const limiter = rateLimit({ windowMs: 60*1000, max: 60 });
app.use(limiter);

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY not set in environment. The server will fail to call OpenAI.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory conversation history per avatar_key (keep small)
const histories = {};

app.post("/sl-to-openai", async (req, res) => {
  try {
    const avatar_name = req.body.avatar_name || "visitor";
    const avatar_key = req.body.avatar_key || "anon";
    const message = req.body.message || "";
    const voice = (req.body.voice === "true" || req.body.voice === "1" || req.body.voice === true);

    // maintain a short history
    histories[avatar_key] = histories[avatar_key] || [];
    histories[avatar_key].push({ role: "user", content: message });
    if (histories[avatar_key].length > 10) histories[avatar_key].shift();

    const systemPrompt = "You are a helpful assistant in Arabic or the user's language. Be concise and polite.";
    const messages = [{ role: "system", content: systemPrompt }, ...histories[avatar_key]];

    // Call OpenAI Chat Completions
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: messages,
      max_tokens: 400
    });

    const reply = completion.choices?.[0]?.message?.content || "لم أستطع الحصول على إجابة.";

    // Save assistant message in history
    histories[avatar_key].push({ role: "assistant", content: reply });
    if (histories[avatar_key].length > 20) histories[avatar_key].shift();

    let audio_url = null;
    if (voice) {
      // Option A: Use gTTS fallback to generate an MP3 and serve it from /audio/<file>
      // This is a simple fallback and requires `gtts` npm package (or other TTS).
      try {
        const safeName = avatar_key.replace(/[^a-z0-9]/gi,'_').slice(0,30);
        const filename = `tts_${safeName}_${Date.now()}.mp3`;
        const filepath = path.join(__dirname, "public", "audio");
        if (!fs.existsSync(filepath)) fs.mkdirSync(filepath, { recursive: true });
        // Use gtts CLI (gtts package) via child_process for simplicity
        // Note: in some hosts gtts may not be available; see README for alternatives.
        const tmpPath = path.join(filepath, filename);
        // Use a naive approach: write text to a temp file and convert via node gtts (if installed)
        // We'll try a simple node approach via `gtts` package
        const { GTTS } = await import('gtts');
        const gtts = new GTTS(reply, 'ar');
        await new Promise((resolve, reject) => {
          gtts.save(tmpPath, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        // Expose via /public/audio/<filename>
        audio_url = `${req.protocol}://${req.get('host')}/audio/${filename}`;
      } catch (e) {
        console.error("TTS generation failed:", e);
        audio_url = null;
      }
    }

    res.json({ reply, audio_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "حدث خطأ على الخادم." });
  }
});

// Static serving of audio
app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
