const DEGREE_PATTERNS = [
  {
    label: 'Doctorate (PhD)',
    regex: /\b(ph\.?d|doctorate|doctoral|dphil)\b/i,
    signal: 'doctoral_terms'
  },
  {
    label: 'Postgraduate (Masters)',
    regex: /\b(master'?s|msc|ma\b|meng|mba|postgraduate)\b/i,
    signal: 'masters_terms'
  },
  {
    label: 'Undergraduate (Bachelors)',
    regex: /\b(bachelor'?s|bsc|ba\b|undergraduate|a-?levels?)\b/i,
    signal: 'undergrad_terms'
  }
];

const SUBJECT_KEYWORDS = {
  'Engineering & Tech': ['engineering', 'computer science', 'software', 'data science', 'ai', 'machine learning', 'robotics', 'it'],
  'Business & Economics': ['business', 'economics', 'finance', 'accounting', 'marketing', 'entrepreneurship'],
  'Arts & Humanities': ['history', 'literature', 'philosophy', 'design', 'music', 'creative writing', 'arts'],
  'Life & Medical Sciences': ['biology', 'medicine', 'medical', 'biomedical', 'neuroscience', 'pharmacy', 'chemistry'],
  'Social Sciences': ['psychology', 'sociology', 'politics', 'international relations', 'law', 'anthropology']
};

const REGION_CUES = {
  Europe: ['uk', 'europe', 'germany', 'france', 'netherlands', 'sweden', 'spain', 'italy'],
  'North America': ['usa', 'united states', 'canada', 'north america'],
  Asia: ['asia', 'singapore', 'japan', 'china', 'south korea', 'hong kong'],
  Oceania: ['australia', 'new zealand', 'oceania'],
  Africa: ['africa', 'south africa', 'kenya', 'nigeria', 'ghana'],
  'South America': ['south america', 'brazil', 'argentina', 'chile', 'colombia']
};

const WORK_HINTS = {
  'Yes, for experience only': ['internship', 'placement', 'work experience', 'part-time', 'startup'],
  'Yes, to cover living costs': ['support myself', 'cover expenses', 'financial need', 'working student'],
  'No, I want to focus on studies': ['full-time student', 'focus on academics', 'research focused']
};

const countMatches = (text, terms) =>
  terms.reduce((total, term) => total + (text.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')) || []).length, 0);

const bestByCount = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0] || [null, 0];

export const buildProfileFromText = (rawText = '') => {
  const text = rawText.toLowerCase();

  const degreeHit = DEGREE_PATTERNS.find((item) => item.regex.test(rawText));

  const subjectCounts = Object.fromEntries(
    Object.entries(SUBJECT_KEYWORDS).map(([label, terms]) => [label, countMatches(text, terms)])
  );
  const [subjectIntent, subjectScore] = bestByCount(subjectCounts);

  const regionCounts = Object.fromEntries(
    Object.entries(REGION_CUES).map(([region, terms]) => [region, countMatches(text, terms)])
  );

  const regionPreferences = Object.entries(regionCounts)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([region]) => region);

  const workCounts = Object.fromEntries(
    Object.entries(WORK_HINTS).map(([option, terms]) => [option, countMatches(text, terms)])
  );
  const [workIntent, workScore] = bestByCount(workCounts);

  const yearsExperienceMatch = rawText.match(/(\d+)\+?\s+years?\s+(of\s+)?experience/i);

  const inferredAnswers = {};
  if (degreeHit?.label) inferredAnswers.q_degree = [degreeHit.label];
  if (subjectIntent && subjectScore > 0) inferredAnswers.q_field = [subjectIntent];
  if (regionPreferences.length > 0) inferredAnswers.q_continent = regionPreferences;
  if (workIntent && workScore > 0) inferredAnswers.q_work = [workIntent];

  return {
    inferredAnswers,
    summary: {
      degreeIntent: degreeHit?.label || null,
      subjectKeywords: Object.entries(subjectCounts)
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([label]) => label)
        .slice(0, 3),
      regionPreferences,
      workHints: workIntent && workScore > 0 ? [workIntent] : [],
      yearsExperience: yearsExperienceMatch ? Number(yearsExperienceMatch[1]) : null
    },
    confidence: {
      degree: degreeHit ? 0.8 : 0,
      subject: subjectScore > 0 ? Math.min(1, subjectScore / 6) : 0,
      region: regionPreferences.length > 0 ? Math.min(1, regionPreferences.length / 2) : 0,
      work: workScore > 0 ? Math.min(1, workScore / 3) : 0
    }
  };
};
