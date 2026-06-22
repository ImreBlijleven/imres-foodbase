import { useState, useRef } from 'react';
import type { Recipe, Ingredient } from '../types';
import { IngredientEditor } from './IngredientEditor';
import { extractFromText, extractFromImage, fetchAndExtract, fetchInstagram } from '../lib/gemini';

type Tab = 'handmatig' | 'website' | 'instagram' | 'screenshot';

interface Props {
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onBack: () => void;
}

export function AddRecipeScreen({ onSave, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('handmatig');
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notReadable, setNotReadable] = useState(false);

  // Website/Instagram
  const [url, setUrl] = useState('');

  // Instagram fallback
  const [instagramFallback, setInstagramFallback] = useState(false);
  const [captionText, setCaptionText] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    if (!name.trim()) { setError('Vul een naam in.'); return; }
    onSave({ name: name.trim(), ingredients, source: sourceForTab() });
  }

  function sourceForTab() {
    if (tab === 'website') return url;
    if (tab === 'instagram') return url || 'instagram';
    if (tab === 'screenshot') return 'screenshot';
    return 'handmatig';
  }

  async function handleWebsiteImport() {
    if (!url.trim()) return;
    setLoading(true); setError(''); setNotReadable(false);
    try {
      const { title, ingredients: ings } = await fetchAndExtract(url.trim());
      if (!name && title) setName(title);
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
    try {
      const base64 = await fileToBase64(file);
      const ings = await extractFromImage(base64, file.type);
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
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white flex-shrink-0">
        <button onClick={onBack} className="text-gray-500 text-xl">←</button>
        <h1 className="text-lg font-semibold text-gray-800">Recept toevoegen</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(''); setInstagramFallback(false); }}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-400 active:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Import controls */}
        {tab === 'website' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Website URL</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="url"
              />
              <button
                onClick={handleWebsiteImport}
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:bg-green-600 disabled:opacity-40"
              >
                {loading ? '…' : 'Haal op'}
              </button>
            </div>
          </div>
        )}

        {tab === 'instagram' && !instagramFallback && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instagram link</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                placeholder="https://instagram.com/p/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="url"
              />
              <button
                onClick={handleInstagramImport}
                disabled={loading || !url.trim()}
                className="px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:bg-green-600 disabled:opacity-40"
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-300"
              rows={5}
              placeholder="Plak hier de tekst van het Instagram-bericht..."
              value={captionText}
              onChange={(e) => setCaptionText(e.target.value)}
            />
            <button
              onClick={handleCaptionExtract}
              disabled={loading || !captionText.trim()}
              className="w-full py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium active:bg-green-600 disabled:opacity-40"
            >
              {loading ? 'Verwerken…' : 'Extraheer ingrediënten'}
            </button>
          </div>
        )}

        {tab === 'screenshot' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Foto van recept</label>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="w-full py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm active:bg-gray-50 disabled:opacity-40 flex flex-col items-center gap-2"
            >
              <span className="text-3xl">📷</span>
              <span>{loading ? 'Verwerken…' : 'Tik om foto te kiezen'}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
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
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Naam</label>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Pasta arrabiata"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Ingrediënten */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Ingrediënten {ingredients.length > 0 && `(${ingredients.length})`}
          </label>
          <IngredientEditor ingredients={ingredients} onChange={setIngredients} />
        </div>
      </div>

      {/* Save */}
      <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-xl active:bg-green-600 disabled:opacity-40"
        >
          Recept opslaan
        </button>
      </div>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
