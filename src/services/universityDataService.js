const COUNTRY_REGION = {
  'United States': 'North America',
  Canada: 'North America',
  'United Kingdom': 'Europe',
  Germany: 'Europe',
  France: 'Europe',
  Netherlands: 'Europe',
  Sweden: 'Europe',
  Switzerland: 'Europe',
  Australia: 'Oceania',
  Singapore: 'Asia',
  Japan: 'Asia',
  'South Korea': 'Asia',
  China: 'Asia',
  India: 'Asia'
};

const COUNTRY_BUDGET_BAND = {
  'United States': 'high',
  Canada: 'high',
  'United Kingdom': 'high',
  Australia: 'high',
  Singapore: 'high',
  Germany: 'medium',
  France: 'medium',
  Netherlands: 'medium',
  Sweden: 'medium',
  Switzerland: 'high',
  Japan: 'medium',
  'South Korea': 'medium',
  China: 'medium',
  India: 'low'
};

const REGION_TO_COUNTRIES = {
  'North America': ['United States', 'Canada'],
  Europe: ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden'],
  Asia: ['Singapore', 'Japan', 'South Korea', 'China', 'India'],
  Oceania: ['Australia']
};

const FALLBACK_UNIVERSITIES = [
  { name: 'University of Oxford', country: 'United Kingdom', domain: 'ox.ac.uk', link: 'https://www.ox.ac.uk/' },
  { name: 'University of Cambridge', country: 'United Kingdom', domain: 'cam.ac.uk', link: 'https://www.cam.ac.uk/' },
  { name: 'Massachusetts Institute of Technology', country: 'United States', domain: 'mit.edu', link: 'https://www.mit.edu/' },
  { name: 'Stanford University', country: 'United States', domain: 'stanford.edu', link: 'https://www.stanford.edu/' },
  { name: 'University of Toronto', country: 'Canada', domain: 'utoronto.ca', link: 'https://www.utoronto.ca/' },
  { name: 'University of Melbourne', country: 'Australia', domain: 'unimelb.edu.au', link: 'https://www.unimelb.edu.au/' },
  { name: 'Technical University of Munich', country: 'Germany', domain: 'tum.de', link: 'https://www.tum.de/' },
  { name: 'École Polytechnique', country: 'France', domain: 'polytechnique.edu', link: 'https://www.polytechnique.edu/' },
  { name: 'National University of Singapore', country: 'Singapore', domain: 'nus.edu.sg', link: 'https://www.nus.edu.sg/' },
  { name: 'University of Tokyo', country: 'Japan', domain: 'u-tokyo.ac.jp', link: 'https://www.u-tokyo.ac.jp/en/' }
];

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const inferSubjectStrength = (name = '') => {
  const n = name.toLowerCase();
  const tags = new Set();

  if (/(tech|institute of technology|polytechnic|engineering|computer)/.test(n)) tags.add('Engineering & Tech');
  if (/(business|management|economics|commerce|finance)/.test(n)) tags.add('Business & Economics');
  if (/(medical|health|medicine|biological|pharmacy)/.test(n)) tags.add('Life & Medical Sciences');
  if (/(arts|humanities|design|media|language)/.test(n)) tags.add('Arts & Humanities');
  if (/(social|law|education|politic|international)/.test(n)) tags.add('Social Sciences');

  if (!tags.size) {
    tags.add('Engineering & Tech');
    tags.add('Business & Economics');
    tags.add('Social Sciences');
  }

  return [...tags];
};

const normalizeInstitution = (item) => {
  const country = item.country || item.alpha_two_code || 'Unknown';
  const link = (item.web_pages && item.web_pages[0]) || item.link || null;
  const domain = (item.domains && item.domains[0]) || item.domain || null;

  if (!link || !domain || !item.name) return null;

  const safeLink = link.startsWith('http') ? link : `https://${link}`;
  const region = COUNTRY_REGION[country] || 'Global';

  return {
    id: slugify(`${item.name}-${country}`),
    name: item.name,
    location: country,
    country,
    region,
    image: `https://logo.clearbit.com/${domain}`,
    link: safeLink,
    desc: `${item.name} (${country}) with publicly available programme information and admissions guidance.`,
    budgetBand: COUNTRY_BUDGET_BAND[country] || 'medium',
    subjectStrength: inferSubjectStrength(item.name),
    classSizeTendency: 'medium',
    climate: 'Distinct 4 Seasons',
    competitiveness: 'high',
    campusEnvironment: 'Bustling City Center',
    socialScene: 'moderate',
    partTimeFriendly: 'experience',
    degreeLevels: ['Undergraduate (Bachelors)', 'Postgraduate (Masters)', 'Doctorate (PhD)', 'Short Course/Certificate']
  };
};

const uniqueById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const fetchByCountry = async (country) => {
  const res = await fetch(`https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`);
  if (!res.ok) throw new Error(`Failed to load universities for ${country}`);
  return res.json();
};

const selectCountries = (answers = {}) => {
  const preferredContinents = answers.q_continent || [];
  const countries = preferredContinents.flatMap((region) => REGION_TO_COUNTRIES[region] || []);

  if (!countries.length) {
    return ['United Kingdom', 'United States', 'Canada', 'Germany', 'Australia'];
  }

  return [...new Set(countries)].slice(0, 5);
};

export const getUniversityCandidates = async (answers = {}) => {
  const countries = selectCountries(answers);

  try {
    const liveBatches = await Promise.all(countries.map((country) => fetchByCountry(country)));
    const live = uniqueById(liveBatches.flat().map(normalizeInstitution)).slice(0, 30);

    if (live.length >= 6) {
      return { source: 'live', universities: live };
    }

    const fallback = uniqueById(FALLBACK_UNIVERSITIES.map(normalizeInstitution));
    return { source: 'live+fallback', universities: uniqueById([...live, ...fallback]).slice(0, 30) };
  } catch {
    return {
      source: 'fallback',
      universities: uniqueById(FALLBACK_UNIVERSITIES.map(normalizeInstitution))
    };
  }
};
