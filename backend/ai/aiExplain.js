/**
 * aiExplain.js
 * ------------
 * AI explanation & recommendation layer for WatchDog
 * Uses Hugging Face Inference API (FREE)
 */

const fetch = require("node-fetch");
const HF_API_KEY = process.env.HF_API_KEY;
const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
const HF_ENDPOINT = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

if (!HF_API_KEY) {
  console.warn("⚠️ HF_API_KEY not found. AI explanations will fail.");
}

async function aiExplain({
  email,
  platforms,
  breaches,
  riskScore,
  riskLevel
}) {
  const prompt = `
You are a cybersecurity assistant for an OSINT-based email exposure analysis tool.

Context:
- Risk score and risk level are already calculated.
- You ONLY explain and recommend.

Email:
${email}

Platforms found (${platforms.length}):
${platforms.length ? platforms.join(", ") : "None"}

Historical breach signals (internal only):
${breaches.length ? "Present" : "None"}

Risk Score: ${riskScore}
Risk Level: ${riskLevel}

Tasks:
1. Explain why the risk level is ${riskLevel}.
2. Explain what attackers could infer.
3. Give 3–5 practical recommendations.

Rules:
- Do NOT change the score or level
- Do NOT mention breach names
- Calm, educational tone
- Return ONLY valid JSON:

{
  "explanation": "2–3 sentences",
  "recommendations": [
    "rec 1",
    "rec 2",
    "rec 3"
  ]
}
`;

  const response = await fetch(HF_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.4,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF API Error: ${errorText}`);
  }

  const data = await response.json();

  // Hugging Face returns generated text inside array
  const rawText =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : "";

  // Extract JSON safely
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("AI response did not return valid JSON");
  }

  const jsonString = rawText.slice(jsonStart, jsonEnd + 1);
  return JSON.parse(jsonString);
}

module.exports = { aiExplain };