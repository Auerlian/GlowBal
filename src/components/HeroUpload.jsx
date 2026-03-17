import React, { useState } from 'react';
import { Upload, ChevronRight, Check } from 'lucide-react';

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
      
      <h2 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
        Find your place in the <span className="text-gradient animate-float" style={{display: 'inline-block'}}>world.</span>
      </h2>

      <div 
        className={`glass-panel flex-col flex-center ${isHovered ? 'hovered' : ''}`}
        style={{ 
          width: '100%', 
          maxWidth: '600px', 
          height: '300px', 
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
          <div className="flex-col flex-center animate-fade-in" style={{gap: '1rem'}}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', 
              background: 'rgba(0, 180, 216, 0.1)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Check size={32} color="var(--glowbal-mint)" />
            </div>
            <h3 style={{color: 'var(--glowbal-mint)'}}>File Ready</h3>
            <p style={{color: 'var(--glowbal-silver)'}}>{fileName}</p>
          </div>
        ) : (
          <div className="flex-col flex-center" style={{gap: '1rem'}}>
            <Upload size={48} color={isHovered ? 'var(--glowbal-mint)' : 'var(--glowbal-pink)'} 
              style={{ transition: 'all 0.3s ease' }}/>
            <h3>Drop your CV here</h3>
            <p style={{color: 'var(--glowbal-silver)'}}>or click to browse</p>
          </div>
        )}
      </div>

      {fileName && (
        <button 
          className="btn-primary animate-slide-in"
          onClick={(e) => { e.stopPropagation(); submitCV(); }}
          style={{ marginTop: '2rem' }}
        >
          Let the AI find my matches <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default HeroUpload;
