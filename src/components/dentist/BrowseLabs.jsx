import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Icon, Avatar, Stars, Spinner, NavBack, EmptyState, Pill } from '../ui/index.jsx';

function LabCard({ lab, onClick }) {
  const svcs = (lab.services || []).filter(s => s.active);
  return (
    <div className="card row-tap" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={lab.name} size={48} tone="clay" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.01em' }}>{lab.name}</span>
            {lab.verified && (
              <div style={{ width: 16, height: 16, borderRadius: 8, background: 'var(--info-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={10} color="var(--info)" />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            <Stars value={lab.rating} />
            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{lab.jobs_count} cases</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
            <Icon name="map-pin" size={12} color="var(--muted)" />
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{lab.city || 'India'}</span>
            {lab.turnaround && (
              <>
                <span style={{ color: 'var(--line-2)', fontSize: 12 }}>·</span>
                <Icon name="clock" size={12} color="var(--muted)" />
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>{lab.turnaround}</span>
              </>
            )}
          </div>
        </div>
        <Icon name="chev-r" size={18} color="var(--muted-2)" />
      </div>
      {lab.bio && (
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.45, marginLeft: 60 }}>
          {lab.bio.length > 100 ? lab.bio.slice(0, 100) + '…' : lab.bio}
        </div>
      )}
      {svcs.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, marginLeft: 60 }}>
          {svcs.slice(0, 3).map(s => (
            <Pill key={s.id}>₹{(s.price / 1000).toFixed(1)}k · {s.title}</Pill>
          ))}
          {svcs.length > 3 && <Pill>+{svcs.length - 3} more</Pill>}
        </div>
      )}
    </div>
  );
}

export default function BrowseLabs({ onBack, onSelectLab }) {
  const [labs, setLabs]       = useState(null);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.labs.list()
      .then(d => { setLabs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = (labs || []).filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return l.name?.toLowerCase().includes(q) ||
           l.city?.toLowerCase().includes(q) ||
           l.bio?.toLowerCase().includes(q) ||
           l.services?.some(s => s.title?.toLowerCase().includes(q));
  });

  return (
    <div className="scr">
      <NavBack title="Browse Labs" onBack={onBack} />
      <div className="scr-body">

        {/* Search */}
        <div style={{ padding: '14px 20px 10px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={16} color="var(--muted)" />
            </div>
            <input
              className="field"
              style={{ paddingLeft: 38 }}
              placeholder="Search labs, city, service…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState icon="🔬" title="No labs found" body="Try a different search term." />
        ) : (
          <div style={{ padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(l => (
              <LabCard key={l.id} lab={l} onClick={() => onSelectLab(l)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
