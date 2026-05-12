// screens-onboard.jsx — welcome + role chooser + signup + login

function ScrWelcome({ onContinue, onLogin }) {
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
          <button className="btn btn-ghost btn-block" onClick={onLogin}>I have an account</button>
        </div>
      </div>
    </div>
  );
}

function ScrRole({ onPick, picked }) {
  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '64px 22px 22px' }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Step 1 of 2</div>
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

function ScrSignup({ role, onDone, onBack, onLogin }) {
  const isTech = role === 'technician';
  const [fields, setFields] = React.useState({ name: '', orgName: '', city: '', phone: '', email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit() {
    if (!fields.name || !fields.email || !fields.password) {
      setError('Please fill in your name, email, and password.'); return;
    }
    if (fields.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setLoading(true); setError(null);
    try {
      const result = await window.CHAIRSIDE_SUPABASE.signUp(fields.email, fields.password, {
        full_name: fields.name, role, phone: fields.phone || null, city: fields.city || null,
      });
      if (isTech && fields.orgName && result?.user) {
        await window.CHAIRSIDE_SUPABASE.createLab({
          owner_id: result.user.id,
          name: fields.orgName,
          city: fields.city || null,
        });
      }
      onDone && onDone();
    } catch (e) {
      setError(e.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '64px 22px 22px' }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '0 0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', fontSize: 14 }}>
            <Icon name="chev-l" size={18} color="var(--ink-2)" /> Back
          </button>
        )}
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Step 2 of 2 · {isTech ? 'Lab' : 'Clinic'} profile</div>
        <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 18 }}>
          {isTech ? 'Set up your lab' : 'Set up your clinic'}
        </div>

        <div className="col gap-14">
          <Field label="Full name" placeholder={isTech ? 'Vikram Iyer' : 'Dr. Anaya Rao'} value={fields.name} onChange={set('name')} />
          <Field label={isTech ? 'Lab name' : 'Clinic name'} placeholder={isTech ? 'Iyer Dental Lab' : 'Rao Family Dental'} value={fields.orgName} onChange={set('orgName')} />
          <Field label="City" placeholder="Mumbai" value={fields.city} onChange={set('city')} />
          <Field label="Phone" placeholder="+91 98765 ·····" type="tel" value={fields.phone} onChange={set('phone')} />
          <Field label="Email" placeholder="you@example.com" type="email" value={fields.email} onChange={set('email')} />
          <Field label="Password" placeholder="At least 6 characters" type="password" value={fields.password} onChange={set('password')} />
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--warn-soft)', color: '#6b4d12', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        <button className="btn btn-block" style={{ marginTop: 22 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <div className="row center" style={{ marginTop: 16, gap: 6 }}>
          <span className="muted" style={{ fontSize: 13.5 }}>Already have an account?</span>
          <button className="btn btn-xs btn-ghost" onClick={onLogin}>Log in</button>
        </div>
      </div>
    </div>
  );
}

function ScrLogin({ onBack, onDone }) {
  const [fields, setFields] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const set = key => e => setFields(f => ({ ...f, [key]: e.target.value }));

  async function handleSubmit() {
    if (!fields.email || !fields.password) {
      setError('Please enter your email and password.'); return;
    }
    setLoading(true); setError(null);
    try {
      await window.CHAIRSIDE_SUPABASE.signIn(fields.email, fields.password);
      onDone && onDone();
    } catch (e) {
      setError(e.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit();
  }

  return (
    <div className="scr">
      <div className="scr-body scr-pad-top" style={{ padding: '64px 22px 22px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: '0 0 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)', fontSize: 14 }}>
          <Icon name="chev-l" size={18} color="var(--ink-2)" /> Back
        </button>

        <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 6 }}>
          Welcome back.
        </div>
        <div className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
          Log in to your Chairside account.
        </div>

        <div className="col gap-14">
          <Field label="Email" placeholder="you@example.com" type="email" value={fields.email} onChange={set('email')} onKeyDown={handleKey} />
          <Field label="Password" placeholder="Your password" type="password" value={fields.password} onChange={set('password')} onKeyDown={handleKey} />
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--warn-soft)', color: '#6b4d12', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        <button className="btn btn-block" style={{ marginTop: 22 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = 'text', value, onChange, ...rest }) {
  return (
    <div className="col gap-6">
      <label className="t-xs muted" style={{ marginLeft: 2 }}>{label}</label>
      <input className="field" placeholder={placeholder} type={type} value={value ?? ''} onChange={onChange} {...rest} />
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

Object.assign(window, { ScrWelcome, ScrRole, ScrSignup, ScrLogin, Logo });
