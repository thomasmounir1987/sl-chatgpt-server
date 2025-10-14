# ChatGPT Bridge for Second Life

This project provides a lightweight Express.js server that connects Second Life LSL scripts with OpenAI's GPT models.

## How to Deploy

1. Fork or upload this repo to your GitHub.
2. Go to [vercel.com](https://vercel.com/) → Import the repo.
3. Add environment variables:
   - `OPENAI_API_KEY` → your OpenAI key
   - `OPENAI_MODEL` → `gpt-4o-mini`
4. Deploy ✅

You’ll get a public URL like:
`https://your-app-name.vercel.app/sl-to-openai`

Use that URL in your Second Life LSL script.
