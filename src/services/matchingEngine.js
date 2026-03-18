const WEIGHTS = {
  continent: 18,
  field: 24,
  budget: 16,
  classSize: 10,
  climate: 8,
  environment: 8,
  degree: 10,
  vibe: 3,
  work: 3
};

const BUDGET_MAP = {
  'Under $15,000': 'low',
  '$15,000 - $30,000': 'medium',
  '$30,000 - $50,000': 'high',
  '$50,000+': 'premium'
};

const CLASS_SIZE_MAP = {
  'Large Lectures (500+ students)': 'large',
  'Medium Classes (~50 students)': 'medium',
  'Intimate Seminars (<20 students)': 'small'
};

const VIBE_MAP = {
  'Very Important (Work hard, play hard)': 'high',
  'Moderately Important': 'moderate',
  'Not Important (Focused purely on academics)': 'low'
};

const WORK_MAP = {
  'Yes, to cover living costs': 'costs',
  'Yes, for experience only': 'experience',
  'No, I want to focus on studies': 'none'
};

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const getFirstAnswer = (answers, key) => answers?.[key]?.[0] || null;

const getBudgetScore = (userBudget, uniBudget) => {
  if (!userBudget) return 0;
  const order = ['low', 'medium', 'high', 'premium'];
  const userIdx = order.indexOf(userBudget);
  const uniIdx = order.indexOf(uniBudget);
  if (userIdx < 0 || uniIdx < 0) return 0;
  if (userIdx === uniIdx) return 1;
  const distance = Math.abs(userIdx - uniIdx);
  if (distance === 1) return 0.6;
  if (distance === 2) return 0.25;
  return 0;
};

const tierByScore = (score) => {
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
};

const getProfileFields = (profile = {}) => {
  const direct = profile?.inferredFields || [];
  const fromSummary = profile?.summary?.subjectKeywords || [];
  return [...new Set([...direct, ...fromSummary])];
};

const getProfileDegree = (profile = {}) => profile?.inferredDegree || profile?.summary?.degreeIntent || null;

const profileFieldMatch = (uni, profile) => {
  const fields = getProfileFields(profile);
  if (!fields.length) return null;
  const match = fields.find((field) => uni.subjectStrength.includes(field));
  return match || null;
};

const scoreUniversity = (uni, answers, profile) => {
  const reasonCandidates = [];
  let score = 0;

  const preferredContinents = answers?.q_continent || [];
  if (preferredContinents.length > 0 && preferredContinents.includes(uni.region)) {
    score += WEIGHTS.continent;
    reasonCandidates.push({ points: WEIGHTS.continent, text: `Region fit: ${uni.region}` });
  }

  const preferredField = getFirstAnswer(answers, 'q_field');
  if (preferredField && uni.subjectStrength.includes(preferredField)) {
    score += WEIGHTS.field;
    reasonCandidates.push({ points: WEIGHTS.field, text: `Subject fit with your selected field (${preferredField})` });
  }

  const inferredField = profileFieldMatch(uni, profile);
  if (inferredField) {
    const cvFieldPoints = preferredField ? WEIGHTS.field * 0.28 : WEIGHTS.field * 0.7;
    score += cvFieldPoints;
    reasonCandidates.push({ points: cvFieldPoints, text: `CV signal match: ${inferredField}` });
  }

  const preferredBudgetBand = BUDGET_MAP[getFirstAnswer(answers, 'q_budget')];
  if (preferredBudgetBand) {
    const budgetFit = getBudgetScore(preferredBudgetBand, uni.budgetBand);
    const budgetPoints = WEIGHTS.budget * budgetFit;
    score += budgetPoints;
    if (budgetPoints >= WEIGHTS.budget * 0.6) {
      reasonCandidates.push({ points: budgetPoints, text: `Estimated country cost band (${uni.budgetBand}) aligns with your budget` });
    }
  }

  const preferredClassSize = CLASS_SIZE_MAP[getFirstAnswer(answers, 'q_class_size')];
  if (preferredClassSize && preferredClassSize === uni.classSizeTendency) {
    score += WEIGHTS.classSize;
    reasonCandidates.push({ points: WEIGHTS.classSize, text: `Learning format fit: ${preferredClassSize} class tendency` });
  }

  const preferredClimate = getFirstAnswer(answers, 'q_weather');
  if (preferredClimate && preferredClimate === uni.climate) {
    score += WEIGHTS.climate;
  }

  const preferredEnvironment = getFirstAnswer(answers, 'q_environment');
  if (preferredEnvironment && preferredEnvironment === uni.campusEnvironment) {
    score += WEIGHTS.environment;
  }

  const preferredDegree = getFirstAnswer(answers, 'q_degree');
  const inferredDegree = getProfileDegree(profile);
  const targetDegree = preferredDegree || inferredDegree;
  if (targetDegree && uni.degreeLevels.includes(targetDegree)) {
    const degreePoints = preferredDegree ? WEIGHTS.degree : WEIGHTS.degree * 0.8;
    score += degreePoints;
    reasonCandidates.push({ points: degreePoints, text: `Degree availability fit (${targetDegree})` });

    if (preferredDegree && inferredDegree && preferredDegree === inferredDegree) {
      reasonCandidates.push({ points: WEIGHTS.degree * 0.25, text: `CV corroborates degree intent (${inferredDegree})` });
    }
  }

  const preferredVibe = VIBE_MAP[getFirstAnswer(answers, 'q_vibe')];
  if (preferredVibe && preferredVibe === uni.socialScene) score += WEIGHTS.vibe;

  const preferredWork = WORK_MAP[getFirstAnswer(answers, 'q_work')];
  if (preferredWork && preferredWork === uni.partTimeFriendly) score += WEIGHTS.work;

  const normalizedScore = clamp(Math.round(score), 0, 100);
  const tier = tierByScore(normalizedScore);
  const matchReasons = reasonCandidates.sort((a, b) => b.points - a.points).slice(0, 4).map((item) => item.text);

  const profileFields = getProfileFields(profile);
  const cvDefaultReason = profileFields.length
    ? `CV highlights ${profileFields.slice(0, 2).join(' / ')} as strongest interests`
    : null;

  const hasCvReason = matchReasons.some((reason) => /cv/i.test(reason));
  if (cvDefaultReason && !hasCvReason) {
    matchReasons.unshift(cvDefaultReason);
  }

  return {
    ...uni,
    score: normalizedScore,
    tier,
    matchReasons: matchReasons.length ? matchReasons.slice(0, 4) : ['Broad compatibility with your profile and preference answers']
  };
};

const ensureTierCoverage = (scoredItems) => {
  const grouped = { High: [], Medium: [], Low: [] };
  scoredItems.forEach((item) => grouped[item.tier].push(item));

  const byRank = [...scoredItems].sort((a, b) => b.score - a.score);
  if (grouped.High.length === 0 && byRank[0]) grouped.High.push(byRank[0]);
  if (grouped.Medium.length === 0 && byRank[1]) grouped.Medium.push(byRank[1]);
  if (grouped.Low.length === 0 && byRank[byRank.length - 1]) grouped.Low.push(byRank[byRank.length - 1]);

  return {
    High: grouped.High.sort((a, b) => b.score - a.score),
    Medium: grouped.Medium.sort((a, b) => b.score - a.score),
    Low: grouped.Low.sort((a, b) => b.score - a.score)
  };
};

const pickDiverse = (items = [], count = 4, usedCountries = new Set(), usedRegions = new Set()) => {
  const selected = [];
  const localCountries = new Set();

  const pushIfGood = (item, requireNewRegion = false) => {
    if (!item || selected.length >= count) return;
    const country = item.country || item.location;
    const region = item.region;

    if (localCountries.has(country)) return;
    if (usedCountries.has(country) && localCountries.size >= 1) return;
    if (requireNewRegion && region && usedRegions.has(region)) return;

    selected.push(item);
    if (country) {
      localCountries.add(country);
      usedCountries.add(country);
    }
    if (region) usedRegions.add(region);
  };

  // First pass: prefer both new country + new region
  items.forEach((item) => pushIfGood(item, true));

  // Second pass: prefer new country regardless of region
  items.forEach((item) => {
    if (selected.length >= count) return;
    const country = item.country || item.location;
    if (selected.includes(item) || localCountries.has(country)) return;
    selected.push(item);
    if (country) {
      localCountries.add(country);
      usedCountries.add(country);
    }
    if (item.region) usedRegions.add(item.region);
  });

  // Final fill if needed
  items.forEach((item) => {
    if (selected.length >= count) return;
    if (selected.includes(item)) return;
    selected.push(item);
  });

  return selected;
};

export const generateTieredMatches = (answers = {}, universities = [], profile = {}) => {
  const scored = universities.map((uni) => scoreUniversity(uni, answers, profile)).sort((a, b) => b.score - a.score);
  const grouped = ensureTierCoverage(scored);

  const usedCountries = new Set();
  const usedRegions = new Set();

  let high = pickDiverse(grouped.High, 4, usedCountries, usedRegions);
  let medium = pickDiverse(grouped.Medium, 4, usedCountries, usedRegions);
  let low = pickDiverse(grouped.Low, 4, usedCountries, usedRegions);

  // Guarantee uniqueness across all tiers by ID.
  const seenIds = new Set();
  const makeUnique = (items) => items.filter((item) => {
    if (!item || seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  high = makeUnique(high);
  medium = makeUnique(medium);
  low = makeUnique(low);

  const fillerPool = scored.filter((item) => !seenIds.has(item.id));
  const fillTo = (arr, target) => {
    while (arr.length < target && fillerPool.length > 0) {
      const next = fillerPool.shift();
      if (!next || seenIds.has(next.id)) continue;
      seenIds.add(next.id);
      arr.push(next);
    }
  };

  fillTo(high, 4);
  fillTo(medium, 4);
  fillTo(low, 4);

  // Hard guarantee: at least 12 unique picks when pool allows.
  const totalUnique = high.length + medium.length + low.length;
  if (totalUnique < 12 && scored.length >= 12) {
    fillTo(high, 4);
    fillTo(medium, 4);
    fillTo(low, 4);
  }

  return { High: high, Medium: medium, Low: low };
};
