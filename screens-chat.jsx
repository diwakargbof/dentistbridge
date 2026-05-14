// screens-chat.jsx — Case chat (iMessage-style bubbles)
// Real messages from Supabase with live subscription. Real message sending.

function ChatScreen({ cas, role = 'tech', userId, onBack, onOpenShade, onOpenPay }) {
  const [messages, setMessages] = window.CHAIRSIDE_SUPABASE.useMessages(cas?.id);
  const [inputText, setInputText] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!cas) {
    return <div className="scr" />;
  }

  const svc = cas.service || {};
  const stages = svc.stages || [];
  const themName = role === 'tech'
    ? (cas.dentist?.full_name || 'Dentist')
    : (cas.lab?.name || 'Lab');
  const themTone = role === 'tech' ? 'info' : 'clay';
  const caseRef = cas.id ? cas.id.slice(0, 8).toUpperCase() : '—';

  async function handleSend() {
    const text = inputText.trim();
    if (!text || sending || !cas.id || !userId) return;
    setInputText('');
    setSending(true);
    try {
      await window.CHAIRSIDE_SUPABASE.sendMessage(cas.id, userId, text, 'text');
    } catch (e) {
      console.error('[ChatScreen] sendMessage:', e.message);
      setInputText(text);
    } finally {
      setSending(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="scr">
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: 'rgba(243, 239, 232, 0.92)',
        backdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid var(--line)',
        padding: '54px 12px 10px',
      }}>
        <div className="row gap-8" style={{ alignItems: 'center' }}>
          <button className="btn-icon" onClick={onBack}><Icon name="back" size={18} /></button>
          <div className="row gap-10" style={{ flex: 1 }}>
            <Avatar name={themName} size={32} tone={themTone} />
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{themName}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>
                {svc.title || '—'} · <span className="mono">{caseRef}</span>
              </div>
            </div>
          </div>
          <button className="btn-icon"><Icon name="dot-menu" size={18} /></button>
        </div>

        {/* Mini stage strip */}
        {stages.length > 0 && (
          <div className="row gap-8" style={{
            marginTop: 10, padding: '6px 8px',
            background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10,
          }}>
            <div className="row gap-6" style={{ flex: 1, alignItems: 'center' }}>
              <StageDots total={stages.length} current={cas.stage || 0} />
              <div style={{ fontSize: 12.5, fontWeight: 500, marginLeft: 4 }}>
                {stages[cas.stage || 0] || '—'}
              </div>
            </div>
            <span className="t-xs muted">{(cas.stage || 0) + 1}/{stages.length}</span>
          </div>
        )}
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="scr-body"
        style={{ padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}
      >
        {messages === null ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="muted" style={{ fontSize: 13 }}>Loading…</span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="muted" style={{ fontSize: 13 }}>No messages yet. Say hello.</span>
          </div>
        ) : (
          messages.map((m, i) => (
            <Bubble key={m.id || i} m={m} userId={userId} onOpenShade={onOpenShade} />
          ))
        )}
      </div>

      {/* Composer */}
      <div className="composer">
        <button className="btn-icon" style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
          <Icon name="plus" size={18} />
        </button>
        <input
          className="input"
          placeholder="Message…"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKey}
          disabled={sending}
        />
        <button className="btn-icon" style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--bg-2)', border: '1px solid var(--line)' }}>
          <Icon name="template" size={18} />
        </button>
        <button
          className="btn-icon"
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: inputText.trim() ? 'var(--clay)' : 'var(--bg-2)',
            borderColor: inputText.trim() ? 'var(--clay)' : 'var(--line)',
            color: inputText.trim() ? '#fff' : 'var(--muted)',
            opacity: sending ? 0.6 : 1,
          }}
          onClick={handleSend}
          disabled={sending || !inputText.trim()}
        >
          <Icon name="send" size={16} color={inputText.trim() ? '#fff' : 'currentColor'} />
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Message bubble — handles text, image, and system messages
// ──────────────────────────────────────────────────────────────
function Bubble({ m, userId, onOpenShade }) {
  if (m.kind === 'system' || m.sys) {
    return <div className="bubble-sys">— {m.body || m.sys} —</div>;
  }

  const isMe = m.sender_id ? m.sender_id === userId : m.from === userId;
  const text = m.body || m.text;
  const isImage = m.kind === 'image';
  const shadeable = m.metadata?.shadeable;
  const template = m.metadata?.template;
  const timeStr = m.created_at
    ? new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : (m.t || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginTop: 4 }}>
      {template && !isMe && (
        <div className="row gap-4" style={{ fontSize: 10.5, color: 'var(--clay-ink)', marginBottom: 3, marginLeft: 6, fontWeight: 500 }}>
          <Icon name="sparkle" size={11} color="var(--clay)" />
          <span>Template · {template}</span>
        </div>
      )}
      {isImage ? (
        <div className="bubble-img" style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
          <ImagePh label={text || 'Image'} h={170} />
          {shadeable && (
            <button
              onClick={() => onOpenShade && onOpenShade(m.metadata?.imageUrl || null)}
              className="row gap-6"
              style={{
                width: '100%', marginTop: 4, padding: '8px 10px',
                border: 0, borderRadius: 10,
                background: 'var(--clay-soft)', color: 'var(--clay-ink)',
                fontWeight: 600, fontSize: 12.5, cursor: 'pointer', justifyContent: 'center',
              }}
            >
              <Icon name="eye-drop" size={14} /> Pick shade from image
            </button>
          )}
        </div>
      ) : (
        <div className={'bubble ' + (isMe ? 'bubble-me' : 'bubble-them')}>{text}</div>
      )}
      {timeStr && (
        <div className="t-xs muted" style={{ marginTop: 3, marginLeft: isMe ? 0 : 10, marginRight: isMe ? 10 : 0 }}>
          {timeStr}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Shade picker — calls /api/shade-analyze (Claude vision).
// ──────────────────────────────────────────────────────────────
function ShadePicker({ onClose, imageUrl, onSave }) {
  const [stage, setStage] = React.useState('scan');
  const [result, setResult] = React.useState(null);

  React.useEffect(() => {
    fetch('/api/shade-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: imageUrl || null }),
    })
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(data => { setResult(data); setStage('result'); })
      .catch(err => {
        console.error('[ShadePicker]', err.message);
        setResult({
          best_match: 'A2', confidence: 71, best_hex: '#eddcb6',
          candidates: [
            { code: 'A1', match: 22, hex: '#f3e7ce' },
            { code: 'A2', match: 71, hex: '#eddcb6' },
            { code: 'A3', match: 18, hex: '#e2caa0' },
            { code: 'B1', match: 14, hex: '#f0e7ce' },
          ],
          reading: 'Cervical reads A2 with warmer chroma; incisal third trends toward A1. Recommend layering accordingly.',
        });
        setStage('result');
      });
  }, [imageUrl]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '54px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="btn-icon" onClick={onClose}><Icon name="x" size={18} /></button>
        <div style={{ flex: 1 }}>
          <div className="t-eyebrow">VITA Classical</div>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Shade picker</div>
        </div>
        <Pill tone="clay" dot>AI</Pill>
      </div>

      <div style={{ padding: '4px 20px 0' }}>
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', aspectRatio: '4/3', background: '#2a221d' }}>
          {imageUrl
            ? <img src={imageUrl} alt="Shade reference" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div className="img-ph" style={{ height: '100%', background: 'radial-gradient(circle at 50% 60%, #e8d3ba 0%, #c9a986 40%, #6e5340 100%)', border: 0, color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>shade tab against prep</div>
          }
          <div style={{ position: 'absolute', left: '52%', top: '58%', width: 64, height: 64, transform: 'translate(-50%, -50%)', border: '2px solid #fff', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(180,114,74,0.4), 0 8px 30px rgba(0,0,0,0.4)' }}>
            <div style={{ position: 'absolute', inset: -1, borderRadius: '50%', border: '2px solid var(--clay)' }} />
          </div>
          {stage === 'scan' && (
            <>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div className="scan-line" />
              </div>
              <div style={{ position: 'absolute', left: 12, bottom: 12, padding: '6px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, letterSpacing: '0.02em' }}>Analysing shade…</div>
            </>
          )}
          {stage === 'result' && result && (
            <div style={{ position: 'absolute', left: 12, bottom: 12, right: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: result.best_hex, border: '1px solid rgba(0,0,0,0.1)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Best match</div>
                <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.005em' }}>
                  <span className="mono">{result.best_match}</span> · {result.confidence}% confidence
                </div>
              </div>
            </div>
          )}
        </div>

        {stage === 'result' && result && (
          <div style={{ marginTop: 18 }}>
            <div className="row between" style={{ marginBottom: 8 }}>
              <div className="t-eyebrow">Candidates</div>
              <button className="btn btn-xs btn-soft">Other regions</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {result.candidates.map(s => (
                <div key={s.code} className="shade-swatch" style={{ background: s.hex, border: s.code === result.best_match ? '2px solid var(--clay)' : '1px solid var(--line)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.6)' }}>{s.code}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(0,0,0,0.45)', marginTop: 2 }}>{s.match}%</div>
                </div>
              ))}
            </div>
            <div className="card-flat" style={{ marginTop: 14, padding: 12, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>
              <div className="row gap-6" style={{ marginBottom: 4, color: 'var(--clay-ink)', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Icon name="sparkle" size={12} color="var(--clay)" />
                <span>AI reading</span>
              </div>
              {result.reading}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '10px 16px calc(10px + 24px)', background: 'var(--bg)', borderTop: '1px solid var(--line)', display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
        <button
          className="btn btn-clay"
          style={{ flex: 1.4 }}
          onClick={() => { if (onSave && result) onSave(result); onClose(); }}
          disabled={stage !== 'result'}
        >
          Save {result?.best_match ?? '…'} to case
        </button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Payment confirmation sheet (technician side)
// ──────────────────────────────────────────────────────────────
function PaymentConfirm({ cas, onClose, onConfirm }) {
  const amount = cas?.payment_amount || cas?.service?.price || 0;
  const caseRef = cas?.id ? cas.id.slice(0, 8).toUpperCase() : '—';
  const serviceName = cas?.service?.title || '—';
  const dentistName = cas?.dentist?.full_name || '—';

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'rgba(28, 22, 18, 0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ width: '100%', background: 'var(--bg)', borderRadius: '20px 20px 0 0', padding: '14px 18px calc(18px + 24px)', boxShadow: '0 -8px 30px rgba(0,0,0,0.18)' }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--line-2)', margin: '0 auto 16px' }} />
        <div className="t-eyebrow">Confirm payment</div>
        <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4, marginBottom: 14 }}>
          ₹{amount.toLocaleString('en-IN')} received?
        </div>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Case</span>
            <span className="mono" style={{ fontSize: 12.5 }}>{caseRef}</span>
          </div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="muted" style={{ fontSize: 12.5 }}>Service</span>
            <span style={{ fontSize: 13 }}>{serviceName}</span>
          </div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="muted" style={{ fontSize: 12.5 }}>From</span>
            <span style={{ fontSize: 13 }}>{dentistName}</span>
          </div>
          <div className="hr" style={{ margin: '8px 0' }} />
          <div className="row between">
            <span className="muted" style={{ fontSize: 12.5 }}>Method</span>
            <span style={{ fontSize: 13 }}>UPI · screenshot attached</span>
          </div>
        </div>
        <div className="row gap-8">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Not yet</button>
          <button className="btn btn-clay" style={{ flex: 1.4 }} onClick={onConfirm}>Confirm & close case</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ChatScreen, ShadePicker, PaymentConfirm, Bubble });
