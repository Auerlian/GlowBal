import React from 'react';
import { ExternalLink, Target, Flame, Anchor } from 'lucide-react';

const TierSection = ({ title, description, icon: Icon, color, items, delayMs }) => {
  return (
    <div className={`flex-col animate-slide-in`} style={{ gap: '2rem', animationDelay: delayMs }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: `1px solid ${color}`, paddingBottom: '1rem' }}>
        <Icon size={32} color={color} />
        <div>
          <h2 style={{ fontSize: '2rem', color }}>{title} Tier</h2>
          <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem' }}>{description}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {items.map((item, idx) => (
          <div key={item.id} className="glass-panel" style={{ 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>{item.name}</h3>
                <span style={{ 
                  background: 'rgba(0,0,0,0.05)', 
                  padding: '4px 12px', 
                  borderRadius: '100px', 
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-block',
                  color: 'var(--glowbal-text)'
                }}>
                  📍 {item.location}
                </span>
              </div>
              
              <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {item.desc}
              </p>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    textDecoration: 'none',
                    width: '100%',
                    padding: '0.75rem'
                  }}
                >
                  Visit Website <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultsDashboard = ({ results }) => {
  return (
    <div className="flex-col animate-fade-in" style={{ gap: '4rem', padding: '2rem 0', width: '100%', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Your <span className="text-gradient">GLOWBAL</span> Matches
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--glowbal-silver)' }}>
          Curated specially for you based on your unique profile and aspirations.
        </p>
      </div>

      <TierSection 
        title="High Reach" 
        description="Highly selective, but possible. Your dream schools."
        icon={Flame}
        color="var(--glowbal-pink)"
        items={results.High}
        delayMs="100ms"
      />
      
      <TierSection 
        title="Target" 
        description="Strong match for your profile. Likely to be accepted."
        icon={Target}
        color="var(--glowbal-mint)"
        items={results.Medium}
        delayMs="300ms"
      />
      
      <TierSection 
        title="Safety" 
        description="Secure backup options where admission is highly probable."
        icon={Anchor}
        color="var(--glowbal-silver)"
        items={results.Low}
        delayMs="500ms"
      />
      
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
         <button className="btn-primary" onClick={() => window.location.reload()}>
            Start Over
         </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
