import React, { useState } from 'react';
import { Upload, ChevronRight, Check, ShieldCheck, Sparkles } from 'lucide-react';

const howItWorks = [
  {
    title: '1) Parse your profile',
    detail: 'We extract degree level, interests, and experience from your CV to avoid repetitive forms.'
  },
  {
    title: '2) Capture your preferences',
    detail: 'You answer 10 focused questions on budget, region, learning style, and post-study goals.'
  },
  {
    title: '3) Rank and explain options',
    detail: 'We return reach/target/safety options with clear reasons tied to your answers.'
  }
];

const HeroUpload = ({ onUpload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsHovered(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovered(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const submitCV = () => {
    if (fileName) {
      onUpload(fileName);
    }
  };

  return (
    <div className="flex-col flex-center animate-fade-in" style={{ gap: '2rem', padding: '0 0 4rem 0', width: '100%' }}>
      <div style={{ textAlign: 'center', maxWidth: '900px' }}>
        <h2 style={{ fontSize: '2.6rem', marginBottom: '1rem', textAlign: 'center' }}>
          Build a realistic university shortlist in <span className="text-gradient">minutes.</span>
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--glowbal-silver)', lineHeight: '1.6' }}>
          GlowBal combines your CV with structured preference questions to rank options by fit and admission competitiveness.
          No generic recommendations, just decisions you can act on.
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={18} color="var(--glowbal-mint)" />
          <h3 style={{ fontSize: '1.1rem' }}>How matching works</h3>
        </div>
        <div className="how-grid">
          {howItWorks.map((step) => (
            <div key={step.title} className="how-card">
              <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{step.title}</p>
              <p style={{ color: 'var(--glowbal-silver)', lineHeight: '1.45', fontSize: '0.94rem' }}>{step.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`glass-panel flex-col flex-center ${isHovered ? 'hovered' : ''}`}
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '280px',
          borderStyle: isHovered ? 'solid' : 'dashed',
          borderColor: isHovered ? 'var(--glowbal-mint)' : 'rgba(0,0,0,0.2)',
          borderWidth: '2px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backgroundColor: isHovered ? 'rgba(0, 180, 216, 0.05)' : 'rgba(255, 255, 255, 0.5)'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('cv-upload').click()}
      >
        <input
          id="cv-upload"
          type="file"
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />

        {fileName ? (
          <div className="flex-col flex-center animate-fade-in" style={{ gap: '1rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(0, 180, 216, 0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Check size={32} color="var(--glowbal-mint)" />
            </div>
            <h3 style={{ color: 'var(--glowbal-mint)' }}>CV ready for analysis</h3>
            <p style={{ color: 'var(--glowbal-silver)' }}>{fileName}</p>
          </div>
        ) : (
          <div className="flex-col flex-center" style={{ gap: '1rem' }}>
            <Upload size={48} color={isHovered ? 'var(--glowbal-mint)' : 'var(--glowbal-pink)'}
              style={{ transition: 'all 0.3s ease' }} />
            <h3>Upload your CV to begin matching</h3>
            <p style={{ color: 'var(--glowbal-silver)' }}>Drag and drop, or click to browse</p>
          </div>
        )}
      </div>

      <div className="trust-strip glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
          <ShieldCheck size={18} color="var(--glowbal-mint)" />
          <p style={{ fontWeight: 700 }}>Your data and privacy</p>
        </div>
        <p>
          We only use CV content + your questionnaire answers to generate this shortlist. No social media scraping, no hidden profiling.
          In this demo, files are processed in-session and not used to train external models.
        </p>
      </div>

      {fileName && (
        <button
          className="btn-primary animate-slide-in"
          onClick={(e) => { e.stopPropagation(); submitCV(); }}
          style={{ marginTop: '0.5rem' }}
        >
          Start profile analysis <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default HeroUpload;
