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
const model = "openai/gpt-5";

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
