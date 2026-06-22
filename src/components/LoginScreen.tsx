import { useState } from 'react';
import { supabase } from '../lib/supabase';

const toEmail = (username: string) => `${username.toLowerCase().trim()}@foodbase.app`;

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    });
    if (err) setError('Gebruikersnaam of wachtwoord klopt niet.');
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-svh" style={{ background: 'var(--c-cream)' }}>
      {/* Hero */}
      <div
        className="flex flex-col items-center justify-center flex-shrink-0 pt-20 pb-14 px-6"
        style={{ background: 'var(--c-espresso)' }}
      >
        <div
          className="flex items-center justify-center rounded-2xl mb-5"
          style={{ width: 72, height: 72, background: 'var(--c-forest)' }}
        >
          <svg width="44" height="44" viewBox="0 0 56 56" fill="none">
            <path d="M10 22h36l-4.5 18a4 4 0 01-4 3H18.5a4 4 0 01-4-3L10 22z" fill="#FDF0E8" />
            <path d="M46 27.5h3.5a4.5 4.5 0 010 9H46" stroke="#FDF0E8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 17c1-3 3-4 3-7.5" stroke="#FDF0E8" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
            <path d="M28 15c.5-2.8 2-4.5 2-8" stroke="#FDF0E8" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>
        <h1
          className="font-serif-display text-4xl text-center mb-2 leading-tight"
          style={{ color: 'var(--c-cream)' }}
        >
          Imre's Foodbase
        </h1>
        <p className="text-xs tracking-widest font-medium" style={{ color: 'var(--c-terracotta)', letterSpacing: '0.18em' }}>
          PLAN, PLAN, PLAN
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h2 className="font-serif-display text-2xl mb-1" style={{ color: 'var(--c-espresso)' }}>
              Inloggen
            </h2>
            <p className="text-sm" style={{ color: 'var(--c-terracotta)', opacity: 0.8 }}>
              Vul je gebruikersnaam en wachtwoord in.
            </p>
          </div>

          <input
            type="text"
            required
            autoComplete="username"
            placeholder="Gebruikersnaam"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded-xl px-4 py-3.5 text-base focus:outline-none"
            style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-espresso)' }}
          />

          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Wachtwoord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3.5 text-base focus:outline-none"
            style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-espresso)' }}
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full py-3.5 text-white font-semibold rounded-xl active:opacity-80 disabled:opacity-40 transition-opacity"
            style={{ background: 'var(--c-forest)' }}
          >
            {loading ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
