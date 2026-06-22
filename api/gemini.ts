import type { VercelRequest, VercelResponse } from '@vercel/node';

const MODEL = 'gemini-2.0-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY niet ingesteld op de server.' });
  }

  const { prompt, imageBase64, mimeType } = req.body as {
    prompt: string;
    imageBase64?: string;
    mimeType?: string;
  };

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt ontbreekt.' });
  }

  const parts: object[] = [{ text: prompt }];
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: err?.error?.message ?? 'Gemini fout' });
    }

    const data = await geminiRes.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Serverfout bij Gemini aanroep.' });
  }
}
