import React, { useMemo, useState } from 'react';
import { ExternalLink, Target, Flame, Anchor, Info, BookmarkPlus, Download, CheckCircle2 } from 'lucide-react';

const TierSection = ({ title, description, icon: Icon, color, items, delayMs, shortlist, onToggleShortlist, onExport }) => {
  return (
    <div className={`flex-col animate-slide-in`} style={{ gap: '2rem', animationDelay: delayMs }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: `1px solid ${color}`, paddingBottom: '1rem' }}>
        <Icon size={32} color={color} />
        <div>
          <h2 style={{ fontSize: '2rem', color }}>{title} Tier</h2>
          <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem' }}>{description}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {items.map((item) => {
          const isShortlisted = shortlist.has(item.id);
          return (
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

                <div className="match-why-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Info size={15} color="var(--glowbal-mint)" />
                    <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>Why this match</p>
                  </div>
                  <ul>
                    {item.why.map((reason) => (
                      <li key={reason} style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem', lineHeight: '1.45' }}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-actions" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button className="btn-secondary" onClick={() => onToggleShortlist(item.id)} style={{ width: '100%', padding: '0.7rem' }}>
                    {isShortlisted ? <><CheckCircle2 size={16} /> Added to shortlist</> : <><BookmarkPlus size={16} /> Add to shortlist</>}
                  </button>
                  <button className="btn-secondary" onClick={() => onExport(item)} style={{ width: '100%', padding: '0.7rem' }}>
                    <Download size={16} /> Export match brief
                  </button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
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
                    View programme page <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const ResultsDashboard = ({ results }) => {
  const [shortlist, setShortlist] = useState(new Set());

  const allResults = useMemo(() => [...results.High, ...results.Medium, ...results.Low], [results]);

  const toggleShortlist = (id) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const exportItem = (item) => {
    const content = [
      `GlowBal Match Brief`,
      `Institution: ${item.name}`,
      `Location: ${item.location}`,
      `Summary: ${item.desc}`,
      '',
      'Why this match:',
      ...item.why.map((reason, i) => `${i + 1}. ${reason}`),
      '',
      `Source: ${item.link}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_glowbal_match.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportShortlist = () => {
    const selected = allResults.filter((item) => shortlist.has(item.id));
    if (!selected.length) return;

    const content = selected.map((item) => {
      return `${item.name} (${item.location})\n- ${item.desc}\n- ${item.why.join('\n- ')}\n- ${item.link}`;
    }).join('\n\n');

    const blob = new Blob([`GlowBal Shortlist\n\n${content}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'glowbal_shortlist.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-col animate-fade-in" style={{ gap: '4rem', padding: '2rem 0', width: '100%', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Your <span className="text-gradient">GLOWBAL</span> Match Report
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--glowbal-silver)' }}>
          Ranked options by competitiveness, with transparent fit signals from your answers.
        </p>
      </div>

      <TierSection
        title="High Reach"
        description="Ambitious options with lower admission probability, but strong upside."
        icon={Flame}
        color="var(--glowbal-pink)"
        items={results.High}
        delayMs="100ms"
        shortlist={shortlist}
        onToggleShortlist={toggleShortlist}
        onExport={exportItem}
      />

      <TierSection
        title="Target"
        description="Balanced fit and competitiveness for your current profile."
        icon={Target}
        color="var(--glowbal-mint)"
        items={results.Medium}
        delayMs="300ms"
        shortlist={shortlist}
        onToggleShortlist={toggleShortlist}
        onExport={exportItem}
      />

      <TierSection
        title="Safety"
        description="Lower-risk options to keep your admissions strategy resilient."
        icon={Anchor}
        color="var(--glowbal-silver)"
        items={results.Low}
        delayMs="500ms"
        shortlist={shortlist}
        onToggleShortlist={toggleShortlist}
        onExport={exportItem}
      />

      <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={exportShortlist} disabled={!shortlist.size} style={{ opacity: shortlist.size ? 1 : 0.5 }}>
          <Download size={16} /> Export shortlisted options
        </button>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Start new matching run
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
