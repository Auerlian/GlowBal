import React, { useMemo, useState } from 'react';
import {
  ExternalLink,
  Target,
  Flame,
  Anchor,
  Info,
  BookmarkPlus,
  Download,
  CheckCircle2,
  Scale,
  X,
  FileWarning,
  ArrowRight
} from 'lucide-react';
import { trackEvent } from '../services/analytics';

const TierSection = ({ title, description, icon, color, items, shortlist, onToggleShortlist, onExport }) => {
  const TierIcon = icon;

  return (
    <section className="results-section glass-panel animate-slide-in">
      <div className="results-section-head" style={{ borderBottomColor: color }}>
        <div className="results-section-title-wrap">
          <TierIcon size={24} color={color} />
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="results-grid">
        {items.map((item) => {
          const isShortlisted = shortlist.has(item.id);
          return (
            <article key={item.id} className="result-card glass-panel">
              <img src={item.image} alt={item.name} className="result-image" />

              <div className="result-body">
                <div>
                  <h3>{item.name}</h3>
                  <p className="result-location">{item.location}</p>
                  <p className="result-summary">{item.desc}</p>
                </div>

                <div className="match-why-card">
                  <div className="result-why-head">
                    <Info size={15} color="var(--glowbal-mint)" />
                    <p>Why this match</p>
                  </div>
                  <ul>
                    {(item.matchReasons || item.why || []).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-actions">
                  <button className="btn-secondary" onClick={() => onToggleShortlist(item)}>
                    {isShortlisted ? <><CheckCircle2 size={16} /> Shortlisted</> : <><BookmarkPlus size={16} /> Add to shortlist</>}
                  </button>
                  <button className="btn-secondary" onClick={() => onExport(item)}>
                    <Download size={16} /> Export brief
                  </button>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-primary result-link-cta">
                    View programme <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const ComparisonTable = ({ items }) => {
  if (!items.length) {
    return (
      <div className="results-empty">
        <FileWarning size={18} color="var(--glowbal-silver)" />
        <p>Select up to 3 universities from your shortlist to unlock side-by-side comparison.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Criteria</th>
            {items.map((item) => (
              <th key={item.id}>{item.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['Location', (item) => item.location],
            ['Summary', (item) => item.desc],
            ['Website', (item) => <a href={item.link} target="_blank" rel="noopener noreferrer">Open programme</a>]
          ].map(([label, getter]) => (
            <tr key={label}>
              <td>{label}</td>
              {items.map((item) => (
                <td key={`${label}-${item.id}`}>{getter(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LeadModal = ({ isOpen, onClose, shortlistItems }) => {
  const initial = { name: '', email: '', intake: '', budget: '', notes: '' };
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const close = () => {
    setForm(initial);
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Required';
    if (!form.email.trim()) next.email = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Invalid email';
    if (!form.intake.trim()) next.intake = 'Required';
    if (!form.budget.trim()) next.budget = 'Required';
    setErrors(next);
    return !Object.keys(next).length;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      submittedAt: new Date().toISOString(),
      lead: form,
      shortlistedUniversities: shortlistItems.map(({ id, name, location, link }) => ({ id, name, location, link }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `glowbal-lead-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    trackEvent('lead_form_submit', { shortlistCount: shortlistItems.length, intake: form.intake });
    close();
  };

  const inputStyle = { width: '100%', padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)' };

  return (
    <div className="results-modal-overlay" onClick={close}>
      <div className="glass-panel results-modal" onClick={(e) => e.stopPropagation()}>
        <div className="results-modal-head">
          <h3>Share shortlist details</h3>
          <button className="btn-secondary" onClick={close} style={{ padding: '0.4rem 0.7rem' }}><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="results-form-grid">
          {[['name', 'Name'], ['email', 'Email'], ['intake', 'Preferred intake'], ['budget', 'Budget']].map(([key, label]) => (
            <label key={key} style={{ display: 'grid', gap: '0.25rem' }}>
              <span style={{ fontWeight: 600 }}>{label}</span>
              <input style={inputStyle} value={form[key]} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} />
              {errors[key] && <small style={{ color: 'var(--glowbal-pink)' }}>{errors[key]}</small>}
            </label>
          ))}
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontWeight: 600 }}>Notes</span>
            <textarea rows={4} style={inputStyle} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </label>
          <div className="results-modal-actions">
            <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
            <button type="submit" className="btn-primary"><Download size={16} /> Download JSON</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResultsDashboard = ({ results }) => {
  const [shortlist, setShortlist] = useState(new Set());
  const [leadOpen, setLeadOpen] = useState(false);

  const allResults = useMemo(() => [...results.High, ...results.Medium, ...results.Low], [results]);
  const shortlistItems = useMemo(() => allResults.filter((item) => shortlist.has(item.id)), [allResults, shortlist]);
  const compareItems = shortlistItems.slice(0, 3);

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

  return (
    <div className="results-wrap flex-col animate-fade-in">
      <header className="results-header">
        <h1>Your <span className="text-gradient">GlowBal</span> match report</h1>
        <p>Review your recommended universities, shortlist your preferred options, then export a clean report.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--glowbal-silver)' }}>Data source: {results.source === 'live' ? 'Live public API' : results.source === 'live+fallback' ? 'Live API + fallback cache' : 'Fallback cache'}</p>
      </header>

      <section className="glass-panel results-shortlist-bar">
        <div>
          <p className="results-shortlist-count">Shortlisted: <strong>{shortlistItems.length}</strong></p>
          <p className="results-shortlist-help">You can compare up to 3 universities at once.</p>
        </div>
        <button className="btn-primary" onClick={() => setLeadOpen(true)} disabled={shortlistItems.length === 0}>
          <Download size={16} /> Export shortlist report
        </button>
      </section>

      <section className="glass-panel results-section">
        <div className="results-section-head" style={{ borderBottomColor: 'rgba(0,0,0,0.1)' }}>
          <div className="results-section-title-wrap">
            <Scale size={18} color="var(--glowbal-pink)" />
            <h2>Comparison</h2>
          </div>
          <p>Quickly scan your top shortlisted options side by side.</p>
        </div>
        {shortlistItems.length > 3 && <p className="results-warning">Showing first 3 of {shortlistItems.length} shortlisted options.</p>}
        <ComparisonTable items={compareItems} />
      </section>

      <TierSection title="Reach" description="Ambitious options with lower admission probability and high upside." icon={Flame} color="var(--glowbal-pink)" items={results.High} shortlist={shortlist} onToggleShortlist={toggleShortlist} onExport={exportItem} />
      <TierSection title="Target" description="Balanced options aligned with your current profile and preferences." icon={Target} color="var(--glowbal-mint)" items={results.Medium} shortlist={shortlist} onToggleShortlist={toggleShortlist} onExport={exportItem} />
      <TierSection title="Safety" description="Lower-risk options to keep your admissions strategy resilient." icon={Anchor} color="var(--glowbal-silver)" items={results.Low} shortlist={shortlist} onToggleShortlist={toggleShortlist} onExport={exportItem} />

      <div className="results-footer-cta">
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Start a new matching run <ArrowRight size={16} />
        </button>
      </div>

      <LeadModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} shortlistItems={shortlistItems} />
    </div>
  );
};

export default ResultsDashboard;
