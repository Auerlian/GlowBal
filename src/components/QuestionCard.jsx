import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const QuestionCard = ({ question, index, total, savedAnswer = [], onNext, onBack, canGoBack }) => {
  const [selected, setSelected] = useState(savedAnswer);

  const toggleOption = (opt) => {
    if (question.type === 'single') {
      setSelected([opt]);
      return;
    }

    setSelected((prev) => (prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]));
  };

  return (
    <div className="question-shell">
      <div className="question-card glass-panel flex-col animate-slide-in">
        <div className="question-meta-row">
          <span className="question-meta-primary">Question {index + 1} of {total}</span>
          <span className="question-meta-secondary">{question.type === 'multi' ? 'Select multiple' : 'Select one'}</span>
        </div>

        <h2 className="question-title">{question.text}</h2>

        <div className="question-options">
          {question.options.map((opt, i) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={i}
                className={`btn-secondary question-option ${isSelected ? 'btn-selected' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => toggleOption(opt)}
              >
                <span>{opt}</span>
                {isSelected && <Check size={20} color="var(--glowbal-mint)" />}
              </button>
            );
          })}
        </div>

        <div className="question-next-row" style={{ justifyContent: canGoBack ? 'space-between' : 'flex-end' }}>
          {canGoBack && (
            <button className="btn-secondary" onClick={onBack}>
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <button
            className={`btn-primary ${selected.length === 0 ? 'disabled' : ''}`}
            style={{ opacity: selected.length === 0 ? 0.5 : 1, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}
            onClick={() => selected.length > 0 && onNext(question.id, selected)}
            disabled={selected.length === 0}
          >
            {index === total - 1 ? 'Generate ranked shortlist' : 'Save answer & continue'} <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
