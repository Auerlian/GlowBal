const STORAGE_KEY = 'glowbal_leads_v1';

const VIETNAMESE_NAMES = [
  'Nguyễn Minh Anh', 'Trần Quỳnh Trang', 'Lê Hoàng Nam', 'Phạm Gia Hân', 'Võ Quốc Bảo', 'Đặng Khánh Linh',
  'Bùi Anh Thư', 'Đỗ Nhật Minh', 'Ngô Phương Anh', 'Dương Tuấn Kiệt', 'Hoàng Ngọc Mai', 'Phan Gia Huy',
  'Lý Tường Vy', 'Vũ Hải Đăng', 'Trịnh Bảo Ngọc', 'Hồ Đức Anh', 'Đinh Khánh Vy', 'Mai Quốc Việt'
];

const INTERNATIONAL_ASIAN_NAMES = [
  '林美玲', '王子涵', '陈伟', '山田太郎', '佐藤美咲', '김민준', '이지은', 'ธนกฤต ศรีวงศ์',
  'Putri Lestari', 'Rizky Pratama', 'Siti Aisyah', 'Aarav Sharma', 'Priya Nair', 'Nur Amina'
];

const OTHER_INTERNATIONAL_NAMES = [
  'Sofia Rossi', 'Mateo Silva', 'Amelia Clarke', 'Noah Martin', 'Lea Dubois', 'Daniel Novak', 'Hana Petrova'
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

const pickNamePool = (idx = 0) => {
  // 75% Vietnamese, 20% Asian, 5% other
  const bucket = idx % 20;
  if (bucket < 15) return VIETNAMESE_NAMES;
  if (bucket < 19) return INTERNATIONAL_ASIAN_NAMES;
  return OTHER_INTERNATIONAL_NAMES;
};

const buildDateBuckets = () => {
  const start = new Date(SIGNUP_START_ISO);
  const today = new Date();
  const days = [];

  for (let i = 0; ; i += 1) {
    const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    if (d > today) break;

    const progress = i / Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    const startSpike = Math.exp(-Math.pow((progress - 0.08) / 0.08, 2));
    const endSpike = Math.exp(-Math.pow((progress - 0.92) / 0.08, 2));
    const baseline = 0.22 + 0.18 * Math.sin(progress * Math.PI * 1.6);

    const weekday = d.getDay();
    const weekendFactor = weekday === 0 || weekday === 6 ? 0.78 : 1;
    const noise = 0.9 + Math.random() * 0.25;

    const weight = Math.max(0.03, (baseline + startSpike * 1.75 + endSpike * 1.95) * weekendFactor * noise);
    days.push({ date: d, weight });
  }

  return days;
};

const sampleWeightedDay = (buckets) => {
  const total = buckets.reduce((sum, b) => sum + b.weight, 0);
  let roll = Math.random() * total;
  for (const bucket of buckets) {
    roll -= bucket.weight;
    if (roll <= 0) return bucket.date;
  }
  return buckets[buckets.length - 1]?.date || new Date();
};

const createFakeLead = (idx = 0, sampledDate = new Date()) => {
  const pool = pickNamePool(idx);
  const name = pool[idx % pool.length];
  const dayStart = new Date(sampledDate);
  dayStart.setHours(0, 0, 0, 0);

  const createdAtMs = dayStart.getTime()
    + Math.floor((8 + Math.random() * 13) * 60 * 60 * 1000)
    + Math.floor(Math.random() * 60 * 60 * 1000);

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

export const seedFakeLeads = (count = 142) => {
  const buckets = buildDateBuckets();
  const generated = Array.from({ length: count }).map((_, idx) => createFakeLead(idx, sampleWeightedDay(buckets)));
  generated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  setLeads(generated);
  return generated;
};

export const ensureLeadCount = (targetCount = 142) => {
  const existing = getLeads();
  if (existing.length >= targetCount) return existing;

  const buckets = buildDateBuckets();
  const seenEmails = new Set(existing.map((lead) => lead.email));
  const next = [...existing];
  let idx = existing.length;

  while (next.length < targetCount) {
    const candidate = createFakeLead(idx, sampleWeightedDay(buckets));
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
