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
    <div className="flex flex-col h-svh" style={{ background: 'var(--c-espresso)' }}>
      {/* Hero met merkbadge */}
      <div
        className="flex flex-col items-center flex-shrink-0 pb-8"
        style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <img
          src="/badge.png"
          alt="Imre's Foodbase"
          className="w-[150px] h-[150px] md:w-[180px] md:h-[180px] rounded-full object-cover"
          draggable={false}
        />
        <p
          className="text-[11px] font-medium mt-5"
          style={{ color: 'var(--c-terracotta)', letterSpacing: '0.28em' }}
        >
          PLAN FOR SUCCESS
        </p>
      </div>

      {/* Inlogkaart */}
      <div
        className="flex-1 flex flex-col rounded-t-3xl px-6 pt-9"
        style={{ background: 'var(--c-cream)', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
          <div className="mb-6">
            <h2 className="font-serif-display text-3xl mb-1.5" style={{ color: 'var(--c-espresso)' }}>
              Welkom terug
            </h2>
            <p className="text-sm" style={{ color: 'var(--c-terracotta)', opacity: 0.85 }}>
              Log in om verder te gaan met plannen.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-username" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--c-terracotta)' }}>
              Gebruikersnaam
            </label>
            <input
              id="login-username"
              type="text"
              required
              autoComplete="username"
              placeholder="Gebruikersnaam"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white border rounded-xl px-4 py-3.5 text-base focus:outline-none transition-colors"
              style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-espresso)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-forest)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--c-cream-dark)')}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--c-terracotta)' }}>
              Wachtwoord
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border rounded-xl px-4 py-3.5 text-base focus:outline-none transition-colors"
              style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-espresso)' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--c-forest)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--c-cream-dark)')}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full py-3.5 text-white font-semibold rounded-xl active:opacity-80 disabled:opacity-40 transition-opacity mt-2"
            style={{ background: 'var(--c-forest)' }}
          >
            {loading ? 'Inloggen…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </div>
  );
}
