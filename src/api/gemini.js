const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const callGemini = async (messages) => {
  // Convert messages to Gemini format
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

// Ask a doubt — pass full message history for context
export const askDoubt = async (messages) => {
  return await callGemini(messages);
};

// Summarize PDF text
export const summarizePDF = async (text) => {
  const truncated = text.slice(0, 12000);
  return await callGemini([
    {
      role: 'user',
      content: `Summarize this document in clear bullet points with key takeaways:\n\n${truncated}`,
    },
  ]);
};

// Generate quiz questions
export const generateQuiz = async (topic, n = 5) => {
  const content = await callGemini([
    {
      role: 'user',
      content: `Generate ${n} multiple choice quiz questions about: ${topic}. Return ONLY a valid JSON array with this shape: [{"question":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A)..."}]. No markdown, no explanation, no code block.`,
    },
  ]);

  const cleaned = content.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};
