// app.jsx — root + router

function App() {
  return (
    <StoreProvider>
      <Routes />
      <ToastHost />
    </StoreProvider>
  );
}

function Routes() {
  const { sel } = useStore();
  // Expose sel for non-component helpers (PDF gen passes it explicitly, but
  // some inline calls fall back to this singleton)
  window.__sel_singleton = sel;

  const route = useRoute();
  const path = '/' + route.path.replace(/^\/?/, '');
  const seg = route.segments;

  React.useEffect(() => {
    if (!sel.isAuthed && path !== '/login') nav('/login');
    else if (sel.isAuthed && (path === '/login' || path === '/' || path === '')) nav(landingFor(sel.user));
  }, [sel.isAuthed, path]);

  if (path === '/login' || !sel.isAuthed) return <LoginScreen />;

  // Role-gated routing
  const role = sel.user.role;
  const a = seg[0], b = seg[1];

  // Shared routes (any role)
  if (a === 'case' && b) return <CaseDetailScreen caseId={b} />;
  if (a === 'profile') return <ProfileScreen />;
  if (a === 'notifications') return <NotificationsScreen />;

  // Worker
  if (role === 'worker') {
    if (a === 'scan' || !a) return <WorkerScanHome />;
    if (a === 'queue') return <WorkerQueueScreen />;
    if (a === 'history') return <WorkerHistoryScreen />;
    return <WorkerScanHome />;
  }

  // Receptionist
  if (role === 'receptionist') {
    if (a === 'intake') return <ReceptionIntakeScreen />;
    if (a === 'active' || !a) return <ReceptionActiveScreen />;
    if (a === 'dispatch') return <ReceptionDispatchScreen />;
    if (a === 'warranty') return <WarrantyScreen />;
    return <ReceptionActiveScreen />;
  }

  // Owner
  if (role === 'owner') {
    if (a === 'board' || !a) return <OwnerBoardScreen />;
    if (a === 'cases') return <OwnerCasesScreen />;
    if (a === 'reports') return <OwnerReportsScreen />;
    if (a === 'audit') return <OwnerActivityScreen />;
    return <OwnerBoardScreen />;
  }

  // Admin
  if (role === 'admin') {
    if (a === 'admin' && b === 'stages') return <AdminStagesScreen />;
    if (a === 'admin' && b === 'types') return <AdminTypesScreen />;
    if (a === 'admin' && b === 'users') return <AdminUsersScreen />;
    if (a === 'admin' && b === 'lab') return <AdminLabScreen />;
    return <AdminStagesScreen />;
  }

  return <LoginScreen />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
