import React, { useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  Target,
  Flame,
  Anchor,
  Info,
  BookmarkPlus,
  CheckCircle2,
  ArrowRight,
  Download,
  Bookmark,
  X
} from 'lucide-react';
import { trackEvent } from '../services/analytics';

const TIER_CONFIG = [
  {
    key: 'High',
    label: 'Reach',
    icon: Flame,
    color: 'var(--glowbal-pink)',
    description: 'Ambitious options with strong upside.'
  },
  {
    key: 'Medium',
    label: 'Target',
    icon: Target,
    color: 'var(--glowbal-mint)',
    description: 'Balanced fits for your current profile.'
  },
  {
    key: 'Low',
    label: 'Safety',
    icon: Anchor,
    color: 'var(--glowbal-silver)',
    description: 'Lower-risk options for resilience.'
  }
];

const metaLabel = {
  budgetBand: 'Cost band',
  competitiveness: 'Competitiveness',
  subjectStrength: 'Subject fit'
};

const shortText = (value = '', max = 170) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

const UniversityImage = ({ item, className }) => {
  const placeholder = `${import.meta.env.BASE_URL}images/university-placeholder.svg`;
  const candidates = (item?.imageCandidates && item.imageCandidates.length ? item.imageCandidates : [item?.image, item?.imageFallback]).filter(Boolean);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const currentSrc = candidates[candidateIndex] || placeholder;

  return (
    <img
      src={currentSrc}
      alt={item?.name || 'University image'}
      className={className}
      loading="lazy"
      onError={(e) => {
        if (candidateIndex < candidates.length - 1) {
          setCandidateIndex((prev) => prev + 1);
          return;
        }
        e.currentTarget.onerror = null;
        e.currentTarget.src = placeholder;
      }}
    />
  );
};

const DetailPanel = ({ item, shortlisted, onToggleShortlist, onExport }) => {
  if (!item) return null;

  const reasons = item.matchReasons || item.why || [];
  const metadata = [
    [metaLabel.budgetBand, item.budgetBand],
    [metaLabel.competitiveness, item.competitiveness],
    [metaLabel.subjectStrength, Array.isArray(item.subjectStrength) ? item.subjectStrength.slice(0, 3).join(' · ') : item.subjectStrength]
  ].filter(([, value]) => Boolean(value));

  return (
    <section className="glass-panel report-detail-panel animate-fade-in">
      <UniversityImage item={item} className="report-detail-image" />
      <div className="report-detail-body">
        <div className="report-detail-head">
          <div>
            <h2>{item.name}</h2>
            <p>{item.location}</p>
          </div>
          <button className="btn-secondary report-shortlist-btn" onClick={() => onToggleShortlist(item)}>
            {shortlisted ? <><CheckCircle2 size={15} /> Shortlisted</> : <><BookmarkPlus size={15} /> Shortlist</>}
          </button>
        </div>

        <p className="report-detail-description">{shortText(item.desc, 230)}</p>

        {!!reasons.length && (
          <div className="match-why-card report-why-card">
            <div className="result-why-head">
              <Info size={15} color="var(--glowbal-mint)" />
              <p>Why this fits you / CV</p>
            </div>
            <ul>
              {reasons.slice(0, 4).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {!!metadata.length && (
          <div className="report-meta-row">
            {metadata.map(([label, value]) => (
              <span className="report-meta-pill" key={label}><strong>{label}:</strong> {value}</span>
            ))}
          </div>
        )}

        <div className="report-detail-actions">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-primary result-link-cta">
            Official programme link <ExternalLink size={16} />
          </a>
          <button className="btn-secondary" onClick={() => onExport(item)}>
            <Download size={15} /> Export brief
          </button>
        </div>
      </div>
    </section>
  );
};

const DetailModal = ({ open, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="report-detail-modal-overlay" onClick={onClose}>
      <div className="report-detail-modal-shell" onClick={(e) => e.stopPropagation()}>
        <button className="report-detail-close" onClick={onClose} aria-label="Close university details">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ResultsDashboard = ({ results }) => {
  const [shortlist, setShortlist] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const detailRef = useRef(null);

  const allResults = useMemo(() => [...results.High, ...results.Medium, ...results.Low], [results]);
  const shortlistItems = useMemo(() => allResults.filter((item) => shortlist.has(item.id)), [allResults, shortlist]);

  const selectedItem = useMemo(() => allResults.find((item) => item.id === selectedId) || allResults[0], [allResults, selectedId]);

  const toggleShortlist = (item) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        trackEvent('shortlist_remove', { universityId: item.id, universityName: item.name });
      } else {
        next.add(item.id);
        trackEvent('shortlist_add', { universityId: item.id, universityName: item.name, totalShortlisted: next.size });
      }
      return next;
    });
  };

  const handleSelectItem = (itemId) => {
    setSelectedId(itemId);
    setDetailOpen(true);
    if (window.innerWidth <= 900 && detailRef.current) {
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const exportItem = (item) => {
    const content = [
      'GlowBal Match Brief',
      `Institution: ${item.name}`,
      `Location: ${item.location}`,
      `Summary: ${item.desc}`,
      '',
      'Why this match:',
      ...(item.matchReasons || item.why || []).map((reason, i) => `${i + 1}. ${reason}`),
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
    const payload = {
      exportedAt: new Date().toISOString(),
      shortlistedUniversities: shortlistItems.map(({ id, name, location, link, budgetBand, competitiveness, subjectStrength }) => ({
        id,
        name,
        location,
        link,
        budgetBand,
        competitiveness,
        subjectStrength
      }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glowbal-shortlist-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-wrap flex-col animate-fade-in">
      <header className="results-header report-header">
        <h1>Your <span className="text-gradient">GlowBal</span> match report</h1>
        <p>Browse Reach, Target and Safety picks in a clean view. Select any card to open full details below.</p>
      </header>

      <section className="glass-panel report-menu-bar">
        <p style={{ fontSize: '0.85rem', color: 'var(--glowbal-silver)' }}>
          Data source: {results.source === 'live' ? 'Live public API' : results.source === 'live+fallback' ? 'Live API + fallback cache' : 'Fallback cache'}
        </p>
        <div className="report-menu-actions">
          <span className="report-shortlist-chip"><Bookmark size={14} /> {shortlistItems.length} shortlisted</span>
          <button className="btn-secondary" onClick={exportShortlist} disabled={shortlistItems.length === 0}>
            <Download size={15} /> Export shortlist
          </button>
        </div>
      </section>

      <section className="report-columns" aria-label="University recommendation columns">
        {TIER_CONFIG.map(({ key, label, description, icon: TierGlyph, color }) => {
          const tierItems = (results[key] || []).slice(0, 2);
          return (
            <article className="glass-panel report-tier-column" key={key}>
              <header className="report-tier-head" style={{ borderBottomColor: color }}>
                <div className="results-section-title-wrap">
                  {React.createElement(TierGlyph, { size: 18, color })}
                  <h2>{label}</h2>
                </div>
                <p>{description}</p>
              </header>

              <div className="report-tier-cards">
                {tierItems.map((item) => {
                  const active = selectedItem?.id === item.id;
                  const isShortlisted = shortlist.has(item.id);
                  return (
                    <button
                      key={item.id}
                      className={`report-compact-card ${active ? 'is-active' : ''}`}
                      onClick={() => handleSelectItem(item.id)}
                    >
                      <UniversityImage item={item} className="report-compact-image" />
                      <div className="report-compact-body">
                        <div>
                          <h3>{item.name}</h3>
                          <p>{item.location}</p>
                        </div>
                        <span className="report-score-pill">Match {item.score}%</span>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        className={`report-card-bookmark ${isShortlisted ? 'is-on' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShortlist(item);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleShortlist(item);
                          }
                        }}
                        aria-label={isShortlisted ? `Remove ${item.name} from shortlist` : `Add ${item.name} to shortlist`}
                      >
                        <Bookmark size={14} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>

      <section ref={detailRef} className="report-detail-anchor" aria-label="Selected university details">
        <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem' }}>
          Click any university card to open full details.
        </p>
      </section>

      <DetailModal open={detailOpen} onClose={() => setDetailOpen(false)}>
        <DetailPanel
          item={selectedItem}
          shortlisted={selectedItem ? shortlist.has(selectedItem.id) : false}
          onToggleShortlist={toggleShortlist}
          onExport={exportItem}
        />
      </DetailModal>

      <div className="results-footer-cta">
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Start a new matching run <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
