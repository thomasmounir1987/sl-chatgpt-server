import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ error: "Method Not Allowed" });
  }

  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).json({ error: "Missing 'name' or 'message' in body." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set." });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "أنت روبوت داخل Second Life، ودود ولبق." },
        { role: "user", content: `${name} قال: ${message}` },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "لا يوجد رد.";
    res.status(200).json({ reply });

  } catch (error) {
    console.error("Error from OpenAI:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
