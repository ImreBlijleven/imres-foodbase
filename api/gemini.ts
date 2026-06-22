import type { VercelRequest, VercelResponse } from '@vercel/node';

const MODEL = 'gemini-2.5-flash-lite';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.FOODBASE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FOODBASE_GEMINI_API_KEY niet ingesteld op de server.' });
  }

  const { prompt, imageBase64, mimeType, fetchUrl } = req.body as {
    prompt: string;
    imageBase64?: string;
    mimeType?: string;
    fetchUrl?: string;   // server-side URL fetch (omzeilt CORS)
  };

  // Optie: haal een URL op server-side en geef de tekst + titel terug
  if (fetchUrl) {
    try {
      const pageRes = await fetch(fetchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Foodbase/1.0)' },
        signal: AbortSignal.timeout(10000),
      });
      const html = await pageRes.text();
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000);
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : '';
      return res.status(200).json({ text, title });
    } catch (e) {
      return res.status(502).json({ error: 'Kon de pagina niet ophalen.' });
    }
  }

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
      return res.status(geminiRes.status).json({ error: (err as { error?: { message?: string } })?.error?.message ?? 'Gemini fout' });
    }

    const data = await geminiRes.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return res.status(200).json({ text });
  } catch {
    return res.status(500).json({ error: 'Serverfout bij Gemini aanroep.' });
  }
}
