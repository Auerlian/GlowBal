const STORAGE_KEY = 'glowbal_leads_v1';

const safeJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const getLeads = () => {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return Array.isArray(safeJson(raw, [])) ? safeJson(raw, []) : [];
};

const setLeads = (leads) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
};

export const addLead = async ({ name, email, goal }) => {
  const leads = getLeads();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const existing = leads.find((lead) => lead.email === normalizedEmail);

  const payload = {
    id: existing?.id || crypto.randomUUID(),
    name: (name || '').trim(),
    email: normalizedEmail,
    goal: (goal || '').trim(),
    source: 'landing-signup',
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const next = existing
    ? leads.map((lead) => (lead.email === normalizedEmail ? payload : lead))
    : [payload, ...leads];

  setLeads(next);

  const webhook = import.meta.env.VITE_LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'glowbal.lead_signup',
          lead: payload,
          appLink: `${window.location.origin}${import.meta.env.BASE_URL}?app=1`,
          emailTemplate: 'glowbal_welcome_shortlist_invite'
        })
      });
    } catch {
      // Non-fatal: lead still stored in local CRM.
    }
  }

  return payload;
};

export const exportLeadsCsv = () => {
  const leads = getLeads();
  const headers = ['name', 'email', 'goal', 'source', 'createdAt', 'updatedAt'];
  const lines = [headers.join(',')];

  leads.forEach((lead) => {
    const row = headers.map((key) => {
      const value = String(lead[key] || '').replace(/"/g, '""');
      return `"${value}"`;
    });
    lines.push(row.join(','));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `glowbal-leads-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
