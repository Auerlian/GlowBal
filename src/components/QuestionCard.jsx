import React, { useState, useEffect } from 'react';
import { ChevronRight, Check } from 'lucide-react';

const QuestionCard = ({ question, index, total, onNext }) => {
  const [selected, setSelected] = useState([]);
  const [animate, setAnimate] = useState(false);

  // Trigger intro animation when question changes
  useEffect(() => {
    setSelected([]);
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timer);
  }, [question.id]);

  const toggleOption = (opt) => {
    if (question.type === 'single') {
      setSelected([opt]);
    } else {
      setSelected(prev => 
        prev.includes(opt) 
          ? prev.filter(item => item !== opt)
          : [...prev, opt]
      );
    }
  };

  const handleNext = () => {
    if (selected.length > 0) {
      onNext(question.id, selected);
    }
  };

  return (
    <div className={`question-card glass-panel p-8 w-full max-w-[800px] flex-col ${animate ? 'animate-slide-in' : ''}`} style={{ padding: '2rem 2.1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--glowbal-mint)' }}>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Question {index + 1} of {total}
        </span>
        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--glowbal-pink)' }}>
          {question.type === 'multi' ? 'Select multiple' : 'Select one'}
        </span>
      </div>
      
      <h2 style={{ fontSize: '2.05rem', marginBottom: '1.6rem', lineHeight: '1.2' }}>
        {question.text}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {question.options.map((opt, i) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={i}
              className={`btn-secondary ${isSelected ? 'btn-selected' : ''}`}
              style={{ 
                textAlign: 'left', 
                padding: '0.95rem 1.4rem', 
                fontSize: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                animationDelay: `${i * 100}ms`
              }}
              onClick={() => toggleOption(opt)}
            >
              {opt}
              {isSelected && <Check size={20} color="var(--glowbal-mint)" />}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className={`btn-primary ${selected.length === 0 ? 'disabled' : ''}`}
          style={{ opacity: selected.length === 0 ? 0.5 : 1, cursor: selected.length === 0 ? 'not-allowed' : 'pointer'}}
          onClick={handleNext}
          disabled={selected.length === 0}
        >
          {index === total - 1 ? 'Generate ranked shortlist' : 'Save answer & continue'} <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default QuestionCard;
