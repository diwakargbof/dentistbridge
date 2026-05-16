import React, { useState } from 'react';
import { Icon, Field, Button, ErrorBanner } from '../ui/index.jsx';

const DEFAULT_STAGES = ['Received', 'In Progress', 'Ready'];

export default function ServiceForm({ initial, onSave, onCancel }) {
  const [title, setTitle]       = useState(initial?.title || '');
  const [desc, setDesc]         = useState(initial?.description || '');
  const [price, setPrice]       = useState(initial?.price ? String(initial.price) : '');
  const [stages, setStages]     = useState(initial?.stages?.length ? initial.stages : DEFAULT_STAGES);
  const [stageInput, setStageInput] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  function addStage(e) {
    e.preventDefault();
    const s = stageInput.trim();
    if (s && !stages.includes(s)) setStages(prev => [...prev, s]);
    setStageInput('');
  }

  function removeStage(i) {
    setStages(prev => prev.filter((_, idx) => idx !== i));
  }

  function moveStage(i, dir) {
    const arr = [...stages];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setStages(arr);
  }

  async function handleSave() {
    if (!title.trim()) { setError('Service title is required'); return; }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) { setError('Enter a valid price'); return; }
    if (stages.length < 2) { setError('Add at least 2 stages'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave({ title: title.trim(), description: desc.trim(), price: Number(price), stages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <Field label="Service name">
        <input className="field" placeholder="e.g. Zirconia Crown" value={title} onChange={e => setTitle(e.target.value)} />
      </Field>

      <Field label="Description (optional)">
        <textarea className="field" placeholder="What's included, materials used…" rows={2} value={desc} onChange={e => setDesc(e.target.value)} />
      </Field>

      <Field label="Price (₹)">
        <input className="field" type="number" min="0" placeholder="4200" value={price} onChange={e => setPrice(e.target.value)} />
      </Field>

      {/* Workflow stages */}
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Workflow stages</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
          {stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px', border: '1px solid var(--line)' }}>
              <span style={{ width: 20, height: 20, borderRadius: 10, background: i === 0 ? 'var(--clay)' : i === stages.length - 1 ? 'var(--ok)' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
              </span>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{s}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => moveStage(i, -1)} disabled={i === 0} style={{ border: 0, background: 'transparent', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1, padding: 4 }}>
                  <Icon name="chev-d" size={14} color="var(--muted)" style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button onClick={() => moveStage(i, 1)} disabled={i === stages.length - 1} style={{ border: 0, background: 'transparent', cursor: 'pointer', opacity: i === stages.length - 1 ? 0.3 : 1, padding: 4 }}>
                  <Icon name="chev-d" size={14} color="var(--muted)" />
                </button>
                <button onClick={() => removeStage(i)} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 4 }}>
                  <Icon name="x" size={14} color="var(--danger)" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={addStage} style={{ display: 'flex', gap: 8 }}>
          <input className="field" style={{ flex: 1 }} placeholder="Add stage (e.g. Glazed)" value={stageInput} onChange={e => setStageInput(e.target.value)} />
          <Button type="submit" variant="ghost" size="sm"><Icon name="plus" size={16} /></Button>
        </form>
      </div>

      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <Button variant="ghost" block onClick={onCancel}>Cancel</Button>
        <Button variant="clay" block onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : initial?.id ? 'Save changes' : 'Add service'}
        </Button>
      </div>
    </div>
  );
}
