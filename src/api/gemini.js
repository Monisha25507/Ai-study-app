const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-flash-1.5';

const callOpenRouter = async (messages) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AI Study Assistant',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Ask a doubt — pass full message history for context
export const askDoubt = async (messages) => {
  return await callOpenRouter(messages);
};

// Summarize PDF text
export const summarizePDF = async (text) => {
  const truncated = text.slice(0, 12000); // limit tokens
  return await callOpenRouter([
    {
      role: 'user',
      content: `Summarize this document in clear bullet points with key takeaways:\n\n${truncated}`,
    },
  ]);
};

// Generate quiz questions
export const generateQuiz = async (topic, n = 5) => {
  const content = await callOpenRouter([
    {
      role: 'user',
      content: `Generate ${n} multiple choice quiz questions about: ${topic}. Return ONLY a valid JSON array with this shape: [{"question":"...","options":["A)...","B)...","C)...","D)..."],"answer":"A)..."}]. No markdown, no explanation, no code block.`,
    },
  ]);

  // Strip markdown code fences if model adds them anyway
  const cleaned = content.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};
