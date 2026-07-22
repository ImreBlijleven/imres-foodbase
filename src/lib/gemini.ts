import type { Ingredient, RecipeCategory, ShoppingCategory } from '../types';
import { RECIPE_CATEGORIES, SHOPPING_CATEGORIES } from '../types';
import { generateId } from '../utils';

const INTERNAL_TOKEN = import.meta.env.VITE_FOODBASE_INTERNAL_TOKEN as string | undefined;

export interface ExtractedRecipe {
  title: string | null;
  servings: number | null;
  category: RecipeCategory | null;
  ingredients: Ingredient[];
  steps: string[];
}

const EMPTY_RESULT: ExtractedRecipe = { title: null, servings: null, category: null, ingredients: [], steps: [] };

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

async function callProxyImages(prompt: string, images: { base64: string; mimeType: string }[]): Promise<string> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: proxyHeaders(),
    body: JSON.stringify({ prompt, images }),
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

function mapIngredients(arr: unknown): Ingredient[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((i): i is { name?: unknown; amount?: unknown; unit?: unknown } => i != null && typeof i === 'object')
    .map((i) => ({
      id: generateId(),
      name: typeof i.name === 'string' ? i.name : '',
      amount: typeof i.amount === 'number' && Number.isFinite(i.amount) ? i.amount : null,
      unit: typeof i.unit === 'string' && i.unit ? i.unit : null,
    }))
    .filter((i) => i.name);
}

function parseRecipe(raw: string): ExtractedRecipe {
  const cleaned = raw.replace(/```(?:json)?/g, '').trim();

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const obj = JSON.parse(objMatch[0]) as {
        title?: unknown; servings?: unknown; category?: unknown; ingredients?: unknown; steps?: unknown;
      };
      const servingsNum = Number(obj.servings);
      const category = typeof obj.category === 'string' && (RECIPE_CATEGORIES as readonly string[]).includes(obj.category)
        ? (obj.category as RecipeCategory)
        : null;
      return {
        title: typeof obj.title === 'string' && obj.title.trim() ? obj.title.trim() : null,
        servings: Number.isFinite(servingsNum) && servingsNum > 0 ? Math.round(servingsNum) : null,
        category,
        ingredients: mapIngredients(obj.ingredients),
        steps: Array.isArray(obj.steps)
          ? obj.steps.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          : [],
      };
    } catch { /* fall through to array fallback */ }
  }

  // Fallback: oud formaat — bare JSON array van ingrediënten
  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try {
      return { ...EMPTY_RESULT, ingredients: mapIngredients(JSON.parse(arrMatch[0])) };
    } catch { /* ignore */ }
  }

  return EMPTY_RESULT;
}

const RULES = `
Geef het recept terug als één JSON-object, exact dit formaat:
{
  "title": "Pasta arrabiata",
  "servings": 4,
  "category": "Diner",
  "ingredients": [{ "name": "ui", "amount": 2, "unit": "stuks" }],
  "steps": ["Snijd de ui.", "Bak 5 minuten op middelhoog vuur."]
}
Regels:
- Vertaal alle ingrediëntnamen en bereidingsstappen naar het Nederlands.
- Reken imperial om naar metrisch: cups naar ml (1 cup = 240 ml) of naar gram bij droge ingrediënten, oz naar gram (1 oz = 28 g), lb naar gram (1 lb = 454 g), °F naar °C. Rond af op praktische waarden.
- "category" is precies één van: Ontbijt, Lunch, Diner, Dessert, Snack, Bakken.
- "servings" is het aantal personen of porties als dat vermeld staat, anders null.
- Onbekende velden: null. "steps" en "ingredients" mogen leeg zijn ([]).
- Geef alleen de JSON terug, geen uitleg, geen markdown.
`;

const EXTRACT_PROMPT = (text: string) => `
Je krijgt de tekst van een recept of Instagram-caption.
${RULES}
Tekst:
${text}
`;

const SCREENSHOT_PROMPT = `
Dit is een foto van een recept of ingrediëntenlijst.
${RULES}
`;

const MULTI_SCREENSHOT_PROMPT = `
Dit zijn meerdere foto's van hetzelfde recept. De informatie kan over de foto's verdeeld zijn (bijvoorbeeld de ingrediëntenlijst op de ene foto en de bereiding op de andere, of een lange lijst die doorloopt). Combineer alle foto's tot één volledig recept zonder dingen dubbel te tellen.
${RULES}
`;

export async function extractFromText(text: string): Promise<ExtractedRecipe> {
  const raw = await callProxy(EXTRACT_PROMPT(text));
  return parseRecipe(raw);
}

export async function extractFromImage(base64: string, mimeType: string): Promise<ExtractedRecipe> {
  const raw = await callProxy(SCREENSHOT_PROMPT, base64, mimeType);
  return parseRecipe(raw);
}

export async function extractFromImages(images: { base64: string; mimeType: string }[]): Promise<ExtractedRecipe> {
  if (images.length === 0) return EMPTY_RESULT;
  if (images.length === 1) return extractFromImage(images[0].base64, images[0].mimeType);
  const raw = await callProxyImages(MULTI_SCREENSHOT_PROMPT, images);
  return parseRecipe(raw);
}

export async function fetchAndExtract(url: string): Promise<ExtractedRecipe> {
  const { text, title } = await fetchUrlServerSide(url);
  const result = await extractFromText(text);
  return { ...result, title: result.title ?? (title || null) };
}

export async function fetchInstagram(url: string): Promise<ExtractedRecipe> {
  try {
    const { text } = await fetchUrlServerSide(url);
    if (!text.trim()) throw new Error('instagram_fallback');
    return await extractFromText(text);
  } catch {
    throw new Error('instagram_fallback');
  }
}

const CATEGORIZE_PROMPT = (names: string[]) => `
Je krijgt een lijst met boodschappen. Geef voor elk item de supermarktcategorie waarin het normaal ligt.
Kies voor elk item precies één van deze categorieën: ${SHOPPING_CATEGORIES.join(', ')}.
Antwoord als één JSON-object waarbij de sleutel exact het item is en de waarde de categorie:
{ "melk": "Zuivel & eieren", "ui": "Groente & fruit" }
Gebruik "Overig" als je twijfelt. Geef alleen de JSON terug, geen uitleg, geen markdown.

Boodschappen:
${names.map((n) => `- ${n}`).join('\n')}
`;

export async function categorizeShoppingItems(names: string[]): Promise<Record<string, ShoppingCategory>> {
  if (names.length === 0) return {};
  const raw = await callProxy(CATEGORIZE_PROMPT(names));
  const cleaned = raw.replace(/```(?:json)?/g, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    const obj = JSON.parse(match[0]) as Record<string, unknown>;
    const valid = new Set<string>(SHOPPING_CATEGORIES);
    const result: Record<string, ShoppingCategory> = {};
    for (const [name, cat] of Object.entries(obj)) {
      if (typeof cat === 'string' && valid.has(cat)) {
        result[name] = cat as ShoppingCategory;
      }
    }
    return result;
  } catch {
    return {};
  }
}
