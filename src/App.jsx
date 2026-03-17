import React, { useState } from 'react';
import HeroUpload from './components/HeroUpload';
import QuestionCard from './components/QuestionCard';
import ResultsDashboard from './components/ResultsDashboard';
import { processCV, generateResults } from './services/aiMockService';
import { Loader2 } from 'lucide-react';
import './index.css';

const STATES = {
  IDLE: 'IDLE',
  ANALYZING_CV: 'ANALYZING_CV',
  QUESTIONNAIRE: 'QUESTIONNAIRE',
  ANALYZING_ANSWERS: 'ANALYZING_ANSWERS',
  RESULTS: 'RESULTS'
};

function App() {
  const [currentState, setCurrentState] = useState(STATES.IDLE);
  
  // Data State
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const handleCVUpload = async (fileName) => {
    setCurrentState(STATES.ANALYZING_CV);
    try {
      const response = await processCV(fileName);
      setQuestions(response.data);
      setCurrentState(STATES.QUESTIONNAIRE);
    } catch (error) {
      console.error("Error processing CV", error);
      setCurrentState(STATES.IDLE);
    }
  };

  const processAnswers = async (finalAnswers) => {
      setCurrentState(STATES.ANALYZING_ANSWERS);
      try {
        const finalResults = await generateResults(finalAnswers);
        setResults(finalResults);
        setCurrentState(STATES.RESULTS);
      } catch (error) {
        console.error("Error generating results", error);
        setCurrentState(STATES.IDLE);
      }
  }

  const handleAnswerSubmit = (questionId, selectedOptions) => {
    const newAnswers = { ...answers, [questionId]: selectedOptions };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Go to next question
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finished questions, get results
      processAnswers(newAnswers);
    }
  };

  const renderHeader = () => (
    <div style={{ position: 'relative', width: '100%', height: currentState === STATES.IDLE ? '60vh' : '20vh', transition: 'height 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)', overflow: 'hidden' }}>
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
      >
        <source src="/Rotating_Globe_Video_for_Website.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,1) 100%)',
        zIndex: 1
      }} />
      
      <header style={{ 
        padding: '2rem 5%', 
        display: 'flex', 
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
        height: '100%',
        alignItems: currentState === STATES.IDLE ? 'center' : 'flex-start',
        borderBottom: currentState !== STATES.IDLE ? '1px solid rgba(0,0,0,0.05)' : 'none'
      }}>
        <div 
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', transform: currentState === STATES.IDLE ? 'scale(1.5)' : 'scale(1)', transition: 'all 0.5s ease', marginTop: currentState === STATES.IDLE ? '-5vh' : '0' }}
          onClick={() => {
            if (currentState !== STATES.ANALYZING_CV && currentState !== STATES.ANALYZING_ANSWERS) {
               setCurrentState(STATES.IDLE);
               setCurrentQuestionIndex(0);
               setAnswers({});
               setResults(null);
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '1px' }}>
              GLOWBAL
            </span>
            <span style={{ fontSize: '2.5rem', color: 'var(--glowbal-mint)' }}>✦</span>
          </div>
          {currentState === STATES.IDLE && (
            <p style={{ fontSize: '1rem', color: 'var(--glowbal-text)', fontWeight: 600, textAlign: 'center', marginTop: '1rem', maxWidth: '600px', textShadow: '0 1px 15px rgba(255,255,255,1)' }}>
              Navigate your academic journey. Let our AI curate the perfect universities and courses for your future.
            </p>
          )}
        </div>
      </header>
    </div>
  );

  const renderLoadingState = (text) => (
    <div className="flex-col flex-center animate-fade-in" style={{ height: '60vh', gap: '2rem' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }} className="flex-center">
        <Loader2 
          size={64} 
          color="var(--glowbal-pink)" 
          style={{ animation: 'spin 2s linear infinite' }} 
        />
        <div 
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            borderRadius: '50%', 
            border: '4px solid var(--glowbal-mint)',
            borderTopColor: 'transparent',
            borderBottomColor: 'transparent',
            animation: 'spin 3s linear infinite reverse'
          }} 
        />
      </div>
      <h2 style={{ fontSize: '2rem' }} className="animate-pulse">{text}</h2>
      <p style={{ color: 'var(--glowbal-silver)' }}>Our AI is working its magic...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex-col">
      {renderHeader()}
      
      <main className="container flex-col flex-center" style={{ flex: 1, padding: '2rem 0' }}>
        {currentState === STATES.IDLE && (
          <HeroUpload onUpload={handleCVUpload} />
        )}

        {currentState === STATES.ANALYZING_CV && renderLoadingState("Analyzing your CV...")}

        {currentState === STATES.QUESTIONNAIRE && questions.length > 0 && (
          <QuestionCard 
            key={questions[currentQuestionIndex].id} // Force re-render/animation on question change
            question={questions[currentQuestionIndex]}
            index={currentQuestionIndex}
            total={questions.length}
            onNext={handleAnswerSubmit}
          />
        )}

        {currentState === STATES.ANALYZING_ANSWERS && renderLoadingState("Curating perfect matches...")}

        {currentState === STATES.RESULTS && results && (
          <ResultsDashboard results={results} />
        )}
      </main>
    </div>
  );
}

export default App;
