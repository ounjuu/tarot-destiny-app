const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Gemini → Groq 폴백 AI 호출
export async function callAI(prompt: string): Promise<{ text: string | null; source: "gemini" | "groq" | null; geminiFailed: boolean; groqFailed: boolean }> {
  let geminiFailed = false;
  let groqFailed = false;
  // 1차: Gemini
  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (res.ok && !data.error) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text, source: "gemini", geminiFailed: false, groqFailed: false };
      }
      geminiFailed = true;
    } catch {
      geminiFailed = true;
    }
  } else {
    geminiFailed = true;
  }

  // 2차: Groq (Llama)
  if (GROQ_API_KEY) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,
          max_tokens: 2048,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const text = data.choices?.[0]?.message?.content;
        if (text) return { text, source: "groq", geminiFailed, groqFailed: false };
      }
      groqFailed = true;
    } catch {
      groqFailed = true;
    }
  } else {
    groqFailed = true;
  }

  // 둘 다 실패
  return { text: null, source: null, geminiFailed, groqFailed };
}
