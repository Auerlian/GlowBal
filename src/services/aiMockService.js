import { generateTieredMatches } from './matchingEngine';
import { parseProfileSignals } from './profileParser';
import { getUniversityCandidates } from './universityDataService';

const mockQuestions = [
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
  const profileSignals = await parseProfileSignals(file);

  return {
    status: 'success',
    data: mockQuestions,
    profileSignals
  };
};

export const generateResults = async (answers = {}, profileSignals = {}) => {
  await delay(800);
  const { universities, source } = await getUniversityCandidates(answers);
  const tiers = generateTieredMatches(answers, universities, profileSignals);
  return { ...tiers, source };
};
