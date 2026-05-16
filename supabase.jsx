// supabase.jsx — Supabase client, auth, real-time hooks, full CRUD + deletes
// Loaded before data.jsx. Degrades gracefully to demo mode when unconfigured.

(function () {
  const cfg = window.CHAIRSIDE_CONFIG || {};

  // Strip any accidental path from the URL (e.g. /rest/v1 appended by mistake).
  // SUPABASE_URL must be just https://<project>.supabase.co — no trailing path.
  function normalizeUrl(url) {
    if (!url) return url;
    try { const u = new URL(url); return u.protocol + '//' + u.host; }
    catch (_) { return url; }
  }
  const supabaseUrl = normalizeUrl(cfg.supabaseUrl);
  const isConfigured = !!(supabaseUrl && cfg.supabaseAnonKey);

  // ── Client ───────────────────────────────────────────────────
  const db = isConfigured
    ? window.supabase.createClient(supabaseUrl, cfg.supabaseAnonKey)
    : null;

  // ── Mock-mode helpers ────────────────────────────────────────
  // isMock: true when Supabase is not configured OR userId is a static profile ID.
  function isMock(userId) {
    return !db || (typeof userId === 'string' && userId.startsWith('static-'));
  }
  // Callback registry for mock real-time message delivery.
  const _msgCbs = {};

  // ── Auth ─────────────────────────────────────────────────────
  async function signUp(email, password, profileData) {
    if (!db) throw new Error('Supabase not configured');

    // Step 1: create auth user
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: { data: { full_name: profileData.full_name, role: profileData.role } },
    });
    if (error) {
      const e = new Error('Auth signup failed: ' + error.message);
      e.step = 'auth'; throw e;
    }

    // Step 2: upsert profile — only possible when a session exists immediately
    // (i.e. email confirmation is OFF). If session is null the user must confirm
    // their email first; ensureProfile() will create the row on first login.
    if (data.user && data.session) {
      const { error: pe } = await db.from('profiles').upsert({
        id: data.user.id,
        role: profileData.role,
        full_name: profileData.full_name,
        phone: profileData.phone || null,
        city: profileData.city || null,
      }, { onConflict: 'id' });
      if (pe) {
        const e = new Error('Profile save failed: ' + pe.message);
        e.step = 'profile'; throw e;
      }
    }
    return data;
  }

  async function signIn(email, password) {
    if (!db) throw new Error('Supabase not configured');
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!db) return;
    const { error } = await db.auth.signOut();
    if (error) throw error;
  }

  function onAuthStateChange(callback) {
    if (!db) return () => {};
    const { data: { subscription } } = db.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  }

  async function getSession() {
    if (!db) return null;
    const { data } = await db.auth.getSession();
    return data.session;
  }

  async function getProfile(userId) {
    if (!db) return null;
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) { console.error('getProfile:', error.message); return null; }
    return data;
  }

  async function updateProfile(userId, updates) {
    if (!db) return null;
    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ── Labs ─────────────────────────────────────────────────────
  async function fetchLabs() {
    if (!db) return null;
    const { data, error } = await db
      .from('labs')
      .select('*, services(*), owner:profiles(full_name)')
      .order('rating', { ascending: false });
    if (error) { console.error('fetchLabs:', error.message); return null; }
    return data;
  }

  async function fetchMyLab(userId) {
    if (!db || !userId) return null;
    const { data, error } = await db
      .from('labs')
      .select('*, services(*)')
      .eq('owner_id', userId)
      .single();
    if (error) { console.error('fetchMyLab:', error.message); return null; }
    return data;
  }

  async function fetchMyClinic(userId) {
    if (!db || !userId) return null;
    const { data, error } = await db
      .from('clinics')
      .select('*')
      .eq('owner_id', userId)
      .single();
    if (error) { console.error('fetchMyClinic:', error.message); return null; }
    return data;
  }

  async function createLab(payload) {
    if (!db) return null;
    const { data, error } = await db
      .from('labs')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateLab(labId, updates) {
    if (!db) return null;
    const { data, error } = await db
      .from('labs')
      .update(updates)
      .eq('id', labId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete a lab. The DB policy blocks this if active (non-archived) cases exist.
  async function deleteLab(labId) {
    if (!db) return;
    const { error } = await db.from('labs').delete().eq('id', labId);
    if (error) throw error;
  }

  // ── Services ─────────────────────────────────────────────────
  async function createService(payload) {
    if (!db) return null;
    const { data, error } = await db
      .from('services')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateService(serviceId, updates) {
    if (!db) return null;
    const { data, error } = await db
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Delete a service. The DB policy blocks this if active cases reference it.
  // To deactivate without deleting, use updateService(id, { active: false }).
  async function deleteService(serviceId) {
    if (!db) return;
    const { error } = await db.from('services').delete().eq('id', serviceId);
    if (error) throw error;
  }

  // ── Cases ─────────────────────────────────────────────────────
  // fetchCases for a technician must first resolve the lab_id —
  // you cannot filter on a PostgREST alias with .eq().
  async function fetchCases(role, userId) {
    if (!db) return null;
    let labId = null;
    if (role === 'technician') {
      const { data: lab, error: le } = await db
        .from('labs')
        .select('id')
        .eq('owner_id', userId)
        .single();
      if (le || !lab) { console.error('fetchCases: lab lookup failed', le?.message); return []; }
      labId = lab.id;
    }

    const q = db
      .from('cases')
      .select('*, service:services(*), lab:labs(*, owner:profiles(full_name)), dentist:profiles!dentist_id(full_name)')
      .eq('archived', false)
      .order('created_at', { ascending: false });

    const { data, error } = await (
      role === 'dentist'
        ? q.eq('dentist_id', userId)
        : q.eq('lab_id', labId)
    );
    if (error) { console.error('fetchCases:', error.message); return null; }
    return data;
  }

  async function fetchArchivedCases(role, userId) {
    if (isMock(userId)) {
      const mock = window.CHAIRSIDE_MOCK_DATA;
      if (!mock) return [];
      return role === 'dentist' ? mock.ARCHIVED_DENT : mock.ARCHIVED_TECH;
    }
    let labId = null;
    if (role === 'technician') {
      const { data: lab } = await db.from('labs').select('id').eq('owner_id', userId).single();
      if (!lab) return [];
      labId = lab.id;
    }
    const q = db
      .from('cases')
      .select('*, service:services(*), lab:labs(*, owner:profiles(full_name)), dentist:profiles!dentist_id(full_name)')
      .eq('archived', true)
      .order('updated_at', { ascending: false });

    const { data, error } = await (
      role === 'dentist' ? q.eq('dentist_id', userId) : q.eq('lab_id', labId)
    );
    if (error) { console.error('fetchArchivedCases:', error.message); return null; }
    return data;
  }

  async function createCase(payload) {
    if (isMock(payload.dentist_id)) {
      const mock = window.CHAIRSIDE_MOCK_DATA;
      const allSvcs = (mock?.LABS || []).flatMap(l => l.services || []);
      const svc = allSvcs.find(s => s.id === payload.service_id) || null;
      const lab = (mock?.LABS || []).find(l => l.id === payload.lab_id) || null;
      const profile = (mock?.PROFILES || {})[payload.dentist_id];
      const now = new Date().toISOString();
      const newCase = {
        id: 'C-' + (5000 + Math.floor(Math.random() * 999)),
        lab_id: payload.lab_id,
        dentist_id: payload.dentist_id,
        service_id: payload.service_id,
        patient_ref: payload.patient_ref || null,
        notes: payload.notes || null,
        stage: 0,
        shade: null,
        payment_status: 'pending',
        payment_amount: null,
        archived: false,
        created_at: now,
        updated_at: now,
        service: svc,
        lab: lab ? { id: lab.id, name: lab.name, owner: lab.owner } : null,
        dentist: { full_name: profile?.full_name || 'Doctor' },
      };
      if (mock) {
        mock.CASES_DENTIST = [newCase, ...(mock.CASES_DENTIST || [])];
        mock.CASES_TECH    = [newCase, ...(mock.CASES_TECH    || [])];
        mock.MESSAGES      = mock.MESSAGES || {};
        mock.MESSAGES[newCase.id] = [{
          id: 'sys-' + newCase.id,
          case_id: newCase.id, sender_id: null,
          body: 'Case assigned — ' + new Date(now).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
          kind: 'system', metadata: {}, deleted_at: null, created_at: now,
          sender: { full_name: 'Chairside', role: 'system' },
        }];
      }
      return newCase;
    }
    const { data, error } = await db
      .from('cases')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function advanceCaseStage(caseId, newStage) {
    if (!db) return { id: caseId, stage: newStage };
    const { data, error } = await db
      .from('cases')
      .update({ stage: newStage })
      .eq('id', caseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateCaseNotes(caseId, updates) {
    // updates: { patient_ref?, notes?, shade? }
    if (!db) return { id: caseId, ...updates };
    const { data, error } = await db
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateCasePayment(caseId, status, amount) {
    if (!db) return { id: caseId, payment_status: status, payment_amount: amount ?? null };
    const { data, error } = await db
      .from('cases')
      .update({ payment_status: status, payment_amount: amount ?? undefined })
      .eq('id', caseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Soft-delete: sets archived = true. Neither side ever hard-deletes a case
  // so the message and attachment history is always preserved.
  async function archiveCase(caseId) {
    if (!db) return null;
    const { data, error } = await db
      .from('cases')
      .update({ archived: true })
      .eq('id', caseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function restoreCase(caseId) {
    if (!db) return null;
    const { data, error } = await db
      .from('cases')
      .update({ archived: false })
      .eq('id', caseId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ── Attachments ───────────────────────────────────────────────
  async function fetchAttachments(caseId) {
    if (!db) return null;
    const { data, error } = await db
      .from('attachments')
      .select('*, uploader:profiles(full_name)')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    if (error) { console.error('fetchAttachments:', error.message); return null; }
    return data;
  }

  async function uploadAttachment(caseId, uploaderId, file, label) {
    if (!db) return null;
    const ext = file.name.split('.').pop();
    const path = `${caseId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await db.storage
      .from('case-attachments')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data, error } = await db
      .from('attachments')
      .insert({ case_id: caseId, uploader_id: uploaderId, label, storage_path: path, mime_type: file.type })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Deletes both the storage object and the metadata row.
  async function deleteAttachment(attachmentId, storagePath) {
    if (!db) return;
    const { error: storageError } = await db.storage
      .from('case-attachments')
      .remove([storagePath]);
    if (storageError) throw storageError;

    const { error } = await db.from('attachments').delete().eq('id', attachmentId);
    if (error) throw error;
  }

  async function getAttachmentUrl(storagePath) {
    if (!db) return null;
    const { data } = await db.storage
      .from('case-attachments')
      .createSignedUrl(storagePath, 3600); // 1-hour signed URL
    return data?.signedUrl ?? null;
  }

  // ── Messages ─────────────────────────────────────────────────
  async function fetchMessages(caseId) {
    if (!db) return null;
    const { data, error } = await db
      .from('messages')
      .select('*, sender:profiles(full_name, role)')
      .eq('case_id', caseId)
      .is('deleted_at', null)           // exclude soft-deleted messages
      .order('created_at', { ascending: true });
    if (error) { console.error('fetchMessages:', error.message); return null; }
    return data;
  }

  async function sendMessage(caseId, senderId, body, kind = 'text', metadata = {}) {
    if (!db) {
      const mock = window.CHAIRSIDE_MOCK_DATA;
      const p = (mock?.PROFILES || {})[senderId];
      const msg = {
        id: 'mock-' + Date.now(),
        case_id: caseId, sender_id: senderId,
        body, kind, metadata,
        deleted_at: null, created_at: new Date().toISOString(),
        sender: { full_name: p?.full_name || 'You', role: p?.role || 'dentist' },
      };
      if (_msgCbs[caseId]) _msgCbs[caseId](msg);
      return msg;
    }
    const { data, error } = await db
      .from('messages')
      .insert({ case_id: caseId, sender_id: senderId, body, kind, metadata })
      .select('*, sender:profiles(full_name, role)')
      .single();
    if (error) throw error;
    return data;
  }

  // Soft-delete: sets deleted_at = now(). The message row stays so system
  // events and stage history remain intact.
  async function deleteMessage(messageId) {
    if (!db) return;
    const { error } = await db
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
  }

  // ── Real-time subscriptions ───────────────────────────────────
  function subscribeToMessages(caseId, onInsert) {
    if (!db) {
      _msgCbs[caseId] = onInsert;
      return () => { delete _msgCbs[caseId]; };
    }
    const channel = db
      .channel(`messages:${caseId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `case_id=eq.${caseId}`,
      }, payload => onInsert(payload.new))
      .subscribe();
    return () => db.removeChannel(channel);
  }

  function subscribeToCase(caseId, onChange) {
    if (!db) return () => {};
    const channel = db
      .channel(`case:${caseId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'cases',
        filter: `id=eq.${caseId}`,
      }, payload => onChange(payload.new))
      .subscribe();
    return () => db.removeChannel(channel);
  }

  // ── React hooks ──────────────────────────────────────────────

  // Fetch the profile, creating it from auth metadata if it doesn't exist yet.
  // This handles the email-confirmation flow: user confirms → logs in → no profile
  // row exists yet (trigger was blocked by RLS, upsert was skipped). We create it
  // here using the now-valid session.
  async function ensureProfile(user) {
    let p = await getProfile(user.id);
    if (!p) {
      const meta = user.user_metadata || {};
      const { error } = await db.from('profiles').upsert({
        id: user.id,
        role: meta.role || 'dentist',
        full_name: meta.full_name || user.email,
      }, { onConflict: 'id' });
      if (!error) p = await getProfile(user.id);
    }
    return p;
  }

  function useAuth() {
    const [session, setSession] = React.useState(null);
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      if (!db) { setLoading(false); return; }

      getSession().then(async s => {
        setSession(s);
        if (s?.user) setProfile(await ensureProfile(s.user));
        setLoading(false);
      });

      return onAuthStateChange(async (_event, s) => {
        setSession(s);
        if (s?.user) setProfile(await ensureProfile(s.user));
        else setProfile(null);
      });
    }, []);

    return { session, profile, loading, isConfigured };
  }

  function useCases(role, userId) {
    const [cases, setCases] = React.useState(null);
    React.useEffect(() => {
      if (isMock(userId)) {
        const mock = window.CHAIRSIDE_MOCK_DATA;
        setCases(mock ? (role === 'dentist' ? mock.CASES_DENTIST : mock.CASES_TECH) : []);
        return;
      }
      if (!userId) { setCases([]); return; }
      fetchCases(role, userId).then(data => setCases(data ?? []));
    }, [role, userId]);
    return cases;
  }

  function useMyLab(userId) {
    const [lab, setLab] = React.useState(undefined);
    React.useEffect(() => {
      if (isMock(userId)) {
        setLab(window.CHAIRSIDE_MOCK_DATA?.MY_LAB || null);
        return;
      }
      if (!userId) { setLab(null); return; }
      fetchMyLab(userId).then(data => setLab(data));
    }, [userId]);
    return lab; // undefined=loading, null=no lab, object=found
  }

  function useMyClinic(userId) {
    const [clinic, setClinic] = React.useState(undefined);
    React.useEffect(() => {
      if (isMock(userId)) {
        setClinic(window.CHAIRSIDE_MOCK_DATA?.MY_CLINIC || null);
        return;
      }
      if (!userId) { setClinic(null); return; }
      fetchMyClinic(userId).then(data => setClinic(data));
    }, [userId]);
    return clinic;
  }

  function useMessages(caseId) {
    const [messages, setMessages] = React.useState(null);
    React.useEffect(() => {
      if (!caseId) return;
      const onInsert = msg => setMessages(prev => prev ? [...prev, msg] : [msg]);
      if (!db) {
        const mock = window.CHAIRSIDE_MOCK_DATA;
        setMessages([...((mock?.MESSAGES || {})[caseId] || [])]);
      } else {
        fetchMessages(caseId).then(data => { if (data !== null) setMessages(data); });
      }
      return subscribeToMessages(caseId, onInsert);
    }, [caseId]);
    return [messages, setMessages];
  }

  function useLabs() {
    const [labs, setLabs] = React.useState(null);
    React.useEffect(() => {
      if (!db) {
        setLabs(window.CHAIRSIDE_MOCK_DATA?.LABS || []);
        return;
      }
      fetchLabs().then(data => { if (data !== null) setLabs(data); });
    }, []);
    return labs;
  }

  // ── Export ───────────────────────────────────────────────────
  window.CHAIRSIDE_SUPABASE = {
    client: db,
    isConfigured,

    // Auth
    signUp, signIn, signOut,
    onAuthStateChange, getSession, getProfile, updateProfile,

    // Labs
    fetchLabs, createLab, updateLab, deleteLab,

    // Services
    createService, updateService, deleteService,

    // Cases
    fetchCases, fetchArchivedCases,
    createCase, advanceCaseStage,
    updateCaseNotes, updateCasePayment,
    archiveCase, restoreCase,

    // Attachments
    fetchAttachments, uploadAttachment, deleteAttachment, getAttachmentUrl,

    // Messages
    fetchMessages, sendMessage, deleteMessage,

    // Real-time
    subscribeToMessages, subscribeToCase,

    // Labs (extras)
    fetchMyLab, fetchMyClinic,

    // Hooks
    useAuth, useCases, useMessages, useLabs, useMyLab, useMyClinic,
  };
})();
