import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { Avatar, Icon, Button, Field, ErrorBanner, Logo } from '../ui/index.jsx';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(profile?.full_name || '');
  const [phone, setPhone]     = useState(profile?.phone || '');
  const [city, setCity]       = useState(profile?.city || '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSave() {
    setLoading(true);
    setError('');
    try {
      await api.auth.updateProfile({ full_name: name, phone, city });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '60px 24px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Profile card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0', textAlign: 'center' }}>
          <Avatar name={profile?.full_name || '?'} size={72} tone={profile?.role === 'dentist' ? 'info' : 'clay'} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{profile?.full_name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, textTransform: 'capitalize' }}>
              {profile?.role === 'technician' ? 'Dental Technician' : 'Dentist'}
            </div>
          </div>
        </div>

        {!editing ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: 'user',    label: 'Name',  value: profile?.full_name },
              { icon: 'map-pin', label: 'City',  value: profile?.city || '—' },
              { icon: 'briefcase', label: 'Phone', value: profile?.phone || '—' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={16} color="var(--muted)" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
            <Button variant="soft" onClick={() => setEditing(true)} style={{ marginTop: 4 }}>
              <Icon name="edit" size={16} />Edit profile
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
            <Field label="Name">
              <input className="field" value={name} onChange={e => setName(e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className="field" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </Field>
            <Field label="City">
              <input className="field" value={city} onChange={e => setCity(e.target.value)} />
            </Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" block onClick={() => setEditing(false)}>Cancel</Button>
              <Button variant="clay" block onClick={handleSave} disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        )}

        {/* Branding footer */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 16 }}>
          <Logo size={22} />
          <span style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--ink-2)' }}>Chairside</span>
          <span style={{ color: 'var(--muted-2)' }}>·</span>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>v2.0</span>
        </div>

        <Button variant="ghost" onClick={signOut} style={{ color: 'var(--danger)' }}>
          <Icon name="log-out" size={16} color="var(--danger)" />Sign out
        </Button>
      </div>
    </div>
  );
}
