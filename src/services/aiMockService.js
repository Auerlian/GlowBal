// Mock AI service to simulate parsing a CV, asking questions, and generating results.

const mockQuestions = [
  {
    id: "q_degree",
    text: "What degree level are you seeking?",
    type: "single",
    options: ["Undergraduate (Bachelors)", "Postgraduate (Masters)", "Doctorate (PhD)", "Short Course/Certificate"]
  },
  {
    id: "q_continent",
    text: "Which continent do you prefer for your studies?",
    type: "multi", // User can select multiple
    options: ["North America", "Europe", "Asia", "Oceania", "South America", "Africa"]
  },
  {
    id: "q_budget",
    text: "What is your estimated annual budget (including living costs)?",
    type: "single",
    options: ["Under $15,000", "$15,000 - $30,000", "$30,000 - $50,000", "$50,000+"]
  },
  {
    id: "q_environment",
    text: "What kind of campus environment do you prefer?",
    type: "single",
    options: ["Bustling City Center", "Quiet Suburban", "Rural / Nature-focused", "Coastal / Beachfront"]
  },
  {
    id: "q_field",
    text: "What is your primary field of interest?",
    type: "single",
    options: ["Engineering & Tech", "Business & Economics", "Arts & Humanities", "Life & Medical Sciences", "Social Sciences"]
  },
  {
    id: "q_weather",
    text: "What climate do you thrive in?",
    type: "single",
    options: ["Warm & Sunny year-round", "Distinct 4 Seasons", "Cool & Rainy", "Snowy & Cold"]
  },
  {
    id: "q_vibe",
    text: "How important is the social/party scene to you?",
    type: "single",
    options: ["Very Important (Work hard, play hard)", "Moderately Important", "Not Important (Focused purely on academics)"]
  },
  {
    id: "q_class_size",
    text: "Do you prefer large lectures or intimate seminars?",
    type: "single",
    options: ["Large Lectures (500+ students)", "Medium Classes (~50 students)", "Intimate Seminars (<20 students)"]
  },
  {
    id: "q_work",
    text: "Are you planning to work part-time while studying?",
    type: "single",
    options: ["Yes, to cover living costs", "Yes, for experience only", "No, I want to focus on studies"]
  },
  {
    id: "q_postgrad_goal",
    text: "What is your ultimate goal after graduation?",
    type: "single",
    options: ["Stay and work in the country of study", "Return to my home country", "Travel or move to a third country", "Continue in academia / research"]
  }
];

// Helper to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const processCV = async (file) => {
  // Simulating the time it takes an AI to "read" the CV and generate the questions JSON
  await delay(2500);
  
  // Return the first question
  return {
    status: 'success',
    data: mockQuestions
  };
};

export const generateResults = async (answers) => {
  // Simulating AI analyzing the 10 answers and searching the web
  await delay(3500);

  // Return a tiered structure
  return {
    High: [
      {
        id: "h1",
        name: "Massachusetts Institute of Technology (MIT)",
        location: "Cambridge, USA",
        image: "https://images.unsplash.com/photo-1555529733-0e67056058e1?auto=format&fit=crop&q=80&w=800",
        link: "https://web.mit.edu/",
        desc: "World-renowned for Engineering & Tech."
      },
      {
        id: "h2",
        name: "University of Oxford",
        location: "Oxford, UK",
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800",
        link: "https://www.ox.ac.uk/",
        desc: "Historic excellence across disciplines."
      }
    ],
    Medium: [
      {
        id: "m1",
        name: "University of Sydney",
        location: "Sydney, Australia",
        image: "https://images.unsplash.com/photo-1590422749909-67ce12cb2458?auto=format&fit=crop&q=80&w=800",
        link: "https://www.sydney.edu.au/",
        desc: "Great balance of academics and lifestyle."
      },
      {
        id: "m2",
        name: "University of Toronto",
        location: "Toronto, Canada",
        image: "https://images.unsplash.com/photo-1583160247711-2191776b4b91?auto=format&fit=crop&q=80&w=800",
        link: "https://www.utoronto.ca/",
        desc: "Leading research in North America."
      }
    ],
    Low: [
      {
        id: "l1",
        name: "Arizona State University",
        location: "Tempe, USA",
        image: "https://images.unsplash.com/photo-1525926477800-7a3eaaaf3ee6?auto=format&fit=crop&q=80&w=800",
        link: "https://www.asu.edu/",
        desc: "High acceptance rate with strong programs."
      },
      {
        id: "l2",
        name: "University of Westminster",
        location: "London, UK",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
        link: "https://www.westminster.ac.uk/",
        desc: "Accessible entry in the heart of London."
      }
    ]
  };
};
