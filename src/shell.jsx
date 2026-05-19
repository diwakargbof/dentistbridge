// shell.jsx — role-aware app shell

const NAV = {
  worker: [
    { id: 'scan',    label: 'Scan',    icon: 'scan',    path: '/scan' },
    { id: 'queue',   label: 'My queue', icon: 'inbox',   path: '/queue' },
    { id: 'history', label: 'History', icon: 'history', path: '/history' },
    { id: 'profile', label: 'Me',      icon: 'user',    path: '/profile' },
  ],
  receptionist: [
    { id: 'new',      label: 'New case', icon: 'plus-circle', path: '/intake' },
    { id: 'active',   label: 'Active',  icon: 'cases',  path: '/active' },
    { id: 'dispatch', label: 'Dispatch', icon: 'truck',  path: '/dispatch' },
    { id: 'warranty', label: 'Warranty', icon: 'shield', path: '/warranty' },
  ],
  owner: [
    { id: 'board',   label: 'Board',    icon: 'kanban', path: '/board' },
    { id: 'cases',   label: 'Cases',    icon: 'list',   path: '/cases' },
    { id: 'reports', label: 'Reports',  icon: 'chart',  path: '/reports' },
    { id: 'audit',   label: 'Activity', icon: 'history', path: '/audit' },
  ],
  admin: [
    { id: 'stages',   label: 'Stages',  icon: 'workflow',  path: '/admin/stages' },
    { id: 'types',    label: 'Types',   icon: 'list',     path: '/admin/types' },
    { id: 'users',    label: 'Users',   icon: 'users',    path: '/admin/users' },
    { id: 'lab',      label: 'Lab',     icon: 'building', path: '/admin/lab' },
  ],
};

function Shell({ children, title, back, action, wide }) {
  const { sel, logout } = useStore();
  const route = useRoute();
  const user = sel.user;
  if (!user) return null;
  const items = NAV[user.role] || NAV.worker;
  const path = '/' + route.path.replace(/^\/?/, '');
  const active = items.find(i => path === i.path || path.startsWith(i.path + '/'))?.id || items[0].id;

  const notifs = sel.notifsFor(user).filter(n => !n.read);

  return (
    <div className="app">
      <aside className="sidebar">
        <Link to={items[0].path}>
          <div className="row gap-10" style={{ padding: '4px 8px 20px', textDecoration: 'none', color: 'inherit' }}>
            <Logo size={26} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>Bench</div>
              <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>{sel.labConfig.labName}</div>
            </div>
          </div>
        </Link>
        {items.map(it => (
          <Link key={it.id} to={it.path} className={'sb-row' + (active === it.id ? ' on' : '')}>
            <span className="ic"><Icon name={it.icon} size={17} /></span>
            <span>{it.label}</span>
          </Link>
        ))}

        {/* Role-based extras in sidebar */}
        {user.role === 'owner' && (
          <>
            <div style={{ marginTop: 12, padding: '6px 10px' }} className="t-eyebrow">Activity</div>
            <Link to="/notifications" className="sb-row">
              <span className="ic"><Icon name="bell" size={17} /></span>
              <span>Notifications</span>
              {notifs.length > 0 && <span className="sb-count" style={{ color: 'var(--clay-ink)' }}>{notifs.length}</span>}
            </Link>
          </>
        )}

        <div style={{ flex: 1 }} />
        <div className="card-flat" style={{ padding: 12 }}>
          <div className="row gap-10">
            <Avatar name={user.name} size={32} tone={toneFor(user)} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div className="muted" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {roleLabel(user, sel)}
              </div>
            </div>
            <button className="btn-icon ghost" onClick={logout} title="Sign out" style={{ width: 28, height: 28 }}>
              <Icon name="logout" size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="viewport">
        {title !== false && (
          <header className="topbar">
            {back && (
              <button className="btn-icon" onClick={() => { if (typeof back === 'string') nav(back); else history.back(); }}>
                <Icon name="back" size={18} />
              </button>
            )}
            <div className="title">{title || ''}</div>
            {user.role !== 'worker' && (
              <button className="btn-icon" onClick={() => nav('/notifications')} style={{ position: 'relative' }} title="Notifications">
                <Icon name="bell" size={18} />
                {notifs.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    minWidth: 16, height: 16, borderRadius: 8,
                    background: 'var(--clay)', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px',
                  }}>{notifs.length}</span>
                )}
              </button>
            )}
            {action}
            <button className="btn-icon ghost hide-desktop" onClick={logout} title="Sign out">
              <Icon name="logout" size={18} />
            </button>
          </header>
        )}

        <main className={'content' + (wide ? ' wide' : '')}>
          {children}
        </main>

        <nav className={'tabbar cols-' + items.length}>
          {items.map(it => (
            <button key={it.id} className={'tab' + (active === it.id ? ' on' : '')} onClick={() => nav(it.path)}>
              <span className="ic"><Icon name={it.icon} size={20} /></span>
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function roleLabel(user, sel) {
  if (user.role === 'worker') {
    const st = sel.stageById(user.stageId);
    return st ? `${st.name} · worker` : 'Worker';
  }
  return user.role[0].toUpperCase() + user.role.slice(1);
}

function toneFor(user) {
  if (!user) return 'ink';
  if (user.role === 'owner') return 'ink';
  if (user.role === 'receptionist') return 'info';
  if (user.role === 'admin') return 'warn';
  return 'clay';
}

Object.assign(window, { Shell, NAV, roleLabel, toneFor });
