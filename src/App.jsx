import React, { useState } from 'react';
import HeroUpload from './components/HeroUpload';
import QuestionCard from './components/QuestionCard';
import ResultsDashboard from './components/ResultsDashboard';
import { processCV, generateResults } from './services/aiMockService';
import { trackEvent } from './services/analytics';
import { Loader2 } from 'lucide-react';
import AmbientBackground from './components/AmbientBackground';
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
  const [logoVideoFailed, setLogoVideoFailed] = useState(false);
  const logoVideoSrc = `${import.meta.env.BASE_URL}Rotating_Globe_Video_for_Website.mp4`;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);

  const handleCVUpload = async (fileName) => {
    trackEvent('upload_start', { fileName });
    setCurrentState(STATES.ANALYZING_CV);
    try {
      const response = await processCV(fileName);
      setQuestions(response.data);
      setCurrentState(STATES.QUESTIONNAIRE);
    } catch (error) {
      console.error('Error processing CV', error);
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
      console.error('Error generating results', error);
      setCurrentState(STATES.IDLE);
    }
  };

  const handleAnswerSubmit = (questionId, selectedOptions) => {
    const newAnswers = { ...answers, [questionId]: selectedOptions };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      trackEvent('questionnaire_complete', {
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(newAnswers).length
      });
      processAnswers(newAnswers);
    }
  };

  const goHome = () => {
    if (currentState !== STATES.ANALYZING_CV && currentState !== STATES.ANALYZING_ANSWERS) {
      setCurrentState(STATES.IDLE);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setResults(null);
    }
  };

  const renderHeader = () => (
    <header className="topbar content-layer">
      <button className="brand-button" onClick={goHome} aria-label="Go to GlowBal home">
        {!logoVideoFailed ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="brand-video"
            onError={() => setLogoVideoFailed(true)}
          >
            <source src={logoVideoSrc} type="video/mp4" />
          </video>
        ) : (
          <div className="brand-fallback">✦</div>
        )}
      </button>
    </header>
  );

  const renderLoadingState = (text) => (
    <div className="flex-col flex-center animate-fade-in" style={{ height: '60vh', gap: '2rem' }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }} className="flex-center">
        <Loader2 size={64} color="var(--glowbal-pink)" style={{ animation: 'spin 2s linear infinite' }} />
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
      <p style={{ color: 'var(--glowbal-silver)' }}>Using only your CV and questionnaire data for this recommendation run.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex-col app-shell">
      <AmbientBackground density="page" />
      {renderHeader()}

      <main className="container flex-col flex-center content-layer" style={{ flex: 1, padding: '0.4rem 0 0.9rem' }}>
        {currentState === STATES.IDLE && <HeroUpload onUpload={handleCVUpload} />}

        {currentState === STATES.ANALYZING_CV && renderLoadingState('Analyzing your CV...')}

        {currentState === STATES.QUESTIONNAIRE && questions.length > 0 && (
          <QuestionCard
            key={questions[currentQuestionIndex].id}
            question={questions[currentQuestionIndex]}
            index={currentQuestionIndex}
            total={questions.length}
            onNext={handleAnswerSubmit}
          />
        )}

        {currentState === STATES.ANALYZING_ANSWERS && renderLoadingState('Curating perfect matches...')}

        {currentState === STATES.RESULTS && results && <ResultsDashboard results={results} />}
      </main>
    </div>
  );
}

export default App;
