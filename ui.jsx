// ui.jsx — shared UI primitives & inline icons for Chairside

// ─── Icons (24×24 stroke) ───────────────────────────────────
const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.7 }) => {
  const s = { width: size, height: size, color, flexShrink: 0 };
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svg = (children) => (
    <svg viewBox="0 0 24 24" style={s} aria-hidden="true">{children}</svg>
  );
  switch (name) {
    case 'home':       return svg(<><path {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></>);
    case 'cases':      return svg(<><rect {...p} x="3" y="5" width="18" height="14" rx="2"/><path {...p} d="M3 9h18M9 5V3.5h6V5"/></>);
    case 'catalog':    return svg(<><path {...p} d="M4 5h16M4 12h16M4 19h10"/></>);
    case 'message':    return svg(<><path {...p} d="M21 12a8 8 0 1 1-3.4-6.55L21 5l-1.1 3.5A8 8 0 0 1 21 12z"/></>);
    case 'profile':    return svg(<><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></>);
    case 'search':     return svg(<><circle {...p} cx="11" cy="11" r="7"/><path {...p} d="m20 20-3.5-3.5"/></>);
    case 'plus':       return svg(<><path {...p} d="M12 5v14M5 12h14"/></>);
    case 'plus-circle':return svg(<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 8v8M8 12h8"/></>);
    case 'chev-r':     return svg(<><path {...p} d="m9 6 6 6-6 6"/></>);
    case 'chev-l':     return svg(<><path {...p} d="m15 6-6 6 6 6"/></>);
    case 'chev-d':     return svg(<><path {...p} d="m6 9 6 6 6-6"/></>);
    case 'bell':       return svg(<><path {...p} d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7z"/><path {...p} d="M10 21a2 2 0 0 0 4 0"/></>);
    case 'camera':     return svg(<><path {...p} d="M3 7h4l2-3h6l2 3h4v12H3z"/><circle {...p} cx="12" cy="13" r="4"/></>);
    case 'paperclip':  return svg(<><path {...p} d="m21 12-8.5 8.5a5 5 0 0 1-7-7L14 4.5a3.5 3.5 0 1 1 5 5L10.5 18a2 2 0 1 1-3-3L15 8"/></>);
    case 'send':       return svg(<><path {...p} d="M4 12 21 4l-8 17-2-7z"/></>);
    case 'check':      return svg(<><path {...p} d="m5 12 5 5L20 7"/></>);
    case 'check-circle': return svg(<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="m8 12 3 3 5-6"/></>);
    case 'dot-menu':   return svg(<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>);
    case 'archive':    return svg(<><rect {...p} x="3" y="4" width="18" height="4" rx="1"/><path {...p} d="M5 8v11h14V8M10 12h4"/></>);
    case 'pin':        return svg(<><path {...p} d="m16 4 4 4-5 1-4 4 1 5-3 3-4-4 3-3-1-4 4-4 1-2z"/></>);
    case 'image':      return svg(<><rect {...p} x="3" y="4" width="18" height="16" rx="2"/><circle {...p} cx="9" cy="10" r="2"/><path {...p} d="m4 18 5-5 4 4 3-3 4 4"/></>);
    case 'eye-drop':   return svg(<><path {...p} d="m16 3 5 5-3 3-2-2-7 7H4v-5l7-7-2-2 3-3z"/></>);
    case 'tooth':      return svg(<><path {...p} d="M7 3c2.5 0 2.5 1.5 5 1.5S14.5 3 17 3c2 0 3 1.5 3 4 0 3-1.5 4-2 7s-1 7-2.5 7c-1 0-1.2-2.5-1.7-4S13 16 12 16s-1.3 1.5-1.8 2.5S9.5 21 8.5 21c-1.5 0-2-4-2.5-7s-2-4-2-7c0-2.5 1-4 3-4z"/></>);
    case 'sparkle':    return svg(<><path {...p} d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></>);
    case 'wallet':     return svg(<><rect {...p} x="3" y="6" width="18" height="13" rx="2"/><path {...p} d="M3 10h18M17 14h1"/></>);
    case 'filter':     return svg(<><path {...p} d="M4 5h16l-6 8v6l-4-2v-4z"/></>);
    case 'back':       return svg(<><path {...p} d="M20 12H4M10 6l-6 6 6 6"/></>);
    case 'flag':       return svg(<><path {...p} d="M5 21V4h11l-2 4 2 4H5"/></>);
    case 'arrow-up':   return svg(<><path {...p} d="M12 20V4M5 11l7-7 7 7"/></>);
    case 'arrow-r':    return svg(<><path {...p} d="M4 12h16M14 6l6 6-6 6"/></>);
    case 'edit':       return svg(<><path {...p} d="M4 20h4l11-11-4-4L4 16v4z"/></>);
    case 'template':   return svg(<><rect {...p} x="3" y="3" width="18" height="18" rx="2"/><path {...p} d="M3 9h18M9 21V9"/></>);
    case 'workflow':   return svg(<><circle {...p} cx="5" cy="6" r="2"/><circle {...p} cx="5" cy="18" r="2"/><circle {...p} cx="19" cy="12" r="2"/><path {...p} d="M7 6h6a4 4 0 0 1 4 4v0M7 18h6a4 4 0 0 0 4-4v0"/></>);
    case 'lab':        return svg(<><path {...p} d="M9 3h6v6l5 9a3 3 0 0 1-3 4H7a3 3 0 0 1-3-4l5-9z"/><path {...p} d="M7.5 14h9"/></>);
    case 'star':       return svg(<><path {...p} d="m12 3 2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.8z" fill="currentColor" stroke="none"/></>);
    case 'clock':      return svg(<><circle {...p} cx="12" cy="12" r="9"/><path {...p} d="M12 7v5l3 2"/></>);
    case 'truck':      return svg(<><path {...p} d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle {...p} cx="7" cy="18" r="1.7"/><circle {...p} cx="17" cy="18" r="1.7"/></>);
    case 'x':          return svg(<><path {...p} d="M6 6l12 12M18 6 6 18"/></>);
    case 'switch':     return svg(<><path {...p} d="M4 7h12l-3-3M20 17H8l3 3"/></>);
    default:           return svg(<><circle {...p} cx="12" cy="12" r="9"/></>);
  }
};

const Avatar = ({ name, size = 40, tone, src }) => {
  const cls = `av av-${size}` + (tone ? ` av-${tone}` : '');
  const initials = (name || '?')
    .replace('Dr.', '').trim()
    .split(/\s+/).slice(0, 2).map(s => s[0]).join('').toUpperCase();
  return <div className={cls} aria-label={name}>{initials}</div>;
};

const ImagePh = ({ label, h = 140, style }) => (
  <div className="img-ph" style={{ height: h, width: '100%', ...style }}>{label || 'image'}</div>
);

const StageDots = ({ total, current }) => (
  <div className="stage-dots" aria-label={`stage ${current + 1} of ${total}`}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={'d ' + (i < current ? 'done' : i === current ? 'curr' : '')} />
    ))}
  </div>
);

const Pill = ({ tone = '', children, dot }) => (
  <span className={'pill ' + (tone ? `pill-${tone}` : '')}>
    {dot && <span className="dot" />}
    {children}
  </span>
);

// Tabbar component (mobile bottom nav)
const Tabbar = ({ tabs, active, onChange }) => (
  <div className="tabbar">
    {tabs.map(t => (
      <button key={t.id} className={'tab ' + (active === t.id ? 'on' : '')} onClick={() => onChange(t.id)}>
        <div className="ic"><Icon name={t.icon} size={22} /></div>
        <div>{t.label}</div>
      </button>
    ))}
  </div>
);

// Header bar with title + action button
const ScreenHeader = ({ title, sub, action, back, onBack }) => (
  <div className="app-hd">
    <div style={{ minWidth: 0, flex: 1 }}>
      {back && (
        <button className="btn-icon" onClick={onBack} style={{ marginBottom: 8 }}>
          <Icon name="back" size={18} />
        </button>
      )}
      <div className="title">{title}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
    {action}
  </div>
);

Object.assign(window, { Icon, Avatar, ImagePh, StageDots, Pill, Tabbar, ScreenHeader });
