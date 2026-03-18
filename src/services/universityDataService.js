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

const LOCAL_IMAGE_FALLBACK = `${import.meta.env.BASE_URL}images/university-placeholder.svg`;


const FALLBACK_UNIVERSITIES = [
  {
    name: 'University of Oxford',
    country: 'United Kingdom',
    domain: 'ox.ac.uk',
    link: 'https://www.ox.ac.uk/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg/1280px-Radcliffe_Camera%2C_Oxford_-_Oct_2006.jpg'
  },
  {
    name: 'University of Cambridge',
    country: 'United Kingdom',
    domain: 'cam.ac.uk',
    link: 'https://www.cam.ac.uk/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/King%27s_College_Chapel%2C_Cambridge%2C_UK_-_Diliff.jpg/1280px-King%27s_College_Chapel%2C_Cambridge%2C_UK_-_Diliff.jpg'
  },
  {
    name: 'Massachusetts Institute of Technology',
    country: 'United States',
    domain: 'mit.edu',
    link: 'https://www.mit.edu/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_Dome_night1.jpg/1280px-MIT_Dome_night1.jpg'
  },
  {
    name: 'Stanford University',
    country: 'United States',
    domain: 'stanford.edu',
    link: 'https://www.stanford.edu/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Stanford_Memorial_Church_2011.jpg/1280px-Stanford_Memorial_Church_2011.jpg'
  },
  {
    name: 'University of Toronto',
    country: 'Canada',
    domain: 'utoronto.ca',
    link: 'https://www.utoronto.ca/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/University_College%2C_University_of_Toronto_%282015%29_-_2.jpg/1280px-University_College%2C_University_of_Toronto_%282015%29_-_2.jpg'
  },
  {
    name: 'University of Melbourne',
    country: 'Australia',
    domain: 'unimelb.edu.au',
    link: 'https://www.unimelb.edu.au/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Old_Arts_Building%2C_University_of_Melbourne.jpg/1280px-Old_Arts_Building%2C_University_of_Melbourne.jpg'
  },
  {
    name: 'Technical University of Munich',
    country: 'Germany',
    domain: 'tum.de',
    link: 'https://www.tum.de/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/TUM_Stammgelaende_2012.jpg/1280px-TUM_Stammgelaende_2012.jpg'
  },
  {
    name: 'École Polytechnique',
    country: 'France',
    domain: 'polytechnique.edu',
    link: 'https://www.polytechnique.edu/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/%C3%89cole_polytechnique_-_Palaiseau.jpg/1280px-%C3%89cole_polytechnique_-_Palaiseau.jpg'
  },
  {
    name: 'National University of Singapore',
    country: 'Singapore',
    domain: 'nus.edu.sg',
    link: 'https://www.nus.edu.sg/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/NUS_University_Hall.jpg/1280px-NUS_University_Hall.jpg'
  },
  {
    name: 'University of Tokyo',
    country: 'Japan',
    domain: 'u-tokyo.ac.jp',
    link: 'https://www.u-tokyo.ac.jp/en/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Yasuda_Auditorium_-_Tokyo_University_03.jpg/1280px-Yasuda_Auditorium_-_Tokyo_University_03.jpg'
  },
  {
    name: 'ETH Zurich',
    country: 'Switzerland',
    domain: 'ethz.ch',
    link: 'https://ethz.ch/en.html',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/ETH_Zentrum.jpg/1280px-ETH_Zentrum.jpg'
  },
  {
    name: 'Seoul National University',
    country: 'South Korea',
    domain: 'snu.ac.kr',
    link: 'https://en.snu.ac.kr/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Seoul_National_University_Main_Gate.jpg/1280px-Seoul_National_University_Main_Gate.jpg'
  }
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

const isHttpUrl = (value = '') => /^https?:\/\//i.test(value);

const normalizeDomain = (domain = '') => domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim().toLowerCase();

const normalizeOfficialLink = (link, domain) => {
  const normalizedDomain = normalizeDomain(domain);
  const safeLink = isHttpUrl(link) ? link : `https://${link || normalizedDomain}`;

  try {
    const parsed = new URL(safeLink);
    const host = normalizeDomain(parsed.hostname);
    if (normalizedDomain && host !== normalizedDomain && !host.endsWith(`.${normalizedDomain}`)) {
      return `https://${normalizedDomain}/`;
    }
    return safeLink;
  } catch {
    return normalizedDomain ? `https://${normalizedDomain}/` : null;
  }
};

const getUnsplashCampusUrl = (name) => `https://source.unsplash.com/1600x900/?${encodeURIComponent(`${name} university campus`)}`;

const flickrToLarge = (url = '') => {
  if (!url) return null;
  // Prefer large sizes first; if unavailable CDN will 404 and UI fallback chain handles it.
  return url
    .replace('_m.', '_b.')
    .replace('_n.', '_b.')
    .replace('_q.', '_b.');
};

const toFlickrTags = (name = '') => {
  const clean = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);

  return [...new Set([...clean, 'university', 'campus', 'architecture'])].join(',');
};

const getFlickrCampusImage = async (name) => {
  const tags = toFlickrTags(name);
  const endpoint = `https://www.flickr.com/services/feeds/photos_public.gne?format=json&nojsoncallback=1&tagmode=any&tags=${encodeURIComponent(tags)}`;

  try {
    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    if (!items.length) return null;

    const scored = items
      .map((item) => {
        const hay = `${item?.title || ''} ${item?.tags || ''}`.toLowerCase();
        let score = 0;
        if (hay.includes('campus')) score += 3;
        if (hay.includes('university')) score += 2;
        if (hay.includes('college')) score += 1;
        if (hay.includes('logo') || hay.includes('icon')) score -= 4;
        if (hay.includes('building') || hay.includes('architecture')) score += 1;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score);

    const picked = scored.find((x) => x.score >= 1)?.item || scored[0]?.item;
    const src = picked?.media?.m;
    if (!isHttpUrl(src) || !src.includes('staticflickr.com')) return null;

    return flickrToLarge(src);
  } catch {
    return null;
  }
};

const getWikidataEntityId = async (name, country) => {
  const query = `${name} ${country}`.trim();
  const endpoint = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&origin=*&language=en&type=item&limit=5&search=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    const results = Array.isArray(data?.search) ? data.search : [];

    const best = results.find((item) => {
      const desc = `${item?.description || ''}`.toLowerCase();
      return desc.includes('university') || desc.includes('college') || desc.includes('institute');
    }) || results[0];

    return best?.id || null;
  } catch {
    return null;
  }
};

const commonsFilePath = (fileName = '') => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const getWikidataCommonsCampusImage = async (name, country) => {
  const entityId = await getWikidataEntityId(name, country);
  if (!entityId) return null;

  const endpoint = `https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`;
  try {
    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();

    const entity = data?.entities?.[entityId];
    const p18Claims = entity?.claims?.P18 || [];
    if (!p18Claims.length) return null;

    const fileName = p18Claims[0]?.mainsnak?.datavalue?.value;
    if (!fileName || typeof fileName !== 'string') return null;

    return commonsFilePath(fileName);
  } catch {
    return null;
  }
};

const getWikimediaImage = async (name) => {
  const summaryEndpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;

  try {
    const summaryRes = await fetch(summaryEndpoint, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (summaryRes.ok) {
      const summaryData = await summaryRes.json();
      if (summaryData?.type !== 'disambiguation') {
        const summaryImage = summaryData?.originalimage?.source || summaryData?.thumbnail?.source || null;
        if (isHttpUrl(summaryImage)) return summaryImage;
      }
    }
  } catch {
    // fall through to search endpoint
  }

  try {
    const searchEndpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=original|thumbnail&pithumbsize=1200&generator=search&gsrsearch=${encodeURIComponent(`${name} university campus`)}&gsrlimit=1`;
    const searchRes = await fetch(searchEndpoint);
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const pages = searchData?.query?.pages ? Object.values(searchData.query.pages) : [];
    if (!pages.length) return null;

    const page = pages[0];
    const searchImage = page?.original?.source || page?.thumbnail?.source || null;
    if (!isHttpUrl(searchImage)) return null;

    return searchImage;
  } catch {
    return null;
  }
};

const normalizeInstitution = (item) => {
  const country = item.country || item.alpha_two_code || 'Unknown';
  const domain = (item.domains && item.domains[0]) || item.domain || null;
  const explicitImage = item.image || item.image_url || null;
  if (!domain || !item.name) return null;

  const link = normalizeOfficialLink((item.web_pages && item.web_pages[0]) || item.link || null, domain);
  if (!link) return null;

  const region = COUNTRY_REGION[country] || 'Global';

  return {
    id: slugify(`${item.name}-${country}`),
    name: item.name,
    location: country,
    country,
    domain: normalizeDomain(domain),
    region,
    explicitImage: isHttpUrl(explicitImage) ? explicitImage : null,
    link,
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

const addImageData = async (institution) => {
  const candidates = [];
  let imageSource = 'placeholder';

  const wikidataCommons = await getWikidataCommonsCampusImage(institution.name, institution.location);
  if (wikidataCommons) {
    candidates.push(wikidataCommons);
    imageSource = 'wikidata-commons';
  }

  const wikiImage = await getWikimediaImage(`${institution.name} campus`);
  if (wikiImage) {
    candidates.push(wikiImage);
    if (imageSource === 'placeholder') imageSource = 'wikimedia-search';
  }

  // Optional campus-image fallbacks only.
  const unsplashCampus = getUnsplashCampusUrl(`${institution.name} ${institution.location}`);
  candidates.push(unsplashCampus);

  const flickrCampus = await getFlickrCampusImage(`${institution.name} ${institution.location}`);
  if (flickrCampus) {
    candidates.push(flickrCampus);
    if (imageSource === 'placeholder') imageSource = 'flickr-search';
  }

  if (institution.explicitImage) {
    candidates.push(institution.explicitImage);
    if (imageSource === 'placeholder') imageSource = 'explicit';
  }

  candidates.push(LOCAL_IMAGE_FALLBACK);

  const uniqueCandidates = [...new Set(candidates.filter(Boolean))];

  return {
    ...institution,
    image: uniqueCandidates[0] || LOCAL_IMAGE_FALLBACK,
    imageCandidates: uniqueCandidates,
    imageFallback: LOCAL_IMAGE_FALLBACK,
    imageSource
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

const withImagePipeline = async (institutions = []) => {
  const enriched = await Promise.all(institutions.map(addImageData));

  // Reduce repeated primary images across universities by rotating to next available candidate.
  const used = new Set();
  return enriched.map((item) => {
    const candidates = item.imageCandidates || [];
    const uniquePrimary = candidates.find((url) => !used.has(url)) || candidates[0] || LOCAL_IMAGE_FALLBACK;
    used.add(uniquePrimary);
    return {
      ...item,
      image: uniquePrimary
    };
  });
};

export const getUniversityCandidates = async (answers = {}) => {
  const countries = selectCountries(answers);

  try {
    const liveBatches = await Promise.all(countries.map((country) => fetchByCountry(country)));
    const normalizedLive = uniqueById(liveBatches.flat().map(normalizeInstitution));
    const live = (await withImagePipeline(normalizedLive)).slice(0, 40);

    if (live.length >= 12) {
      return { source: 'live', universities: live };
    }

    const fallback = await withImagePipeline(uniqueById(FALLBACK_UNIVERSITIES.map(normalizeInstitution)));
    return { source: 'live+fallback', universities: uniqueById([...live, ...fallback]).slice(0, 40) };
  } catch {
    return {
      source: 'fallback',
      universities: await withImagePipeline(uniqueById(FALLBACK_UNIVERSITIES.map(normalizeInstitution)))
    };
  }
};
