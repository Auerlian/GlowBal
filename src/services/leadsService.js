const STORAGE_KEY = 'glowbal_leads_v1';

const VIETNAMESE_NAMES = [
  'Nguyễn Minh Anh', 'Trần Quỳnh Trang', 'Lê Hoàng Nam', 'Phạm Gia Hân', 'Võ Quốc Bảo', 'Đặng Khánh Linh',
  'Bùi Anh Thư', 'Đỗ Nhật Minh', 'Ngô Phương Anh', 'Dương Tuấn Kiệt', 'Hoàng Ngọc Mai', 'Phan Gia Huy',
  'Lý Tường Vy', 'Vũ Hải Đăng', 'Trịnh Bảo Ngọc', 'Hồ Đức Anh', 'Đinh Khánh Vy', 'Mai Quốc Việt'
];

const INTERNATIONAL_ASIAN_NAMES = [
  '林美玲', '王子涵', '陈伟', '山田太郎', '佐藤美咲', '김민준', '이지은', 'ธนกฤต ศรีวงศ์', 'Putri Lestari',
  'Aarav Sharma', 'Priya Nair', 'Nur Aisyah', 'Hiro Tanaka', 'Siti Amina', 'Nguyễn Hải Đăng', 'Trần Bảo Châu'
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com.vn', 'outlook.com', 'icloud.com', 'proton.me', 'student.hcmus.edu.vn'];
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

const SIGNUP_START_ISO = '2026-02-05T00:00:00.000Z';

const toEmailSlug = (name = '', idx = 0) => {
  const translit = name
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join('.');

  return translit || `student${100 + idx}`;
};

const createFakeLead = (idx = 0) => {
  const now = Date.now();
  const start = new Date(SIGNUP_START_ISO).getTime();
  const useVietnamese = idx % 5 !== 0;
  const pool = useVietnamese ? VIETNAMESE_NAMES : INTERNATIONAL_ASIAN_NAMES;
  const name = pool[idx % pool.length];
  const createdAtMs = start + Math.floor(Math.random() * Math.max(now - start, 1));
  const createdAt = new Date(createdAtMs).toISOString();
  const updatedAt = new Date(createdAtMs + Math.floor(Math.random() * 36 * 60 * 60 * 1000)).toISOString();
  const emailLocal = toEmailSlug(name, idx);
  const email = `${emailLocal}${100 + idx}@${EMAIL_DOMAINS[idx % EMAIL_DOMAINS.length]}`.toLowerCase();

  return {
    id: crypto.randomUUID(),
    name,
    email,
    goal: GOALS[idx % GOALS.length],
    source: idx % 4 === 0 ? 'instagram' : idx % 3 === 0 ? 'tiktok' : 'landing-signup',
    createdAt,
    updatedAt
  };
};

export const seedFakeLeads = (count = 213) => {
  const generated = Array.from({ length: count }).map((_, idx) => createFakeLead(idx));
  generated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  setLeads(generated);
  return generated;
};

export const ensureLeadCount = (targetCount = 213) => {
  const existing = getLeads();
  if (existing.length >= targetCount) return existing;

  const seenEmails = new Set(existing.map((lead) => lead.email));
  const next = [...existing];
  let idx = existing.length;

  while (next.length < targetCount) {
    const candidate = createFakeLead(idx);
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
  const start = new Date(SIGNUP_START_ISO).getTime();
  const inRangeCount = leads.filter((lead) => {
    const t = new Date(lead.createdAt).getTime();
    return Number.isFinite(t) && t >= start && t <= now;
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
