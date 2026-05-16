import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Icon, Spinner, EmptyState, Button, NavBack, Sheet } from '../ui/index.jsx';
import ServiceForm from './ServiceForm.jsx';

function ServiceCard({ svc, onEdit, onToggle, onDelete }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{svc.title}</div>
            {!svc.active && (
              <span style={{ fontSize: 10.5, background: 'var(--warn-soft)', color: '#6b4d12', padding: '2px 7px', borderRadius: 999 }}>Inactive</span>
            )}
          </div>
          {svc.description && <div className="muted" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.4 }}>{svc.description}</div>}
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--clay-ink)' }}>₹{svc.price?.toLocaleString('en-IN')}</span>
            {svc.stages?.length > 0 && <span className="muted" style={{ fontSize: 12 }}>{svc.stages.length} stages</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn-icon" onClick={onEdit}><Icon name="edit" size={16} /></button>
          <button className="btn-icon" onClick={onToggle} title={svc.active ? 'Deactivate' : 'Activate'}>
            <Icon name={svc.active ? 'eye' : 'eye'} size={16} color={svc.active ? 'var(--ok)' : 'var(--muted)'} />
          </button>
        </div>
      </div>
      {svc.stages?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 10 }}>
          {svc.stages.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <Icon name="chev-r" size={10} color="var(--muted-2)" />}
              <span style={{ fontSize: 11, background: 'var(--surface-2)', color: 'var(--ink-2)', padding: '3px 8px', borderRadius: 999, border: '1px solid var(--line)' }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Services() {
  const [services, setServices] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null); // null=closed, {}=new, svc=edit

  useEffect(() => { load(); }, []);

  function load() {
    api.services.mine()
      .then(d => { setServices(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function handleToggle(svc) {
    try {
      const updated = await api.services.update(svc.id, { active: !svc.active });
      setServices(prev => prev.map(s => s.id === svc.id ? updated : s));
    } catch (err) { console.error(err); }
  }

  async function handleSave(data) {
    try {
      if (editing?.id) {
        const updated = await api.services.update(editing.id, data);
        setServices(prev => prev.map(s => s.id === editing.id ? updated : s));
      } else {
        const created = await api.services.create(data);
        setServices(prev => [created, ...prev]);
      }
      setEditing(null);
    } catch (err) { throw err; }
  }

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">
        <div className="app-hd">
          <div>
            <div className="title" style={{ marginTop: 4 }}>Services</div>
            <div className="sub">Your service catalog</div>
          </div>
          <Button variant="clay" size="sm" onClick={() => setEditing({})}>
            <Icon name="plus" size={16} />New
          </Button>
        </div>

        {loading ? <Spinner /> : (services || []).length === 0 ? (
          <EmptyState
            icon={<Icon name="briefcase" size={40} />}
            title="No services yet"
            body="Add services to your catalog so dentists can find you."
            action={<Button variant="clay" onClick={() => setEditing({})}><Icon name="plus" size={16} />Add first service</Button>}
          />
        ) : (
          <div style={{ padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(services || []).map(svc => (
              <ServiceCard
                key={svc.id}
                svc={svc}
                onEdit={() => setEditing(svc)}
                onToggle={() => handleToggle(svc)}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit service' : 'Add service'}>
        {editing && (
          <ServiceForm
            initial={editing?.id ? editing : null}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        )}
      </Sheet>
    </div>
  );
}
