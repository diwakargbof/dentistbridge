// screens-onboard.jsx — welcome + role chooser + signup
// Three lightweight first-run screens.

function ScrWelcome({ onContinue }) {
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '70px 26px 24px', display: 'flex', flexDirection: 'column' }}>
        <div className="row gap-8" style={{ marginBottom: 30 }}>
          <Logo size={28} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>Chairside</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="t-eyebrow" style={{ marginBottom: 14 }}>For dentists & dental labs</div>
          <div className="serif" style={{ fontSize: 44, lineHeight: 1.04, letterSpacing: '-0.025em' }}>
            Between the chair<br/>and the bench.
          </div>
          <div style={{ fontSize: 15.5, color: 'var(--ink-3)', marginTop: 18, maxWidth: 280, lineHeight: 1.5 }}>
            Case-by-case workflow tracking and conversation, built for the way labs actually work.
          </div>
        </div>

        <div className="col gap-10" style={{ paddingBottom: 8 }}>
          <button className="btn btn-block" onClick={onContinue}>Get started</button>
          <button className="btn btn-ghost btn-block">I have an account</button>
        </div>
      </div>
    </div>
  );
}

function ScrRole({ onPick, picked }) {
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '64px 22px 22px' }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Step 1 of 3</div>
        <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 4 }}>
          How do you work?
        </div>
        <div className="muted" style={{ fontSize: 14, marginBottom: 22 }}>
          You can change this later from settings.
        </div>

        <div className="col gap-12">
          <RoleCard
            on={picked === 'dentist'}
            onClick={() => onPick('dentist')}
            title="I'm a dentist"
            sub="Send cases to labs, track progress, message technicians."
            bullets={['Browse lab service catalogs', 'Real-time case status', 'Upload payment in chat']}
            iconAv="AR" tone="ink"
          />
          <RoleCard
            on={picked === 'technician'}
            onClick={() => onPick('technician')}
            title="I run a lab"
            sub="Manage incoming cases, custom workflows, message dentists."
            bullets={['Service catalog with pricing', 'Custom workflow per service', 'Auto-stage message templates']}
            iconAv="VI" tone="clay"
          />
        </div>

        <button className="btn btn-block" style={{ marginTop: 22 }} disabled={!picked} onClick={() => onPick(picked, true)}>Continue</button>
      </div>
    </div>
  );
}

function RoleCard({ on, onClick, title, sub, bullets, iconAv, tone }) {
  return (
    <div
      onClick={onClick}
      className="row-tap"
      style={{
        background: on ? 'var(--surface)' : 'var(--surface-2)',
        border: on ? '1.5px solid var(--ink)' : '1px solid var(--line)',
        borderRadius: 16, padding: 16,
        boxShadow: on ? 'var(--shadow-1)' : 'none',
      }}
    >
      <div className="row gap-12" style={{ alignItems: 'flex-start' }}>
        <Avatar name={iconAv} size={48} tone={tone} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 2, marginBottom: 10 }}>{sub}</div>
          <div className="col gap-6">
            {bullets.map(b => (
              <div key={b} className="row gap-8" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                <Icon name="check" size={14} color="var(--clay)" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScrSignup({ role, onDone }) {
  const isTech = role === 'technician';
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '64px 22px 22px' }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Step 2 of 3 · {isTech ? 'Lab' : 'Clinic'} profile</div>
        <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 18 }}>
          {isTech ? 'Set up your lab' : 'Set up your clinic'}
        </div>

        <div className="col gap-14">
          <Field label="Full name" placeholder={isTech ? 'Vikram Iyer' : 'Dr. Anaya Rao'} />
          <Field label={isTech ? 'Lab name' : 'Clinic name'} placeholder={isTech ? 'Iyer Dental Lab' : 'Rao Family Dental'} />
          <Field label="City" placeholder="Mumbai" />
          <Field label="Phone" placeholder="+91 98765 ·····" type="tel" />
          {isTech && (
            <div className="col gap-6">
              <label className="t-xs muted">Specialties</label>
              <div className="row gap-6" style={{ flexWrap: 'wrap' }}>
                {['Crown & bridge', 'Veneers', 'Dentures', 'Night guards', 'Implants'].map(s => (
                  <Pill key={s} tone="clay">{s}</Pill>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="btn btn-block" style={{ marginTop: 22 }} onClick={onDone}>Continue</button>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = 'text' }) {
  return (
    <div className="col gap-6">
      <label className="t-xs muted" style={{ marginLeft: 2 }}>{label}</label>
      <input className="field" placeholder={placeholder} type={type} />
    </div>
  );
}

function Logo({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 7,
      background: 'var(--ink)', color: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Newsreader, serif', fontSize: size * 0.6, fontWeight: 500,
      letterSpacing: '-0.02em',
    }}>C</div>
  );
}

Object.assign(window, { ScrWelcome, ScrRole, ScrSignup, Logo });
