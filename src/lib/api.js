// API client — all REST calls go to Express backend
// Token is read from localStorage each call so it stays fresh after refresh

function getToken() {
  try { return JSON.parse(localStorage.getItem('cs_session') || 'null')?.token ?? null; }
  catch { return null; }
}

async function fetchAPI(path, options = {}) {
  const token = getToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => ({ error: res.statusText }));
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export const api = {
  auth: {
    phoneLogin:    (phone) => fetchAPI('/auth/phone-login', { method: 'POST', body: JSON.stringify({ phone }) }),
    me:            ()      => fetchAPI('/auth/me'),
    updateProfile: (data)  => fetchAPI('/auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  cases: {
    list:          ()             => fetchAPI('/cases'),
    archive:       ()             => fetchAPI('/cases/archive'),
    get:           (id)           => fetchAPI(`/cases/${id}`),
    create:        (data)         => fetchAPI('/cases', { method: 'POST', body: JSON.stringify(data) }),
    updateStage:   (id, stage)    => fetchAPI(`/cases/${id}/stage`, { method: 'PATCH', body: JSON.stringify({ stage }) }),
    updatePayment: (id, data)     => fetchAPI(`/cases/${id}/payment`, { method: 'PATCH', body: JSON.stringify(data) }),
    doArchive:     (id)           => fetchAPI(`/cases/${id}/archive`, { method: 'PATCH' }),
  },

  labs: {
    list:     ()     => fetchAPI('/labs'),
    get:      (id)   => fetchAPI(`/labs/${id}`),
    mine:     ()     => fetchAPI('/labs/mine'),
    updateMine: (d)  => fetchAPI('/labs/mine', { method: 'PATCH', body: JSON.stringify(d) }),
  },

  services: {
    forLab:    (labId) => fetchAPI(`/services/lab/${labId}`),
    mine:      ()      => fetchAPI('/services/mine'),
    create:    (data)  => fetchAPI('/services', { method: 'POST', body: JSON.stringify(data) }),
    update:    (id, d) => fetchAPI(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
    remove:    (id)    => fetchAPI(`/services/${id}`, { method: 'DELETE' }),
    getTemplates: (id) => fetchAPI(`/services/${id}/templates`),
    putTemplates: (id, templates) => fetchAPI(`/services/${id}/templates`, { method: 'PUT', body: JSON.stringify({ templates }) }),
  },

  messages: {
    list: (caseId)       => fetchAPI(`/messages/${caseId}`),
    send: (caseId, data) => fetchAPI(`/messages/${caseId}`, { method: 'POST', body: JSON.stringify(data) }),
  },

  shade: {
    analyze: (data) => fetchAPI('/shade', { method: 'POST', body: JSON.stringify(data) }),
  },

  upload: {
    file: (caseId, file, label = '') => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      form.append('label', label);
      return fetch(`/api/upload/${caseId}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      }).then(r => r.json());
    },
    list: (caseId) => fetchAPI(`/upload/${caseId}`),
  },
};
