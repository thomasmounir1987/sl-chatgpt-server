app.post("/sl-to-openai", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("Received message:", message);

    if (!process.env.OPENAI_API_KEY) {
      console.log("❌ Missing API key");
      return res.status(500).send("❌ Missing OpenAI API key");
    }

    if (!message) {
      console.log("❌ No message provided");
      return res.status(400).send("❌ No message provided");
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a friendly AI assistant inside Second Life." },
        { role: "user", content: message }
      ]
    });

    const reply = completion.choices?.[0]?.message?.content || "⚠️ No reply generated.";
    console.log("Reply generated:", reply);
    res.json({ reply });

  } catch (err) {
    console.error("🔥 Server Error:", err);
    res.status(500).send("Internal Server Error → " + err.message + " | " + JSON.stringify(err));
  }
});
