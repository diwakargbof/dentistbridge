import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo, ErrorBanner } from '../ui/index.jsx';

export default function Auth() {
  const { signIn } = useAuth();
  const [phone, setPhone]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!digits) return;
    setLoading(true);
    setError('');
    try {
      await signIn(digits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scr">
      <div className="scr-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 28px 48px' }}>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Logo size={52} />
          <div className="serif" style={{ fontSize: 38, letterSpacing: '-0.025em', marginTop: 16, lineHeight: 1.06 }}>
            Chairside
          </div>
          <div className="muted" style={{ fontSize: 14, marginTop: 8 }}>
            Between the chair and the bench.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="t-xs muted" style={{ marginLeft: 2 }}>Mobile number</label>
            <input
              className="field"
              type="tel"
              inputMode="numeric"
              placeholder="Enter your phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoFocus
            />
          </div>

          {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

          <button
            className="btn btn-clay btn-block"
            type="submit"
            disabled={loading || !phone.trim()}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
