import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Icon, NavBack, Button, Field, ErrorBanner, Spinner } from '../ui/index.jsx';

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
          {svc.description && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{svc.description}</div>}
          {svc.stages?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              {svc.stages.map((s, i) => (
                <span key={i} style={{ fontSize: 10.5, background: 'var(--bg-2)', color: 'var(--ink-3)', padding: '2px 8px', borderRadius: 999, border: '1px solid var(--line)' }}>{s}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}>₹{svc.price?.toLocaleString('en-IN')}</div>
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

export default function TechNewCase({ onBack, onCreated }) {
  const [services, setServices]     = useState(null);
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [patientRef, setPatientRef] = useState('');
  const [shade, setShade]           = useState('');
  const [notes, setNotes]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [loadingSvcs, setLoadingSvcs] = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.services.mine()
      .then(d => { setServices(d || []); setLoadingSvcs(false); })
      .catch(() => setLoadingSvcs(false));
  }, []);

  const activeServices = (services || []).filter(s => s.active !== false);

  useEffect(() => {
    if (activeServices.length === 1) setSelectedSvc(activeServices[0]);
  }, [activeServices.length]);

  async function handleCreate() {
    if (!selectedSvc) { setError('Select a service'); return; }
    if (!doctorName.trim()) { setError('Doctor name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const created = await api.cases.create({
        service_id:   selectedSvc.id,
        doctor_name:  doctorName.trim(),
        doctor_phone: doctorPhone.trim() || null,
        clinic_name:  clinicName.trim()  || null,
        patient_ref:  patientRef.trim()  || null,
        notes:        notes.trim()       || null,
        shade:        shade.trim()       || null,
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

        {/* Doctor info */}
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Doctor details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Field label="Doctor name *">
              <input className="field" placeholder="e.g. Dr. Anaya Rao" value={doctorName} onChange={e => setDoctorName(e.target.value)} />
            </Field>
            <Field label="Doctor phone (for WhatsApp updates)">
              <input className="field" type="tel" inputMode="numeric" placeholder="e.g. 9876543210" value={doctorPhone} onChange={e => setDoctorPhone(e.target.value)} />
            </Field>
            <Field label="Clinic name (optional)">
              <input className="field" placeholder="e.g. Smile Dental Clinic" value={clinicName} onChange={e => setClinicName(e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Service picker */}
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 10 }}>Select service</div>
          {loadingSvcs ? <Spinner /> : activeServices.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13.5, padding: '8px 0' }}>
              No services found. Add services in the Catalog tab first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeServices.map(s => (
                <ServiceRow key={s.id} svc={s} selected={selectedSvc?.id === s.id} onClick={() => setSelectedSvc(s)} />
              ))}
            </div>
          )}
        </div>

        {/* Case details */}
        <Field label="Patient reference (optional)">
          <input className="field" placeholder="e.g. Patient name or ID" value={patientRef} onChange={e => setPatientRef(e.target.value)} />
        </Field>
        <Field label="Shade guide (optional)">
          <input className="field" placeholder="e.g. A2, B1" value={shade} onChange={e => setShade(e.target.value)} />
        </Field>
        <Field label="Notes (optional)">
          <textarea className="field" placeholder="Special instructions, tooth number, etc." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
        </Field>

        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {selectedSvc && (
          <div style={{ background: 'var(--clay-soft)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12.5, color: 'var(--clay-ink)', fontWeight: 500, marginBottom: 2 }}>Selected</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--clay-ink)' }}>{selectedSvc.title}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--clay-ink)' }}>₹{selectedSvc.price?.toLocaleString('en-IN')}</div>
          </div>
        )}

        <Button variant="clay" block onClick={handleCreate} disabled={loading || !selectedSvc || !doctorName.trim()}>
          {loading ? 'Creating…' : 'Create case'}
        </Button>
      </div>
    </div>
  );
}
