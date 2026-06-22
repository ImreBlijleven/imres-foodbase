import type { Ingredient } from '../types';
import { generateId } from '../utils';

const INTERNAL_TOKEN = import.meta.env.VITE_FOODBASE_INTERNAL_TOKEN as string | undefined;

function proxyHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (INTERNAL_TOKEN) headers['x-foodbase-token'] = INTERNAL_TOKEN;
  return headers;
}

async function callProxy(prompt: string, imageBase64?: string, mimeType?: string): Promise<string> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({ prompt, imageBase64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? `Fout: ${res.status}`);
  }
  const data = await res.json() as { text: string };
  return data.text ?? '';
}

async function fetchUrlServerSide(url: string): Promise<{ text: string; title: string }> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({ fetchUrl: url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string })?.error ?? 'Kon pagina niet ophalen.');
  }
  return res.json() as Promise<{ text: string; title: string }>;
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
  const { text, title } = await fetchUrlServerSide(url);
  const ingredients = await extractFromText(text);
  return { title, ingredients };
}

export async function fetchInstagram(url: string): Promise<{ ingredients: Ingredient[] }> {
  try {
    const { text } = await fetchUrlServerSide(url);
    if (!text.trim()) throw new Error('instagram_fallback');
    const ingredients = await extractFromText(text);
    return { ingredients };
  } catch {
    throw new Error('instagram_fallback');
  }
}
