import React from 'react';

// ── Icons ─────────────────────────────────────────────────────
const PATHS = {
  bell:       <><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></>,
  home:       <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  inbox:      <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></>,
  search:     <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  plus:       <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  check:      <><polyline points="20 6 9 17 4 12"/></>,
  'check-c':  <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  x:          <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  'chev-r':   <><polyline points="9 18 15 12 9 6"/></>,
  'chev-l':   <><polyline points="15 18 9 12 15 6"/></>,
  'chev-d':   <><polyline points="6 9 12 15 18 9"/></>,
  edit:       <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash:      <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></>,
  send:       <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  image:      <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
  paperclip:  <><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></>,
  filter:     <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  grid:       <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  list:       <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  star:       <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  clock:      <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  archive:    <><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></>,
  'eye':      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></>,
  'log-out':  <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  'map-pin':  <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
  'briefcase':<><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></>,
  'user':     <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  'zap':      <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
};

export function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name]}
    </svg>
  );
}

// ── Logo ──────────────────────────────────────────────────────
export function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="20" fill="var(--clay-soft)" />
      <circle cx="20" cy="20" r="12" fill="none" stroke="var(--clay)" strokeWidth="2" />
      <circle cx="20" cy="20" r="3" fill="var(--clay)" />
    </svg>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ name = '?', size = 40, tone = '' }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const sz = size <= 32 ? 32 : size <= 40 ? 40 : size <= 48 ? 48 : 56;
  return (
    <div className={`av av-${sz} ${tone ? `av-${tone}` : ''}`} style={size !== sz ? { width: size, height: size } : {}}>
      {initials}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────
export function Button({ children, variant = '', size = '', block, onClick, disabled, type = 'button', style }) {
  return (
    <button
      type={type}
      className={`btn ${variant ? `btn-${variant}` : ''} ${size ? `btn-${size}` : ''} ${block ? 'btn-block' : ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

// ── Pill / badge ──────────────────────────────────────────────
export function Pill({ children, tone = '' }) {
  return <span className={`pill ${tone ? `pill-${tone}` : ''}`}>{children}</span>;
}

// ── Stat tile ─────────────────────────────────────────────────
export function Stat({ label, value, tone }) {
  return (
    <div className="tile" style={{
      flex: '0 0 auto', minWidth: 104, padding: '10px 12px',
      background: tone === 'clay' ? 'var(--clay-soft)' :
                  tone === 'ok'   ? 'var(--ok-soft)' :
                  tone === 'warn' ? 'var(--warn-soft)' : 'var(--surface)',
      borderColor: tone ? 'transparent' : 'var(--line)',
    }}>
      <div style={{ fontSize: 10.5, color: tone === 'clay' ? 'var(--clay-ink)' : tone === 'ok' ? '#3f5728' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
      <div className="serif" style={{ fontSize: 24, lineHeight: 1.15, marginTop: 4, letterSpacing: '-0.02em', color: tone === 'clay' ? 'var(--clay-ink)' : tone === 'ok' ? '#3f5728' : 'var(--ink)' }}>{value}</div>
    </div>
  );
}

// ── Stage dots ────────────────────────────────────────────────
export function StageDots({ stages = [], current = 0 }) {
  return (
    <div className="stage-dots">
      {stages.map((_, i) => (
        <div key={i} className={`d ${i < current ? 'done' : i === current ? 'curr' : ''}`} />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 32px', textAlign: 'center', gap: 12 }}>
      {icon && <div style={{ fontSize: 40, opacity: 0.3, marginBottom: 4 }}>{icon}</div>}
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '-0.01em' }}>{title}</div>
      {body && <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 260 }}>{body}</div>}
      {action}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div className="col gap-6">
      {label && <label className="t-xs muted" style={{ marginLeft: 2 }}>{label}</label>}
      {children}
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginLeft: 2 }}>{error}</div>}
    </div>
  );
}

// ── Modal sheet ───────────────────────────────────────────────
export function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,22,18,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'var(--surface)', borderRadius: '20px 20px 0 0', padding: '20px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--clay)" strokeWidth="2.5" strokeLinecap="round">
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          style={{ animation: 'spin 1s linear infinite', transformOrigin: '12px 12px' }} />
      </svg>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
export function Toast({ message, onDismiss }) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [message]);

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--bg)',
      padding: '10px 18px', borderRadius: 12, fontSize: 13.5,
      fontWeight: 500, zIndex: 500, boxShadow: 'var(--shadow-2)',
      maxWidth: 320, textAlign: 'center',
    }}>
      {message}
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--warn-soft)', color: '#6b4d12',
      padding: '10px 14px', borderRadius: 10, fontSize: 13,
    }}>
      <div style={{ flex: 1 }}>{message}</div>
      {onDismiss && <button onClick={onDismiss} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0 }}><Icon name="x" size={16} /></button>}
    </div>
  );
}

// ── Nav back header ───────────────────────────────────────────
export function NavBack({ title, onBack, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 8, borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
      <button className="btn-icon" onClick={onBack}><Icon name="chev-l" size={20} /></button>
      <div style={{ flex: 1, fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{title}</div>
      {right}
    </div>
  );
}

// ── Tab bar ───────────────────────────────────────────────────
export function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tabbar">
      {tabs.map(t => (
        <button key={t.id} className={`tab ${active === t.id ? 'on' : ''}`} onClick={() => onChange(t.id)}>
          <span className="ic"><Icon name={t.icon} size={22} /></span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Case stage progress bar ───────────────────────────────────
export function StageBar({ stages, current }) {
  if (!stages?.length) return null;
  const pct = stages.length <= 1 ? 100 : Math.round((current / (stages.length - 1)) * 100);
  return (
    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)' }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
          {stages[current] || 'Stage'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          {current + 1} / {stages.length}
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--line-2)', borderRadius: 999 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--clay)', borderRadius: 999, transition: 'width 0.3s ease' }} />
      </div>
      <div className="row" style={{ marginTop: 6, gap: 0, justifyContent: 'space-between' }}>
        {stages.map((s, i) => (
          <div key={i} style={{
            fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: i < current ? 'var(--ok)' : i === current ? 'var(--clay-ink)' : 'var(--muted-2)',
          }}>{s}</div>
        ))}
      </div>
    </div>
  );
}

// ── Case card (shared between dentist + tech list views) ──────
export function CaseCard({ c, onClick, role }) {
  const svc = c.service;
  const stages = svc?.stages || [];
  const isReady = stages.length > 0 && c.stage >= stages.length - 1;
  const partner = role === 'dentist' ? c.lab?.name : c.dentist?.full_name;

  return (
    <div className="card row-tap" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{c.id}</span>
        <div className="row gap-6">
          {c.payment_status !== 'pending' && (
            <Pill tone={c.payment_status === 'confirmed' ? 'ok' : 'warn'}>
              {c.payment_status === 'confirmed' ? 'Paid' : 'Payment rcvd'}
            </Pill>
          )}
          {isReady && <Pill tone="ok">Ready</Pill>}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: '-0.01em', marginBottom: 2 }}>
        {svc?.title || 'Service'}
      </div>
      <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{partner}</div>
      {stages.length > 0 && <StageDots stages={stages} current={c.stage} />}
    </div>
  );
}

// ── Rating stars ──────────────────────────────────────────────
export function Stars({ value = 0 }) {
  return (
    <div className="row gap-2">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={12} height={12} viewBox="0 0 24 24" fill={i <= Math.round(value) ? 'var(--clay)' : 'var(--line-2)'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 3 }}>{value?.toFixed(1)}</span>
    </div>
  );
}
