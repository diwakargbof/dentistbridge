import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { subscribeToCases } from '../../lib/realtime.js';
import { Icon, Avatar, Stat, CaseCard, Spinner, EmptyState, StageDots, Pill } from '../ui/index.jsx';

function KanbanBoard({ cases, onOpenCase }) {
  const buckets = [
    { key: 'received',   label: 'Received',   match: c => c.stage === 0 },
    { key: 'progress',   label: 'In progress', match: c => c.stage > 0 && c.stage < (c.service?.stages?.length || 2) - 1 },
    { key: 'ready',      label: 'Ready',       match: c => c.service && c.stage >= (c.service.stages?.length || 1) - 1 },
  ];

  return (
    <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px', overflowX: 'auto' }} className="kan-scroll">
      {buckets.map(b => {
        const items = cases.filter(b.match);
        return (
          <div key={b.key} className="kan-col" style={{ minWidth: 220 }}>
            <h4 style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{b.label}</span>
              <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{items.length}</span>
            </h4>
            {items.map(c => {
              const stages = c.service?.stages || [];
              const partner = c.dentist?.full_name || 'Dentist';
              return (
                <div key={c.id} className="kan-card row-tap" onClick={() => onOpenCase(c)} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{c.id}</span>
                    {c.payment_status !== 'pending' && (
                      <Pill tone={c.payment_status === 'confirmed' ? 'ok' : 'warn'} style={{ fontSize: 10 }}>
                        {c.payment_status === 'confirmed' ? 'Paid' : 'Pay rcvd'}
                      </Pill>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{c.service?.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{partner}</div>
                  {stages.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <StageDots stages={stages} current={c.stage} />
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 5 }}>
                        {stages[c.stage] || '—'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {items.length === 0 && (
              <div style={{ padding: '10px 4px', fontSize: 12, color: 'var(--muted-2)', textAlign: 'center' }}>Empty</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TechDashboard({ onOpenCase, onOpenCatalog, onOpenArchive }) {
  const { profile } = useAuth();
  const [cases, setCases]     = useState(null);
  const [lab, setLab]         = useState(null);
  const [view, setView]       = useState('board');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.cases.list(), api.labs.mine()])
      .then(([c, l]) => { setCases(c); setLab(l); setLoading(false); })
      .catch(() => setLoading(false));

    const unsub = subscribeToCases(profile?.id, (updated) => {
      setCases(prev => prev?.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    });
    return unsub;
  }, [profile?.id]);

  const active      = cases || [];
  const ready       = active.filter(c => c.service && c.stage >= (c.service.stages?.length || 1) - 1);
  const pendingPay  = active.filter(c => c.payment_status === 'pending' && ready.find(r => r.id === c.id));
  const firstName   = profile?.full_name?.split(' ')[0] || 'Hi';

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">

        {/* Header */}
        <div className="app-hd">
          <div style={{ minWidth: 0 }}>
            <div className="t-eyebrow">{lab?.name || profile?.full_name}</div>
            <div className="title" style={{ marginTop: 4 }}>Cases</div>
            <div className="sub">
              {loading ? 'Loading…' : `${active.length} active · ${ready.length} ready to ship`}
            </div>
          </div>
          <Avatar name={profile?.full_name || 'T'} size={40} tone="clay" />
        </div>

        {/* Stats strip */}
        <div style={{ padding: '4px 20px 14px' }}>
          <div className="row gap-8" style={{ overflowX: 'auto' }}>
            <Stat label="Active"  value={loading ? '—' : String(active.length)} />
            <Stat label="Ready"   value={loading ? '—' : String(ready.length)} tone="ok" />
            <Stat label="Pending pay" value={loading ? '—' : String(pendingPay.length)} tone="clay" />
          </div>
        </div>

        {/* View switcher */}
        <div className="sub-hd">
          <div className="seg">
            <button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}>Board</button>
            <button className={view === 'list'  ? 'on' : ''} onClick={() => setView('list')}>List</button>
          </div>
          <button className="btn btn-xs btn-soft" onClick={onOpenArchive}>
            <Icon name="archive" size={13} />Archive
          </button>
        </div>

        {loading ? <Spinner /> : active.length === 0 ? (
          <EmptyState
            icon={<Icon name="briefcase" size={40} />}
            title="No active cases"
            body="When dentists send you cases they'll appear here."
          />
        ) : view === 'board' ? (
          <KanbanBoard cases={active} onOpenCase={onOpenCase} />
        ) : (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.map(c => (
              <CaseCard key={c.id} c={c} role="technician" onClick={() => onOpenCase(c)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
