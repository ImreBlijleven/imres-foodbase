import type { Ingredient } from '../types';
import { generateId } from '../utils';

async function callProxy(prompt: string, imageBase64?: string, mimeType?: string): Promise<string> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64, mimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `Fout: ${res.status}`);
  }

  const data = await res.json();
  return data.text ?? '';
}

function parseIngredients(raw: string): Ingredient[] {
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]) as { name: string; amount?: number | null; unit?: string | null }[];
    return arr.map((i) => ({
      id: generateId(),
      name: i.name ?? '',
      amount: i.amount ?? null,
      unit: i.unit ?? null,
    }));
  } catch {
    return [];
  }
}

const EXTRACT_PROMPT = (text: string) => `
Je krijgt de tekst van een recept of Instagram-caption.
Extraheer de ingrediënten als een JSON array in dit formaat:
[{ "name": "ui", "amount": 2, "unit": "stuks" }]
Geef alleen de JSON terug, geen uitleg.

Tekst:
${text}
`;

const SCREENSHOT_PROMPT = `
Dit is een foto van een recept of ingrediëntenlijst.
Extraheer de ingrediënten als een JSON array:
[{ "name": "ui", "amount": 2, "unit": "stuks" }]
Geef alleen de JSON terug, geen uitleg.
`;

export async function extractFromText(text: string): Promise<Ingredient[]> {
  const raw = await callProxy(EXTRACT_PROMPT(text));
  return parseIngredients(raw);
}

export async function extractFromImage(base64: string, mimeType: string): Promise<Ingredient[]> {
  const raw = await callProxy(SCREENSHOT_PROMPT, base64, mimeType);
  return parseIngredients(raw);
}

export async function fetchAndExtract(url: string): Promise<{ title: string; ingredients: Ingredient[] }> {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  let text = '';
  let title = '';

  try {
    const res = await fetch(proxyUrl);
    const json = await res.json();
    const html: string = json.contents ?? '';
    text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 8000);
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = titleMatch ? titleMatch[1].trim() : '';
  } catch {
    throw new Error('Kon de pagina niet ophalen. Controleer de URL.');
  }

  const ingredients = await extractFromText(text);
  return { title, ingredients };
}

export async function fetchInstagram(url: string): Promise<{ ingredients: Ingredient[] }> {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const json = await res.json();
    const html: string = json.contents ?? '';
    const metaMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
    const caption = metaMatch ? metaMatch[1] : '';
    if (!caption) throw new Error('no_caption');
    const ingredients = await extractFromText(caption);
    return { ingredients };
  } catch {
    throw new Error('instagram_fallback');
  }
}
