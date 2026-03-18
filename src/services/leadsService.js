const STORAGE_KEY = 'glowbal_leads_v1';

const FIRST_NAMES = ['James', 'Sophie', 'Ethan', 'Maya', 'Daniel', 'Ava', 'Noah', 'Amelia', 'Leo', 'Isla', 'Arjun', 'Zara', 'Omar', 'Hannah', 'Alex', 'Luca', 'Nina', 'Mateo', 'Freya', 'Sam'];
const LAST_NAMES = ['Patel', 'Carter', 'Smith', 'Khan', 'Wright', 'Turner', 'Walker', 'Ali', 'Johnson', 'Evans', 'Brown', 'Taylor', 'Green', 'Hall', 'Baker'];
const GOALS = [
  'Find top CS programs in Europe',
  'Scholarship options for UK business degrees',
  'Affordable engineering universities',
  'Best data science courses with internships',
  'Universities with strong international support',
  'Target/safety shortlist for medicine',
  'Good AI and robotics programs',
  'Universities with strong debate societies'
];

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

  const signupApi = import.meta.env.VITE_SIGNUP_API_URL;
  if (signupApi) {
    try {
      await fetch(signupApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          goal: payload.goal,
          source: payload.source,
          appLink: `${window.location.origin}${import.meta.env.BASE_URL}?app=1`
        })
      });
    } catch {
      // Non-fatal: lead still stored in local CRM.
    }
  }

  return payload;
};

const createFakeLead = (idx = 0, daysBack = 60) => {
  const now = Date.now();
  const first = FIRST_NAMES[idx % FIRST_NAMES.length];
  const last = LAST_NAMES[(idx * 3) % LAST_NAMES.length];
  const createdAtMs = now - Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000);
  const createdAt = new Date(createdAtMs).toISOString();
  const updatedAt = new Date(createdAtMs + Math.floor(Math.random() * 36 * 60 * 60 * 1000)).toISOString();
  const email = `${first}.${last}${100 + idx}@${idx % 2 === 0 ? 'gmail.com' : 'outlook.com'}`.toLowerCase();

  return {
    id: crypto.randomUUID(),
    name: `${first} ${last}`,
    email,
    goal: GOALS[idx % GOALS.length],
    source: idx % 4 === 0 ? 'instagram' : idx % 3 === 0 ? 'tiktok' : 'landing-signup',
    createdAt,
    updatedAt
  };
};

export const seedFakeLeads = (count = 213, daysBack = 60) => {
  const generated = Array.from({ length: count }).map((_, idx) => createFakeLead(idx, daysBack));
  generated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  setLeads(generated);
  return generated;
};

export const ensureLeadCount = (targetCount = 213, daysBack = 60) => {
  const existing = getLeads();
  if (existing.length >= targetCount) return existing;

  const seenEmails = new Set(existing.map((lead) => lead.email));
  const next = [...existing];
  let idx = existing.length;

  while (next.length < targetCount) {
    const candidate = createFakeLead(idx, daysBack);
    idx += 1;
    if (seenEmails.has(candidate.email)) continue;
    seenEmails.add(candidate.email);
    next.push(candidate);
  }

  next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  setLeads(next);
  return next;
};

export const validateLeadData = (leads = getLeads()) => {
  const duplicates = new Set();
  const seen = new Set();
  let missingFields = 0;

  leads.forEach((lead) => {
    if (!lead?.name || !lead?.email || !lead?.createdAt) missingFields += 1;
    if (seen.has(lead.email)) duplicates.add(lead.email);
    seen.add(lead.email);
  });

  const now = Date.now();
  const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
  const inRangeCount = leads.filter((lead) => {
    const t = new Date(lead.createdAt).getTime();
    return Number.isFinite(t) && t >= sixtyDaysAgo && t <= now;
  }).length;

  return {
    total: leads.length,
    uniqueEmails: seen.size,
    duplicateEmails: duplicates.size,
    missingFields,
    inRangeCount,
    pass: duplicates.size === 0 && missingFields === 0
  };
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
