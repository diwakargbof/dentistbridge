import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Icon, Spinner, EmptyState, Button, NavBack, Field, ErrorBanner, Sheet } from '../ui/index.jsx';

function TemplateEditor({ service, onClose }) {
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!service?.id) return;
    api.services.getTemplates(service.id)
      .then(d => {
        // Build an array indexed by stage
        const byStage = {};
        (d || []).forEach(t => { byStage[t.stage_index] = t.body; });
        const arr = (service.stages || []).map((_, i) => byStage[i] || '');
        setTemplates(arr);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [service?.id]);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const rows = (templates || [])
        .map((body, i) => ({ stage_index: i, body: body.trim() }))
        .filter(t => t.body);
      await api.services.putTemplates(service.id, rows);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
      <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
        Write a message template for each stage. When you advance a case to that stage, you can send this message with one tap.
      </div>

      {(service?.stages || []).map((stage, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: i === (service.stages.length - 1) ? 'var(--ok)' : 'var(--clay)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
            </div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{stage}</div>
          </div>
          <textarea
            className="field"
            placeholder={`Message when case reaches "${stage}"… (leave blank to skip)`}
            rows={2}
            value={templates?.[i] || ''}
            onChange={e => {
              const arr = [...(templates || [])];
              arr[i] = e.target.value;
              setTemplates(arr);
            }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" block onClick={onClose}>Cancel</Button>
        <Button variant="clay" block onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save templates'}
        </Button>
      </div>
    </div>
  );
}

export default function Templates() {
  const [services, setServices] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);

  useEffect(() => {
    api.services.mine()
      .then(d => { setServices(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <div className="app-hd">
          <div>
            <div className="title" style={{ marginTop: 4 }}>Templates</div>
            <div className="sub">Stage message library</div>
          </div>
        </div>

        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            Write short message templates for each stage of each service. When you advance a case, you can fire the template message with one tap — no retyping.
          </div>
        </div>

        {loading ? <Spinner /> : (services || []).length === 0 ? (
          <EmptyState
            icon={<Icon name="zap" size={40} />}
            title="No services yet"
            body="Add services first, then set up templates per stage."
          />
        ) : (
          <div style={{ padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(services || []).map(svc => (
              <div key={svc.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{svc.title}</div>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                      {(svc.stages || []).length} stages · tap to configure templates
                    </div>
                  </div>
                  <Button variant="soft" size="xs" onClick={() => setEditing(svc)}>
                    <Icon name="edit" size={13} />Edit
                  </Button>
                </div>
                {svc.stages?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
                    {svc.stages.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {i > 0 && <Icon name="chev-r" size={10} color="var(--muted-2)" />}
                        <span style={{ fontSize: 11, background: 'var(--surface-2)', color: 'var(--ink-2)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--line)' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={`Templates — ${editing?.title || ''}`}>
        {editing && <TemplateEditor service={editing} onClose={() => setEditing(null)} />}
      </Sheet>
    </div>
  );
}
