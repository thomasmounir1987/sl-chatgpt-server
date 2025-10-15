app.post("/sl-to-openai", async (req, res) => {
  try {
    const { message } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).send("❌ Missing OpenAI API key.");
    }
    if (!message) {
      return res.status(400).send("❌ No message provided.");
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly AI assistant inside Second Life." },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content || "⚠️ No reply generated.";
    res.json({ reply });

  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).send("Internal Server Error → " + err.message + " | " + JSON.stringify(err));
  }
});
