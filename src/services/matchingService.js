import { generateTieredMatches } from './matchingEngine';
import { getUniversityCandidates } from './universityDataService';
import { parseCVFile } from './cvFileParser';
import { buildProfileFromText } from './profileSignalParser';
import { parseProfileSignals } from './profileParser';

const profileQuestions = [
  {
    id: 'q_degree',
    text: 'What degree level are you seeking?',
    type: 'single',
    options: ['Undergraduate (Bachelors)', 'Postgraduate (Masters)', 'Doctorate (PhD)', 'Short Course/Certificate']
  },
  {
    id: 'q_continent',
    text: 'Which continent do you prefer for your studies?',
    type: 'multi',
    options: ['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa']
  },
  {
    id: 'q_budget',
    text: 'What is your estimated annual budget (including living costs)?',
    type: 'single',
    options: ['Under $15,000', '$15,000 - $30,000', '$30,000 - $50,000', '$50,000+']
  },
  {
    id: 'q_environment',
    text: 'What kind of campus environment do you prefer?',
    type: 'single',
    options: ['Bustling City Center', 'Quiet Suburban', 'Rural / Nature-focused', 'Coastal / Beachfront']
  },
  {
    id: 'q_field',
    text: 'What is your primary field of interest?',
    type: 'single',
    options: ['Engineering & Tech', 'Business & Economics', 'Arts & Humanities', 'Life & Medical Sciences', 'Social Sciences']
  },
  {
    id: 'q_weather',
    text: 'What climate do you thrive in?',
    type: 'single',
    options: ['Warm & Sunny year-round', 'Distinct 4 Seasons', 'Cool & Rainy', 'Snowy & Cold']
  },
  {
    id: 'q_vibe',
    text: 'How important is the social/party scene to you?',
    type: 'single',
    options: ['Very Important (Work hard, play hard)', 'Moderately Important', 'Not Important (Focused purely on academics)']
  },
  {
    id: 'q_class_size',
    text: 'Do you prefer large lectures or intimate seminars?',
    type: 'single',
    options: ['Large Lectures (500+ students)', 'Medium Classes (~50 students)', 'Intimate Seminars (<20 students)']
  },
  {
    id: 'q_work',
    text: 'Are you planning to work part-time while studying?',
    type: 'single',
    options: ['Yes, to cover living costs', 'Yes, for experience only', 'No, I want to focus on studies']
  },
  {
    id: 'q_postgrad_goal',
    text: 'What is your ultimate goal after graduation?',
    type: 'single',
    options: ['Stay and work in the country of study', 'Return to my home country', 'Travel or move to a third country', 'Continue in academia / research']
  }
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const processCV = async (file) => {
  await delay(900);

  let profileSignals;
  try {
    const { text, metadata } = await parseCVFile(file);
    const richerProfile = buildProfileFromText(text);

    profileSignals = {
      source: 'parsed-cv',
      fileMeta: metadata,
      rawTextSample: text.slice(0, 1200),
      inferredFields: richerProfile.summary?.subjectKeywords || [],
      inferredDegree: richerProfile.summary?.degreeIntent || null,
      inferredAnswers: richerProfile.inferredAnswers || {},
      summary: richerProfile.summary || {},
      confidence: richerProfile.confidence || {}
    };
  } catch {
    // Fallback parser for edge cases; still keep flow usable.
    const fallbackProfile = await parseProfileSignals(file);
    profileSignals = {
      source: 'fallback-parser',
      ...fallbackProfile,
      summary: fallbackProfile?.summary || {
        subjectKeywords: fallbackProfile?.inferredFields || [],
        degreeIntent: fallbackProfile?.inferredDegree || null
      }
    };
  }

  return {
    status: 'success',
    data: profileQuestions,
    profileSignals
  };
};

export const generateResults = async (answers = {}, profileSignals = {}) => {
  await delay(800);

  const inferredAnswers = profileSignals?.inferredAnswers || {};
  const mergedAnswers = { ...inferredAnswers, ...answers };

  const { universities, source } = await getUniversityCandidates(mergedAnswers);
  const tiers = generateTieredMatches(mergedAnswers, universities, profileSignals);
  return { ...tiers, source };
};
