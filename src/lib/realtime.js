// Supabase Realtime subscriptions (direct browser → Supabase WebSocket)
// Used for live message + case updates.

let _client = null;

function getClient() {
  if (_client) return _client;
  const cfg = window.CHAIRSIDE_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;

  const token = (() => {
    try { return JSON.parse(localStorage.getItem('cs_session'))?.access_token; }
    catch { return null; }
  })();

  _client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } },
  });
  return _client;
}

export function resetClient() { _client = null; }

export function subscribeToMessages(caseId, onInsert) {
  const client = getClient();
  if (!client) return () => {};

  const channel = client
    .channel(`messages-${caseId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `case_id=eq.${caseId}`,
    }, payload => onInsert(payload.new))
    .subscribe();

  return () => client.removeChannel(channel);
}

export function subscribeToCases(userId, onUpdate) {
  const client = getClient();
  if (!client) return () => {};

  const channel = client
    .channel(`cases-${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'cases',
    }, payload => onUpdate(payload.new))
    .subscribe();

  return () => client.removeChannel(channel);
}
