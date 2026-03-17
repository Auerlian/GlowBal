import React, { useState } from 'react';
import { Upload, ChevronRight, Check, ShieldCheck, Sparkles } from 'lucide-react';

const howItWorks = [
  {
    title: 'Parse your CV',
    detail: 'Extracts level, interests, and experience signals.'
  },
  {
    title: 'Capture preferences',
    detail: '10 focused questions: budget, region, style, goals.'
  },
  {
    title: 'Rank + explain',
    detail: 'Returns reach/target/safety with fit reasons.'
  }
];

const HeroUpload = ({ onUpload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [file, setFile] = useState(null);

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
      setFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const submitCV = () => {
    if (file) onUpload(file);
  };

  return (
    <div className="hero-upload-wrap flex-col flex-center animate-fade-in" style={{ gap: '0.8rem', padding: '0 0 0.9rem 0', width: '100%' }}>
      <div className="hero-intro">
        <h2 className="hero-intro-title">
          Build a realistic university shortlist in <span className="text-gradient">minutes.</span>
        </h2>
        <p className="hero-intro-subtitle">
          CV + preference matching with transparent scoring.
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '920px', padding: '0.7rem 0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.55rem' }}>
          <Sparkles size={16} color="var(--glowbal-mint)" />
          <h3 style={{ fontSize: '1rem' }}>How matching works</h3>
        </div>
        <div className="how-grid compact-how-grid">
          {howItWorks.map((step) => (
            <div key={step.title} className="how-card" style={{ padding: '0.65rem 0.7rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.2rem', fontSize: '0.92rem' }}>{step.title}</p>
              <p style={{ color: 'var(--glowbal-silver)', lineHeight: '1.3', fontSize: '0.84rem' }}>{step.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`glass-panel flex-col flex-center upload-dropzone ${isHovered ? 'hovered' : ''}`}
        style={{
          width: '100%',
          maxWidth: '660px',
          minHeight: '150px',
          height: 'clamp(150px, 20vh, 185px)',
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

        {file ? (
          <div className="flex-col flex-center animate-fade-in" style={{ gap: '0.55rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'rgba(0, 180, 216, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Check size={24} color="var(--glowbal-mint)" />
            </div>
            <h3 style={{ color: 'var(--glowbal-mint)', fontSize: '1rem' }}>CV ready for analysis</h3>
            <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem' }}>{file.name}</p>
          </div>
        ) : (
          <div className="flex-col flex-center" style={{ gap: '0.5rem' }}>
            <Upload size={34} color={isHovered ? 'var(--glowbal-mint)' : 'var(--glowbal-pink)'} style={{ transition: 'all 0.3s ease' }} />
            <h3 style={{ fontSize: '1rem' }}>Upload your CV to begin matching</h3>
            <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem' }}>Drag/drop or click to browse</p>
          </div>
        )}
      </div>

      <div className="trust-strip glass-panel compact-trust">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
          <ShieldCheck size={16} color="var(--glowbal-mint)" />
          <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Privacy</p>
        </div>
        <p style={{ fontSize: '0.84rem', lineHeight: '1.3' }}>Only your CV + answers are used for this run. No hidden profiling.</p>
      </div>
      {file && (
        <button className="btn-primary animate-slide-in hero-start-btn" onClick={(e) => { e.stopPropagation(); submitCV(); }} style={{ marginTop: '0.2rem' }}>
          Start profile analysis <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
};

export default HeroUpload;
