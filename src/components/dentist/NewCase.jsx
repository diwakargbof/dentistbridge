import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Icon, Avatar, Stars, NavBack, Button, Field, ErrorBanner, Pill } from '../ui/index.jsx';

function ServiceRow({ svc, selected, onClick }) {
  return (
    <div onClick={onClick} className="row-tap" style={{
      background: selected ? 'var(--surface)' : 'var(--surface-2)',
      border: selected ? '2px solid var(--ink)' : '1.5px solid var(--line)',
      borderRadius: 14, padding: '12px 14px', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14.5, letterSpacing: '-0.01em' }}>{svc.title}</div>
          {svc.description && <div className="muted" style={{ fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>{svc.description}</div>}
          {svc.stages?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {svc.stages.map((s, i) => (
                <span key={i} style={{ fontSize: 10.5, background: 'var(--bg-2)', color: 'var(--ink-3)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--line)' }}>{s}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: selected ? 'var(--ink)' : 'var(--clay-ink)' }}>
            ₹{svc.price?.toLocaleString('en-IN')}
          </div>
          {selected && (
            <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 6, marginLeft: 'auto' }}>
              <Icon name="check" size={13} color="var(--bg)" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewCase({ lab, onBack, onCreated }) {
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [patientRef, setPatientRef]   = useState('');
  const [notes, setNotes]             = useState('');
  const [shade, setShade]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const services = (lab?.services || []).filter(s => s.active);

  // Auto-select when there's only one service
  useEffect(() => {
    if (services.length === 1) setSelectedSvc(services[0]);
  }, [services.length]);

  async function handleCreate() {
    if (!selectedSvc) { setError('Please select a service'); return; }
    setLoading(true);
    setError('');
    try {
      const created = await api.cases.create({
        lab_id: lab.id,
        service_id: selectedSvc.id,
        patient_ref: patientRef.trim() || null,
        notes: notes.trim() || null,
        shade: shade.trim() || null,
      });
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scr">
      <NavBack title="New Case" onBack={onBack} />
      <div className="scr-body" style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Lab info */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 16px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--line)' }}>
          <Avatar name={lab?.name} size={44} tone="clay" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{lab?.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
              <Stars value={lab?.rating} />
              {lab?.turnaround && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{lab.turnaround}</span>}
            </div>
          </div>
        </div>

        {/* Service picker */}
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Select service</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {services.length === 0
              ? <div style={{ color: 'var(--muted)', fontSize: 13.5, padding: '12px 0' }}>No services listed for this lab.</div>
              : services.map(s => (
                  <ServiceRow key={s.id} svc={s} selected={selectedSvc?.id === s.id} onClick={() => setSelectedSvc(s)} />
                ))
            }
          </div>
        </div>

        {/* Patient reference */}
        <Field label="Patient reference (optional)">
          <input className="field" placeholder="e.g. Patient name or ID" value={patientRef} onChange={e => setPatientRef(e.target.value)} />
        </Field>

        {/* Shade */}
        <Field label="Shade guide (optional)">
          <input className="field" placeholder="e.g. A2, B1" value={shade} onChange={e => setShade(e.target.value)} />
        </Field>

        {/* Notes */}
        <Field label="Notes for lab (optional)">
          <textarea className="field" placeholder="Special instructions, tooth number, etc." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        </Field>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {selectedSvc && (
          <div style={{ background: 'var(--clay-soft)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--clay-ink)', fontWeight: 500, marginBottom: 2 }}>Selected service</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--clay-ink)' }}>{selectedSvc.title}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--clay-ink)' }}>₹{selectedSvc.price?.toLocaleString('en-IN')}</div>
          </div>
        )}

        {!selectedSvc && services.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--muted)', marginBottom: -8 }}>
            Select a service above to continue
          </div>
        )}

        <Button variant="clay" block onClick={handleCreate} disabled={loading || !selectedSvc}>
          {loading ? 'Sending…' : 'Send case to lab'}
        </Button>
      </div>
    </div>
  );
}
