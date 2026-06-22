import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
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
        {sent ? (
          <div className="text-center space-y-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(45,74,62,0.1)' }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ color: 'var(--c-forest)' }}>
                <path d="M4 8l10 7 10-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="3" y="6" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h2 className="font-serif-display text-2xl" style={{ color: 'var(--c-espresso)' }}>
              Check je mail
            </h2>
            <p className="text-sm" style={{ color: 'var(--c-terracotta)' }}>
              We hebben een inloglink gestuurd naar<br />
              <strong style={{ color: 'var(--c-espresso)' }}>{email}</strong>
            </p>
            <p className="text-xs mt-4" style={{ color: 'var(--c-terracotta)', opacity: 0.6 }}>
              Klik op de link in de mail om in te loggen. Je kunt dit venster sluiten.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="font-serif-display text-2xl mb-1" style={{ color: 'var(--c-espresso)' }}>
                Inloggen
              </h2>
              <p className="text-sm" style={{ color: 'var(--c-terracotta)', opacity: 0.8 }}>
                Vul je e-mailadres in. Je ontvangt een magische inloglink.
              </p>
            </div>

            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3.5 text-base focus:outline-none"
              style={{ borderColor: 'var(--c-cream-dark)', color: 'var(--c-espresso)' }}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full py-3.5 text-white font-semibold rounded-xl active:opacity-80 disabled:opacity-40 transition-opacity"
              style={{ background: 'var(--c-forest)' }}
            >
              {loading ? 'Versturen…' : 'Stuur inloglink'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
