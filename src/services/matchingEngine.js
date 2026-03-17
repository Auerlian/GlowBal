import { universities } from '../data/universities';

const WEIGHTS = {
  continent: 20,
  field: 20,
  budget: 16,
  classSize: 12,
  climate: 10,
  environment: 8,
  degree: 8,
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

const COMPETITIVENESS_BONUS = {
  very_high: {
    'Continue in academia / research': 6,
    'Stay and work in the country of study': 3
  },
  high: {
    'Continue in academia / research': 4,
    'Stay and work in the country of study': 2
  },
  medium: {
    'No, I want to focus on studies': 0
  }
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

  // Close bands still get partial credit; very expensive mismatches are penalized.
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

const scoreUniversity = (uni, answers) => {
  const reasonCandidates = [];
  let score = 0;

  const preferredContinents = answers?.q_continent || [];
  if (preferredContinents.length > 0) {
    const regionMatch = preferredContinents.includes(uni.region);
    if (regionMatch) {
      score += WEIGHTS.continent;
      reasonCandidates.push({ points: WEIGHTS.continent, text: `Matches your preferred region (${uni.region})` });
    }
  }

  const preferredField = getFirstAnswer(answers, 'q_field');
  if (preferredField && uni.subjectStrength.includes(preferredField)) {
    score += WEIGHTS.field;
    reasonCandidates.push({ points: WEIGHTS.field, text: `Strong in your target field (${preferredField})` });
  }

  const preferredBudgetBand = BUDGET_MAP[getFirstAnswer(answers, 'q_budget')];
  if (preferredBudgetBand) {
    const budgetFit = getBudgetScore(preferredBudgetBand, uni.budgetBand);
    const budgetPoints = WEIGHTS.budget * budgetFit;
    score += budgetPoints;
    if (budgetPoints >= WEIGHTS.budget * 0.6) {
      reasonCandidates.push({ points: budgetPoints, text: 'Estimated costs align with your budget range' });
    }
  }

  const preferredClassSize = CLASS_SIZE_MAP[getFirstAnswer(answers, 'q_class_size')];
  if (preferredClassSize && preferredClassSize === uni.classSizeTendency) {
    score += WEIGHTS.classSize;
    reasonCandidates.push({ points: WEIGHTS.classSize, text: `Class size style matches your learning preference (${preferredClassSize})` });
  }

  const preferredClimate = getFirstAnswer(answers, 'q_weather');
  if (preferredClimate && preferredClimate === uni.climate) {
    score += WEIGHTS.climate;
    reasonCandidates.push({ points: WEIGHTS.climate, text: `Climate fit: ${uni.climate}` });
  }

  const preferredEnvironment = getFirstAnswer(answers, 'q_environment');
  if (preferredEnvironment && preferredEnvironment === uni.campusEnvironment) {
    score += WEIGHTS.environment;
    reasonCandidates.push({ points: WEIGHTS.environment, text: `Campus environment suits your preference (${preferredEnvironment})` });
  }

  const preferredDegree = getFirstAnswer(answers, 'q_degree');
  if (preferredDegree && uni.degreeLevels.includes(preferredDegree)) {
    score += WEIGHTS.degree;
    reasonCandidates.push({ points: WEIGHTS.degree, text: `Offers your intended degree path (${preferredDegree})` });
  }

  const preferredVibe = VIBE_MAP[getFirstAnswer(answers, 'q_vibe')];
  if (preferredVibe && preferredVibe === uni.socialScene) {
    score += WEIGHTS.vibe;
  }

  const preferredWork = WORK_MAP[getFirstAnswer(answers, 'q_work')];
  if (preferredWork && preferredWork === uni.partTimeFriendly) {
    score += WEIGHTS.work;
  }

  const postgradGoal = getFirstAnswer(answers, 'q_postgrad_goal');
  if (postgradGoal) {
    const bonus = COMPETITIVENESS_BONUS[uni.competitiveness]?.[postgradGoal] || 0;
    score += bonus;
    if (bonus > 0) {
      reasonCandidates.push({ points: bonus, text: `Competitiveness profile supports your post-grad goal` });
    }
  }

  const normalizedScore = clamp(Math.round(score), 0, 100);
  const tier = tierByScore(normalizedScore);
  const matchReasons = reasonCandidates
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)
    .map((item) => item.text);

  return {
    ...uni,
    score: normalizedScore,
    tier,
    matchReasons: matchReasons.length > 0
      ? matchReasons
      : ['General profile compatibility based on available answers']
  };
};

const ensureTierCoverage = (scoredItems) => {
  const grouped = { High: [], Medium: [], Low: [] };
  scoredItems.forEach((item) => grouped[item.tier].push(item));

  // If thresholds lead to sparse tiers, backfill from sorted ranking.
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

export const generateTieredMatches = (answers = {}) => {
  const scored = universities
    .map((uni) => scoreUniversity(uni, answers))
    .sort((a, b) => b.score - a.score);

  return ensureTierCoverage(scored);
};
