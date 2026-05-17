// ui.jsx — icons + primitives

const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.7 }) => {
  const s = { width: size, height: size, color, flexShrink: 0 };
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (children) => (<svg viewBox="0 0 24 24" style={s} aria-hidden="true">{children}</svg>);
  switch (name) {
    case 'home':         return svg(<><path {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></>);
    case 'cases':        return svg(<><rect {...p} x="3" y="5" width="18" height="14" rx="2"/><path {...p} d="M3 9h18M9 5V3.5h6V5"/></>);
    case 'scan':         return svg(<><path {...p} d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M11 8v8M15 8v8"/></>);
    case 'barcode':      return svg(<><path {...p} d="M4 6v12M7 6v12M9 6v12M12 6v12M15 6v12M17 6v12M20 6v12"/></>);
    case 'inbox':        return svg(<><path {...p} d="M3 14V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 14l3-4h12l3 4M3 14v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M9 14a3 3 0 0 0 6 0"/></>);
    case 'workflow':     return svg(<><circle {...p} cx="5" cy="6" r="2"/><circle {...p} cx="5" cy="18" r="2"/><circle {...p} cx="19" cy="12" r="2"/><path {...p} d="M7 6h6a4 4 0 0 1 4 4v0M7 18h6a4 4 0 0 0 4-4v0"/></>);
    case 'kanban':       return svg(<><rect {...p} x="3" y="4" width="5" height="16" rx="1"/><rect {...p} x="10" y="4" width="5" height="11" rx="1"/><rect {...p} x="17" y="4" width="4" height="8" rx="1"/></>);
    case 'list':         return svg(<><path {...p} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>);
    case 'chart':        return svg(<><path {...p} d="M3 3v18h18M7 16V11M12 16V8M17 16v-3"/></>);
    case 'settings':     return svg(<><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>);
    case 'bell':         return svg(<><path {...p} d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7z"/><path {...p} d="M10 21a2 2 0 0 0 4 0"/></>);
    case 'check':        return svg(<><path {...p} d="m5 12 5 5L20 7"/></>);
    case 'check-circle': return svg(<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="m8 12 3 3 5-6"/></>);
    case 'plus':         return svg(<><path {...p} d="M12 5v14M5 12h14"/></>);
    case 'plus-circle':  return svg(<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 8v8M8 12h8"/></>);
    case 'chev-r':       return svg(<><path {...p} d="m9 6 6 6-6 6"/></>);
    case 'chev-l':       return svg(<><path {...p} d="m15 6-6 6 6 6"/></>);
    case 'chev-d':       return svg(<><path {...p} d="m6 9 6 6 6-6"/></>);
    case 'chev-u':       return svg(<><path {...p} d="m6 15 6-6 6 6"/></>);
    case 'arrow-r':      return svg(<><path {...p} d="M4 12h16M14 6l6 6-6 6"/></>);
    case 'arrow-l':      return svg(<><path {...p} d="M20 12H4M10 6l-6 6 6 6"/></>);
    case 'arrow-up':     return svg(<><path {...p} d="M12 20V4M5 11l7-7 7 7"/></>);
    case 'back':         return svg(<><path {...p} d="M20 12H4M10 6l-6 6 6 6"/></>);
    case 'x':            return svg(<><path {...p} d="M6 6l12 12M18 6 6 18"/></>);
    case 'edit':         return svg(<><path {...p} d="M4 20h4l11-11-4-4L4 16v4z"/></>);
    case 'print':        return svg(<><path {...p} d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M6 13h12v8H6z"/></>);
    case 'pdf':          return svg(<><path {...p} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path {...p} d="M14 2v6h6"/></>);
    case 'warning':      return svg(<><path {...p} d="M12 3 2 21h20zM12 10v4M12 17h.01"/></>);
    case 'flame':        return svg(<><path {...p} d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 2 3 4 3 4z"/></>);
    case 'clock':        return svg(<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 7v5l3 2"/></>);
    case 'calendar':     return svg(<><rect {...p} x="3" y="5" width="18" height="16" rx="2"/><path {...p} d="M16 3v4M8 3v4M3 11h18"/></>);
    case 'user':         return svg(<><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>);
    case 'users':        return svg(<><circle {...p} cx="9" cy="8" r="4"/><path {...p} d="M2 21c1-4 4-6 7-6s6 2 7 6"/><path {...p} d="M16 4a4 4 0 0 1 0 8M22 21c-.5-3-2-5-5-6"/></>);
    case 'phone':        return svg(<><path {...p} d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></>);
    case 'logout':       return svg(<><path {...p} d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path {...p} d="M10 17l-5-5 5-5M5 12h12"/></>);
    case 'dot-menu':     return svg(<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>);
    case 'tooth':        return svg(<><path {...p} d="M7 3c2.5 0 2.5 1.5 5 1.5S14.5 3 17 3c2 0 3 1.5 3 4 0 3-1.5 4-2 7s-1 7-2.5 7c-1 0-1.2-2.5-1.7-4S13 16 12 16s-1.3 1.5-1.8 2.5S9.5 21 8.5 21c-1.5 0-2-4-2.5-7s-2-4-2-7c0-2.5 1-4 3-4z"/></>);
    case 'shield':       return svg(<><path {...p} d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path {...p} d="m9 12 2 2 4-4"/></>);
    case 'truck':        return svg(<><path {...p} d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle {...p} cx="7" cy="18" r="1.7"/><circle {...p} cx="17" cy="18" r="1.7"/></>);
    case 'pause':        return svg(<><rect x="6" y="5" width="3.5" height="14" rx="1" fill="currentColor"/><rect x="14.5" y="5" width="3.5" height="14" rx="1" fill="currentColor"/></>);
    case 'skip-forward': return svg(<><path {...p} d="M5 4l10 8-10 8z"/><path {...p} d="M19 5v14"/></>);
    case 'rotate':       return svg(<><path {...p} d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></>);
    case 'search':       return svg(<><circle {...p} cx="11" cy="11" r="7"/><path {...p} d="m20 20-3.5-3.5"/></>);
    case 'filter':       return svg(<><path {...p} d="M4 5h16l-6 8v6l-4-2v-4z"/></>);
    case 'history':      return svg(<><path {...p} d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path {...p} d="M3 3v5h5M12 7v5l4 2"/></>);
    case 'sparkle':      return svg(<><path {...p} d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>);
    case 'building':     return svg(<><rect {...p} x="4" y="3" width="16" height="18" rx="1"/><path {...p} d="M9 7h.01M9 11h.01M9 15h.01M15 7h.01M15 11h.01M15 15h.01M10 21v-3a2 2 0 0 1 4 0v3"/></>);
    case 'wand':         return svg(<><path {...p} d="m4 20 14-14M14 6l4 4M19 13l1 1M5 11l1 1M16 3l1 1"/></>);
    default:             return svg(<><circle {...p} cx="12" cy="12" r="9"/></>);
  }
};

const Avatar = ({ name, size = 40, tone }) => {
  const cls = `av av-${size}` + (tone ? ` av-${tone}` : '');
  const initials = (name || '?').replace(/^Dr\.\s*/i, '').trim()
    .split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return <div className={cls} aria-label={name}>{initials}</div>;
};

const Pill = ({ tone = '', children, dot }) => (
  <span className={'pill ' + (tone ? `pill-${tone}` : '')}>
    {dot && <span className="dot" />}
    {children}
  </span>
);

const Urgency = ({ id, sel }) => {
  const u = (sel || window.__sel_singleton).urgency(id);
  if (!u) return null;
  return (
    <span className={'urg urg-' + u.tone}>
      <span className="dot" />{u.name}
    </span>
  );
};

const StageStrip = ({ stages, currentIdx }) => (
  <div className="stage-strip">
    {stages.map((s, i) => (
      <div key={s.id} className={'s ' + (i < currentIdx ? 'done' : i === currentIdx ? 'curr' : '')} />
    ))}
  </div>
);

function relTime(t) {
  const diff = Date.now() - t;
  if (diff < 60_000) return 'just now';
  if (diff < 60 * 60_000) return Math.floor(diff / 60_000) + 'm';
  if (diff < 24 * 60 * 60_000) return Math.floor(diff / (60 * 60_000)) + 'h';
  if (diff < 7 * 24 * 60 * 60_000) return Math.floor(diff / (24 * 60 * 60_000)) + 'd';
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function formatTime(t) {
  return new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}
function formatDate(t) {
  if (!t) return '—';
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateShort(t) {
  if (!t) return '—';
  return new Date(t).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// Logo
function Logo({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 7,
      background: 'var(--ink)', color: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Newsreader, serif', fontSize: size * 0.62, fontWeight: 500,
      letterSpacing: '-0.02em',
    }}>B</div>
  );
}

function Empty({ icon = 'inbox', title, sub, cta, onCta }) {
  return (
    <div className="empty">
      <Icon name={icon} size={32} color="var(--muted-2)" />
      <div className="serif" style={{ marginTop: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5 }}>{sub}</div>
      {cta && <button className="btn btn-clay btn-sm" style={{ marginTop: 14 }} onClick={onCta}>{cta}</button>}
    </div>
  );
}

Object.assign(window, { Icon, Avatar, Pill, Urgency, StageStrip, relTime, formatTime, formatDate, formatDateShort, Logo, Empty });
