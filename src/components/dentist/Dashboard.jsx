import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { subscribeToCases } from '../../lib/realtime.js';
import { Icon, Avatar, CaseCard, Stat, EmptyState, Spinner, Button } from '../ui/index.jsx';

export default function DentistDashboard({ onOpenCase, onBrowse, onOpenArchive }) {
  const { profile } = useAuth();
  const [cases, setCases]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.cases.list()
      .then(d => { setCases(d); setLoading(false); })
      .catch(() => setLoading(false));

    const unsub = subscribeToCases(profile?.id, (updated) => {
      setCases(prev => prev?.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    });
    return unsub;
  }, [profile?.id]);

  const active  = cases || [];
  const ready   = active.filter(c => c.service && c.stage >= (c.service.stages?.length || 1) - 1);
  const firstName = profile?.full_name?.split(' ')[0] || 'Doctor';

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top">

        {/* Header */}
        <div className="app-hd">
          <div style={{ minWidth: 0 }}>
            <div className="t-eyebrow">{profile?.full_name}</div>
            <div className="title" style={{ marginTop: 4 }}>Hi, {firstName}</div>
            <div className="sub">
              {loading ? 'Loading…' : `${active.length} cases out · ${ready.length} ready`}
            </div>
          </div>
          <Avatar name={profile?.full_name || 'D'} size={40} tone="info" />
        </div>

        {/* Stats */}
        <div style={{ padding: '4px 20px 14px' }}>
          <div className="row gap-8" style={{ overflowX: 'auto' }}>
            <Stat label="Active" value={loading ? '—' : String(active.length)} />
            <Stat label="Ready" value={loading ? '—' : String(ready.length)} tone="ok" />
            <Stat label="Pending pay" value={loading ? '—' : String(active.filter(c => c.payment_status === 'pending' && ready.includes(c)).length)} tone="clay" />
          </div>
        </div>

        {/* Hero CTA */}
        <div style={{ padding: '4px 20px 16px' }}>
          <div onClick={onBrowse} className="row-tap" style={{
            background: 'var(--ink)', color: 'var(--bg)',
            borderRadius: 18, padding: 16, display: 'flex', gap: 12, cursor: 'pointer',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="plus" size={22} color="var(--bg)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Send a new case</div>
              <div style={{ fontSize: 12.5, opacity: 0.65, marginTop: 2 }}>Browse labs · pick a service · attach notes</div>
            </div>
            <Icon name="chev-r" size={20} color="var(--bg)" />
          </div>
        </div>

        {/* Active cases */}
        <div className="sub-hd">
          <div className="t-eyebrow">Active · {loading ? '…' : active.length}</div>
          <button className="btn btn-xs btn-soft" onClick={onOpenArchive}>
            <Icon name="archive" size={13} />All cases
          </button>
        </div>

        {loading ? <Spinner /> : active.length === 0 ? (
          <EmptyState
            icon={<Icon name="inbox" size={40} />}
            title="No active cases"
            body="Browse labs and send your first case to get started."
            action={<Button variant="clay" onClick={onBrowse}><Icon name="search" size={16} />Browse labs</Button>}
          />
        ) : (
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {active.map(c => (
              <CaseCard key={c.id} c={c} role="dentist" onClick={() => onOpenCase(c)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
