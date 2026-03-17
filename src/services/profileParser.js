const FIELD_KEYWORDS = {
  'Engineering & Tech': ['engineer', 'software', 'computer science', 'data science', 'ai', 'machine learning', 'electrical', 'mechanical', 'technology', 'it '],
  'Business & Economics': ['business', 'finance', 'economics', 'marketing', 'management', 'accounting', 'entrepreneur'],
  'Arts & Humanities': ['history', 'literature', 'philosophy', 'arts', 'design', 'media', 'language'],
  'Life & Medical Sciences': ['medicine', 'medical', 'biology', 'biomedical', 'pharmacy', 'public health', 'nursing', 'chemistry'],
  'Social Sciences': ['psychology', 'sociology', 'politics', 'international relations', 'law', 'education']
};

const DEGREE_PATTERNS = [
  { label: 'Doctorate (PhD)', regex: /\b(phd|doctorate|doctoral)\b/i },
  { label: 'Postgraduate (Masters)', regex: /\b(masters|msc|ma|mba|postgraduate)\b/i },
  { label: 'Undergraduate (Bachelors)', regex: /\b(bachelor|bsc|ba|undergraduate)\b/i }
];

const normalizeText = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');

const scoreFields = (text) => {
  const normalized = normalizeText(text);
  return Object.entries(FIELD_KEYWORDS)
    .map(([field, keywords]) => ({
      field,
      score: keywords.reduce((sum, keyword) => sum + (normalized.includes(keyword) ? 1 : 0), 0)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
};

export const parseProfileSignals = async (file) => {
  if (!file) {
    return {
      inferredFields: [],
      inferredDegree: null,
      confidence: 'low'
    };
  }

  let textSample = '';
  try {
    // Works for txt/most plain documents; PDFs may produce partial text depending on browser support.
    textSample = await file.text();
  } catch {
    textSample = '';
  }

  const combined = `${file.name || ''} ${textSample.slice(0, 12000)}`;
  const fieldScores = scoreFields(combined);
  const inferredFields = fieldScores.slice(0, 2).map((entry) => entry.field);

  const degreeMatch = DEGREE_PATTERNS.find((pattern) => pattern.regex.test(combined));

  return {
    inferredFields,
    inferredDegree: degreeMatch?.label || null,
    confidence: textSample ? 'medium' : 'low'
  };
};
