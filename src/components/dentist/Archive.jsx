import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { NavBack, CaseCard, Spinner, EmptyState, Icon } from '../ui/index.jsx';

export default function DentistArchive({ onBack, onOpenCase }) {
  const [cases, setCases]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.cases.archive()
      .then(d => { setCases(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const grouped = React.useMemo(() => {
    const all = (cases || []).filter(c => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.id?.toLowerCase().includes(q) ||
             c.lab?.name?.toLowerCase().includes(q) ||
             c.service?.title?.toLowerCase().includes(q) ||
             c.patient_ref?.toLowerCase().includes(q);
    });
    // Group by lab name
    const map = {};
    for (const c of all) {
      const k = c.lab?.name || 'Unknown lab';
      if (!map[k]) map[k] = [];
      map[k].push(c);
    }
    return Object.entries(map);
  }, [cases, search]);

  return (
    <div className="scr">
      <NavBack title="All Cases" onBack={onBack} />
      <div className="scr-body">
        <div style={{ padding: '14px 20px 8px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <Icon name="search" size={15} color="var(--muted)" />
            </div>
            <input className="field" style={{ paddingLeft: 36 }} placeholder="Search by case ID, lab, service…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? <Spinner /> : grouped.length === 0 ? (
          <EmptyState icon={<Icon name="archive" size={40} />} title="No archived cases" body="Completed cases will appear here." />
        ) : (
          <div style={{ padding: '8px 20px 32px' }}>
            {grouped.map(([labName, labCases]) => (
              <div key={labName} style={{ marginBottom: 24 }}>
                <div className="t-eyebrow" style={{ marginBottom: 10 }}>{labName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {labCases.map(c => (
                    <CaseCard key={c.id} c={c} role="dentist" onClick={() => onOpenCase(c)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
