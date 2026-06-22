import { useState, useRef, useEffect } from 'react';
import type { Recipe, Ingredient } from '../types';
import { IngredientEditor } from './IngredientEditor';
import { extractFromText, extractFromImage, fetchAndExtract, fetchInstagram } from '../lib/gemini';

type Tab = 'handmatig' | 'website' | 'instagram' | 'screenshot';

interface Props {
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onBack: () => void;
  initialImage?: { base64: string; mimeType: string };
  initialUrl?: string;
}

export function AddRecipeScreen({ onSave, onBack, initialImage, initialUrl }: Props) {
  const isInstagram = initialUrl
    ? initialUrl.includes('instagram.com') || initialUrl.includes('instagr.am')
    : false;

  const [tab, setTab] = useState<Tab>(
    initialImage ? 'screenshot' : isInstagram ? 'instagram' : initialUrl ? 'website' : 'handmatig'
  );
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notReadable, setNotReadable] = useState(false);

  // Website/Instagram fetch URL
  const [url, setUrl] = useState(initialUrl ?? '');
  // Opgeslagen link bij recept
  const [link, setLink] = useState(initialUrl ?? '');

  // Instagram fallback
  const [instagramFallback, setInstagramFallback] = useState(false);
  const [captionText, setCaptionText] = useState('');

  // Shared image (via Web Share Target)
  const [sharedPreview, setSharedPreview] = useState<string | null>(
    initialImage ? `data:${initialImage.mimeType};base64,${initialImage.base64}` : null
  );

  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-extract when arriving with a pre-loaded image
  useEffect(() => {
    if (initialImage && ingredients.length === 0) {
      setLoading(true);
      extractFromImage(initialImage.base64, initialImage.mimeType)
        .then((ings) => setIngredients(ings))
        .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Fout bij verwerking.'))
        .finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave() {
    if (!name.trim()) { setError('Vul een naam in.'); return; }
    onSave({ name: name.trim(), ingredients, source: sourceForTab() });
  }

  function sourceForTab() {
    return link.trim() || (tab === 'screenshot' ? 'screenshot' : tab === 'instagram' ? 'instagram' : 'handmatig');
  }

  async function handleWebsiteImport() {
    if (!url.trim()) return;
    setLoading(true); setError(''); setNotReadable(false);
    try {
      const { title, ingredients: ings } = await fetchAndExtract(url.trim());
      if (!name && title) setName(title);
      if (!link) setLink(url.trim());
      if (ings.length === 0) {
        setNotReadable(true);
      } else {
        setIngredients(ings);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij ophalen.');
    } finally {
      setLoading(false);
    }
  }

  async function handleInstagramImport() {
    if (!url.trim()) return;
    setLoading(true); setError(''); setNotReadable(false);
    try {
      const { ingredients: ings } = await fetchInstagram(url.trim());
      if (!link) setLink(url.trim());
      if (ings.length === 0) {
        setNotReadable(true);
      } else {
        setIngredients(ings);
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.message === 'instagram_fallback') {
        setInstagramFallback(true);
      } else {
        setError(e instanceof Error ? e.message : 'Fout bij ophalen.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCaptionExtract() {
    if (!captionText.trim()) return;
    setLoading(true); setError('');
    try {
      const ings = await extractFromText(captionText.trim());
      setIngredients(ings);
      setInstagramFallback(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij extractie.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError('');
    setSharedPreview(URL.createObjectURL(file));
    try {
      const base64 = await resizeAndCompress(file);
      const ings = await extractFromImage(base64, 'image/jpeg');
      if (!name) setName(file.name.replace(/\.[^.]+$/, ''));
      setIngredients(ings);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Fout bij verwerking.');
    } finally {
      setLoading(false);
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'handmatig', label: 'Handmatig' },
    { key: 'website', label: 'Website' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'screenshot', label: 'Foto' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ background: 'var(--c-espresso)' }}>
        <button onClick={onBack} style={{ color: 'var(--c-cream)' }} className="text-xl active:opacity-70">←</button>
        <h1 className="font-serif-display text-lg" style={{ color: 'var(--c-cream)' }}>Recept toevoegen</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-shrink-0" style={{ background: 'var(--c-espresso)', borderBottom: '1px solid rgba(253,240,232,0.12)' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(''); setInstagramFallback(false); }}
            className="flex-1 py-2.5 text-sm font-medium transition-colors border-b-2"
            style={tab === t.key
              ? { borderColor: 'var(--c-terracotta)', color: 'var(--c-cream)' }
              : { borderColor: 'transparent', color: 'rgba(253,240,232,0.45)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Import controls */}
        {tab === 'website' && (
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-terracotta)' }}>Website URL</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--c-cream-dark)' }}
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="url"
              />
              <button
                onClick={handleWebsiteImport}
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 text-white rounded-xl text-sm font-medium active:opacity-80 disabled:opacity-40"
                style={{ background: 'var(--c-forest)' }}
              >
                {loading ? '…' : 'Haal op'}
              </button>
            </div>
          </div>
        )}

        {tab === 'instagram' && !instagramFallback && (
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-terracotta)' }}>Instagram link</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{ borderColor: 'var(--c-cream-dark)' }}
                placeholder="https://instagram.com/p/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="url"
              />
              <button
                onClick={handleInstagramImport}
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 text-white rounded-xl text-sm font-medium active:opacity-80 disabled:opacity-40"
                style={{ background: 'var(--c-forest)' }}
              >
                {loading ? '…' : 'Haal op'}
              </button>
            </div>
          </div>
        )}

        {tab === 'instagram' && instagramFallback && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Instagram blokkeert automatisch ophalen. Plak de caption hier:</p>
            <textarea
              className="w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none"
              style={{ borderColor: 'var(--c-cream-dark)' }}
              rows={5}
              placeholder="Plak hier de tekst van het Instagram-bericht..."
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
            />
            <button
              onClick={handleCaptionExtract}
              disabled={loading || !captionText.trim()}
              className="w-full py-2.5 text-white rounded-xl text-sm font-medium active:opacity-80 disabled:opacity-40"
              style={{ background: 'var(--c-forest)' }}
            >
              {loading ? 'Verwerken…' : 'Extraheer ingrediënten'}
            </button>
          </div>
        )}

        {tab === 'screenshot' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Foto van recept</label>
            {sharedPreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={sharedPreview} alt="Gedeelde foto" className="w-full object-cover max-h-48 rounded-xl" />
                <button
                  onClick={() => { setSharedPreview(null); fileRef.current?.click(); }}
                  className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg"
                >
                  Vervangen
                </button>
                {loading && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
                    <span className="text-white text-sm font-medium">Verwerken…</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="w-full py-10 border-2 border-dashed rounded-xl text-sm active:opacity-80 disabled:opacity-40 flex flex-col items-center gap-2"
                style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-terracotta)', opacity: 0.7 }}
              >
                <span className="text-3xl">📷</span>
                <span>{loading ? 'Verwerken…' : 'Tik om foto te kiezen'}</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {notReadable && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-4 space-y-3">
            <p className="text-sm text-amber-800 font-medium">
              De ingrediënten konden niet worden gelezen van deze pagina.
            </p>
            <p className="text-xs text-amber-600">
              Maak een screenshot van het recept en upload die — dan leest de AI de ingrediënten uit de foto.
            </p>
            <button
              onClick={() => {
                setNotReadable(false);
                setTab('screenshot');
                setTimeout(() => fileRef.current?.click(), 100);
              }}
              className="w-full py-2.5 bg-amber-500 text-white font-semibold rounded-xl active:bg-amber-600 text-sm"
            >
              📷 Screenshot uploaden
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
        )}

        {/* Naam */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-terracotta)' }}>Naam</label>
          <input
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: 'var(--c-cream-dark)' }}
            placeholder="Pasta arrabiata"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-terracotta)' }}>Link (optioneel)</label>
          <input
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            style={{ borderColor: 'var(--c-cream-dark)' }}
            placeholder="https://..."
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        {/* Ingrediënten */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--c-terracotta)' }}>
            Ingrediënten {ingredients.length > 0 && `(${ingredients.length})`}
          </label>
          <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
        </div>
      </div>

      {/* Save */}
      <div className="p-4 flex-shrink-0 bg-white" style={{ borderTop: '1px solid var(--c-cream-dark)' }}>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-3 text-white font-semibold rounded-xl active:opacity-80 disabled:opacity-40"
          style={{ background: 'var(--c-forest)' }}
        >
          Recept opslaan
        </button>
      </div>
    </div>
  );
}

// Resize to max 1024px and compress to JPEG to stay well under Vercel's 4.5MB limit
function resizeAndCompress(file: File, maxPx = 1024, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Afbeelding laden mislukt')); };
    img.src = url;
  });
}
