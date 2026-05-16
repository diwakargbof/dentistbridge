import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { subscribeToMessages } from '../../lib/realtime.js';
import { Icon, Avatar, Spinner, NavBack, StageBar, Sheet, Button, ErrorBanner, Pill } from '../ui/index.jsx';

// ── Shade analysis result ─────────────────────────────────────
function ShadeResult({ result, onClose }) {
  if (!result) return null;
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 16, border: '1px solid var(--line)', marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="t-eyebrow">Shade Analysis</div>
        <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }}>
          <Icon name="x" size={16} color="var(--muted)" />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: result.best_hex, border: '1.5px solid var(--line)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{result.best_match}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{result.confidence}% confidence{result._demo ? ' · demo' : ''}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {(result.candidates || []).map(c => (
          <div key={c.code} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface-2)', borderRadius: 8, padding: '5px 10px',
            border: c.code === result.best_match ? '1.5px solid var(--clay)' : '1px solid var(--line)',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: c.hex }} />
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.code}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{c.match}%</span>
          </div>
        ))}
      </div>
      {result.reading && (
        <div style={{ fontSize: 13, color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.5, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          {result.reading}
        </div>
      )}
    </div>
  );
}

// ── Individual message bubble ─────────────────────────────────
function Bubble({ msg, isMe, onAnalyzeShade }) {
  const [shadeResult, setShadeResult] = useState(msg.metadata?.shade_result || null);
  const [analyzing, setAnalyzing]     = useState(false);

  if (msg.kind === 'system') {
    return (
      <div style={{ alignSelf: 'center', fontSize: 12, color: 'var(--muted)', padding: '4px 12px', background: 'var(--surface-2)', borderRadius: 999, margin: '4px 0' }}>
        {msg.body}
      </div>
    );
  }

  if (msg.kind === 'payment') {
    return (
      <div style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
        <div style={{ background: isMe ? 'var(--ink)' : 'var(--surface)', border: isMe ? 'none' : '1px solid var(--line)', borderRadius: 16, padding: '12px 14px', borderBottomRightRadius: isMe ? 4 : 16, borderBottomLeftRadius: isMe ? 16 : 4 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <Icon name="check-c" size={16} color={isMe ? 'var(--bg)' : 'var(--ok)'} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: isMe ? 'var(--bg)' : 'var(--ink)' }}>Payment Screenshot</span>
          </div>
          {msg.metadata?.url && (
            <img src={msg.metadata.url} alt="payment" style={{ width: '100%', borderRadius: 10, marginBottom: 6 }} />
          )}
          {msg.body && <div style={{ fontSize: 13, color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--muted)' }}>{msg.body}</div>}
        </div>
      </div>
    );
  }

  const isImage = msg.kind === 'image';
  const hasImage = isImage && msg.metadata?.url;

  async function handleAnalyze() {
    if (!msg.metadata?.url) return;
    setAnalyzing(true);
    try {
      const result = await api.shade.analyze({ imageUrl: msg.metadata.url });
      setShadeResult(result);
    } catch { }
    finally { setAnalyzing(false); }
  }

  return (
    <div style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {!isMe && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>{msg.sender?.full_name?.split(' ')[0]}</div>
      )}
      {hasImage ? (
        <div className="bubble-img" style={{ alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
          <img src={msg.metadata.url} alt={msg.body || 'attachment'} style={{ borderRadius: 14, maxWidth: '100%' }} />
          {!shadeResult && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, margin: '6px 4px 4px',
                background: 'var(--clay-soft)', border: '1px solid var(--clay-line)',
                borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                color: 'var(--clay-ink)',
              }}
            >
              <Icon name="eye" size={13} color="var(--clay-ink)" />
              {analyzing ? 'Analyzing…' : 'Extract shade'}
            </button>
          )}
          {shadeResult && <ShadeResult result={shadeResult} onClose={() => setShadeResult(null)} />}
        </div>
      ) : (
        <div className={`bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
          {msg.body}
        </div>
      )}
      <div style={{ fontSize: 10.5, color: 'var(--muted-2)', alignSelf: isMe ? 'flex-end' : 'flex-start', marginTop: -2 }}>
        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}

// ── Payment upload sheet ─────────────────────────────────────
function PaymentSheet({ caseId, open, onClose, onSent }) {
  const [file, setFile]       = useState(null);
  const [note, setNote]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSend() {
    if (!file) { setError('Please choose a file'); return; }
    setLoading(true);
    setError('');
    try {
      const uploaded = await api.upload.file(caseId, file, 'payment');
      await api.messages.send(caseId, {
        body: note.trim() || 'Payment screenshot attached.',
        kind: 'payment',
        metadata: { url: uploaded.url, attachment_id: uploaded.id },
      });
      onSent();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Upload payment proof">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Upload a screenshot of your bank transfer, UPI, or cheque. The lab will confirm once verified.
        </div>
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          border: '2px dashed var(--line-2)', borderRadius: 12, padding: '20px 16px',
          cursor: 'pointer', color: 'var(--muted)',
        }}>
          <Icon name="image" size={28} color="var(--muted)" />
          <span style={{ fontSize: 13.5 }}>{file ? file.name : 'Tap to choose image'}</span>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
        </label>
        <div>
          <label className="t-xs muted" style={{ marginLeft: 2, display: 'block', marginBottom: 6 }}>Note (optional)</label>
          <input className="field" placeholder="e.g. UPI transfer done, ref #12345" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <Button variant="clay" block onClick={handleSend} disabled={loading || !file}>
          {loading ? 'Sending…' : 'Send payment proof'}
        </Button>
      </div>
    </Sheet>
  );
}

// ── Stage advance sheet (for technician) ─────────────────────
function StageAdvanceSheet({ caseData, open, onClose, onAdvanced }) {
  const [template, setTemplate] = useState('');
  const [loading, setLoading]   = useState(false);
  const [templates, setTemplates] = useState(null);
  const stages    = caseData?.service?.stages || [];
  const nextStage = (caseData?.stage || 0) + 1;

  useEffect(() => {
    if (!open || !caseData?.service?.id) return;
    api.services.getTemplates(caseData.service.id)
      .then(d => {
        const t = (d || []).find(x => x.stage_index === nextStage);
        if (t) setTemplate(t.body);
        setTemplates(d || []);
      })
      .catch(() => {});
  }, [open, caseData?.service?.id, nextStage]);

  async function handleAdvance() {
    setLoading(true);
    try {
      await api.cases.updateStage(caseData.id, nextStage);
      if (template.trim()) {
        await api.messages.send(caseData.id, { body: template.trim(), kind: 'text' });
      }
      onAdvanced(nextStage);
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const nextStageName = stages[nextStage] || 'Complete';

  return (
    <Sheet open={open} onClose={onClose} title={`Move to "${nextStageName}"`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          This will update the case status. The dentist will be notified.
        </div>
        <div>
          <label className="t-xs muted" style={{ marginLeft: 2, display: 'block', marginBottom: 6 }}>
            Message to dentist {template ? '(from template)' : '(optional)'}
          </label>
          <textarea
            className="field"
            rows={3}
            placeholder={`Let them know the case has moved to "${nextStageName}"…`}
            value={template}
            onChange={e => setTemplate(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" block onClick={onClose}>Cancel</Button>
          <Button variant="clay" block onClick={handleAdvance} disabled={loading}>
            {loading ? 'Updating…' : `Move to ${nextStageName}`}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

// ── Main chat thread ──────────────────────────────────────────
export default function Chat({ initialCase, onBack, role }) {
  const { profile } = useAuth();
  const [caseData, setCaseData]     = useState(initialCase);
  const [messages, setMessages]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [text, setText]             = useState('');
  const [sending, setSending]       = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [imgFile, setImgFile]       = useState(null);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);

  useEffect(() => {
    Promise.all([
      api.cases.get(initialCase.id),
      api.messages.list(initialCase.id),
    ]).then(([c, m]) => {
      setCaseData(c);
      setMessages(m);
      setLoading(false);
    }).catch(() => setLoading(false));

    const unsub = subscribeToMessages(initialCase.id, (msg) => {
      setMessages(prev => prev ? [...prev, msg] : [msg]);
    });
    return unsub;
  }, [initialCase.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendText(e) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText('');
    try {
      const msg = await api.messages.send(caseData.id, { body, kind: 'text' });
      setMessages(prev => [...(prev || []), msg]);
    } catch { }
    finally { setSending(false); }
  }

  async function sendImage(file) {
    if (!file || sending) return;
    setSending(true);
    try {
      const uploaded = await api.upload.file(caseData.id, file, 'chat-image');
      const msg = await api.messages.send(caseData.id, {
        body: file.name,
        kind: 'image',
        metadata: { url: uploaded.url, attachment_id: uploaded.id },
      });
      setMessages(prev => [...(prev || []), msg]);
    } catch (err) { console.error(err); }
    finally { setSending(false); setImgFile(null); }
  }

  const stages       = caseData?.service?.stages || [];
  const currentStage = caseData?.stage || 0;
  const isLastStage  = stages.length > 0 && currentStage >= stages.length - 1;
  const isTech       = role === 'tech';
  const canAdvance   = isTech && !isLastStage;
  const canPay       = !isTech && !isLastStage;
  const waitingPay   = isTech && isLastStage && caseData?.payment_status === 'pending';

  async function handleConfirmPayment() {
    try {
      const updated = await api.cases.updatePayment(caseData.id, { payment_status: 'confirmed' });
      setCaseData(prev => ({ ...prev, ...updated }));
      await api.messages.send(caseData.id, { body: 'Payment confirmed. Case complete.', kind: 'system' });
      const m = await api.messages.list(caseData.id);
      setMessages(m);
    } catch (err) { console.error(err); }
  }

  async function handleArchive() {
    try {
      await api.cases.doArchive(caseData.id);
      onBack();
    } catch (err) { console.error(err); }
  }

  const partner = isTech
    ? caseData?.dentist?.full_name || 'Dentist'
    : caseData?.lab?.name || 'Lab';

  return (
    <div className="scr" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <NavBack title={partner} onBack={onBack} right={
        <div style={{ display: 'flex', gap: 6 }}>
          {waitingPay && (
            <button onClick={handleConfirmPayment} className="btn btn-xs" style={{ background: 'var(--ok)', border: 0, color: '#fff', height: 30 }}>
              <Icon name="check" size={13} />Confirm pay
            </button>
          )}
          {isLastStage && caseData?.payment_status === 'confirmed' && (
            <button onClick={handleArchive} className="btn btn-xs btn-soft">Archive</button>
          )}
        </div>
      } />

      {/* Case info + stage bar */}
      <div style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{ padding: '10px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{caseData?.service?.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {caseData?.id}
              {caseData?.patient_ref ? ` · ${caseData.patient_ref}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {caseData?.payment_status !== 'pending' && (
              <Pill tone={caseData?.payment_status === 'confirmed' ? 'ok' : 'warn'}>
                {caseData?.payment_status === 'confirmed' ? 'Paid' : 'Pay received'}
              </Pill>
            )}
            {canAdvance && (
              <button className="btn btn-xs btn-clay" onClick={() => setShowAdvance(true)}>
                <Icon name="chev-r" size={13} />Advance
              </button>
            )}
          </div>
        </div>
        <StageBar stages={stages} current={currentStage} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? <Spinner /> : (messages || []).map(msg => (
          <Bubble
            key={msg.id}
            msg={msg}
            isMe={msg.sender_id === profile?.id}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="composer" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => e.target.files[0] && sendImage(e.target.files[0])} />

        {/* Attachment button */}
        <button className="btn-icon" onClick={() => fileRef.current?.click()} title="Attach image">
          <Icon name="paperclip" size={18} />
        </button>

        {/* Payment button for dentist */}
        {!isTech && (
          <button className="btn-icon" onClick={() => setShowPayment(true)} title="Send payment proof">
            <Icon name="check-c" size={18} />
          </button>
        )}

        <input
          className="input"
          placeholder="Message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendText(e)}
        />
        <button
          onClick={sendText}
          disabled={!text.trim() || sending}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 0,
            background: text.trim() ? 'var(--clay)' : 'var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <Icon name="send" size={16} color={text.trim() ? '#fff' : 'var(--muted)'} />
        </button>
      </div>

      {/* Payment upload sheet */}
      <PaymentSheet
        caseId={caseData?.id}
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onSent={async () => {
          const m = await api.messages.list(caseData.id);
          setMessages(m);
          const c = await api.cases.get(caseData.id);
          setCaseData(c);
        }}
      />

      {/* Stage advance sheet */}
      <StageAdvanceSheet
        caseData={caseData}
        open={showAdvance}
        onClose={() => setShowAdvance(false)}
        onAdvanced={stage => setCaseData(prev => ({ ...prev, stage }))}
      />
    </div>
  );
}
