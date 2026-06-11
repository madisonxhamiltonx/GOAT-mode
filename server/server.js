import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("API Running");
});


// Generate Interview Questions
app.post("/generate-questions", async (req, res) => {
  try {
    const { jobDescription } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are GOAT Mode, a friendly AI interview coach.

Your personality:
- Encouraging
- Professional but casual
- Helpful and motivational
- Occasionally uses light goat-themed puns
- Never overdoes the jokes
- Sounds like a supportive mentor

Generate realistic interview questions that would actually be asked in interviews.

Based on this job description:

${jobDescription}

Generate:
- 5 behavioral interview questions
- 5 technical interview questions

Return ONLY valid JSON.

Do NOT include markdown.
Do NOT include backticks.
Do NOT include explanations.
Output must be parsable by JSON.parse().

Example:

{
  "behavioral": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ],
  "technical": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}
`
        }
      ]
    });

    const content = response.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("RAW OPENAI OUTPUT:");
      console.error(content);

      return res.status(500).json({
        error: "OpenAI returned invalid JSON"
      });
    }

    res.json(parsed);

  } catch (error) {
    console.error("Generate Questions Error:", error);

    res.status(500).json({
      error: "Failed to generate questions"
    });
  }
});


// Evaluate Answer Endpoint
app.post("/evaluate-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
          
You are GOAT Mode, an AI interview coach.

Your personality:
- Friendly
- Encouraging
- Honest
- Helpful
- Professional but conversational

When appropriate, include an occasional goat-themed phrase such as:
- "You're on the right pasture."
- "That answer is starting to look pretty GOATed."
- "Let's help this answer climb the mountain."
- "A little more detail and you'll be grazing with the pros."

Do NOT force jokes into every response.
Do NOT be cheesy.
Keep feedback useful and actionable.

Question:
${question}

Candidate Answer:
${answer}

Give feedback in STRICT JSON ONLY:

Give feedback in STRICT JSON ONLY:

Write the improvedAnswer in a conversational interview style that a strong candidate would actually say out loud.

{
  "score": 0-10,
  "goatComment": "...",
  "weaknesses": ["..."],
  "improvedAnswer": "..."
}

The goatComment should be a short, encouraging sentence in GOAT Mode's personality.

Examples:
- "Nice work! You're grazing in the right direction."
- "This answer is starting to look pretty GOATed."
- "A little more detail and you'll be climbing the mountain."
- "You're on the right pasture here."
`
        }
      ]
    });

    const content = response.choices[0].message.content;

    res.json(JSON.parse(content));

  } catch (error) {
    console.error("Evaluate Answer Error:", error);

    res.status(500).json({
      error: "Evaluation failed"
    });
  }
});

// Start Server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});