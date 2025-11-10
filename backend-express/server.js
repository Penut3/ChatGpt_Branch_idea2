const express = require("express");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const token = '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';
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

const client = new OpenAI({ baseURL: endpoint, apiKey: token });

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const completion = await client.chat.completions.create({
  messages,
  temperature: 1,
  top_p: 1,
  model,
});

    const reply = completion.choices[0].message.content;
    res.json({ response: reply });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
