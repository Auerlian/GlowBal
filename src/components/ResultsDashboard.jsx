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
  X
} from 'lucide-react';
import { trackEvent } from '../services/analytics';

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
            <div key={item.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
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
                  <span style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-block', color: 'var(--glowbal-text)' }}>
                    📍 {item.location}
                  </span>
                </div>

                <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.desc}</p>

                <div className="match-why-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Info size={15} color="var(--glowbal-mint)" />
                    <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>Why this match</p>
                  </div>
                  <ul>
                    {(item.matchReasons || item.why || []).map((reason) => (
                      <li key={reason} style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem', lineHeight: '1.45' }}>{reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-actions" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button className="btn-secondary" onClick={() => onToggleShortlist(item)} style={{ width: '100%', padding: '0.7rem' }}>
                    {isShortlisted ? <><CheckCircle2 size={16} /> Remove from shortlist</> : <><BookmarkPlus size={16} /> Add to shortlist</>}
                  </button>
                  <button className="btn-secondary" onClick={() => onExport(item)} style={{ width: '100%', padding: '0.7rem' }}>
                    <Download size={16} /> Export match brief
                  </button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none', width: '100%', padding: '0.75rem' }}
                  >
                    View programme page <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ComparisonTable = ({ items }) => {
  if (!items.length) return <p style={{ color: 'var(--glowbal-silver)' }}>Shortlist options to compare up to 3 universities.</p>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Criteria</th>
            {items.map((item) => (
              <th key={item.id} style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>{item.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['Location', (item) => item.location],
            ['Summary', (item) => item.desc],
            ['Website', (item) => <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--glowbal-mint)' }}>Open</a>]
          ].map(([label, getter]) => (
            <tr key={label}>
              <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.08)', fontWeight: 700 }}>{label}</td>
              {items.map((item) => (
                <td key={`${label}-${item.id}`} style={{ padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'var(--glowbal-silver)' }}>
                  {getter(item)}
                </td>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={close}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '1.25rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.4rem' }}>Lead Capture</h3>
          <button className="btn-secondary" onClick={close} style={{ padding: '0.4rem 0.7rem' }}><X size={16} /></button>
        </div>
        <form onSubmit={submit} style={{ display: 'grid', gap: '0.8rem' }}>
          {[
            ['name', 'Name'],
            ['email', 'Email'],
            ['intake', 'Preferred intake'],
            ['budget', 'Budget']
          ].map(([key, label]) => (
            <label key={key} style={{ display: 'grid', gap: '0.25rem' }}>
              <span style={{ fontWeight: 600 }}>{label}</span>
              <input style={inputStyle} value={form[key]} onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))} />
              {errors[key] && <small style={{ color: 'var(--glowbal-pink)' }}>{errors[key]}</small>}
            </label>
          ))}
          <label style={{ display: 'grid', gap: '0.25rem' }}>
            <span style={{ fontWeight: 600 }}>Notes</span>
            <textarea rows={4} style={inputStyle} value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
            <button type="button" className="btn-secondary" onClick={close}>Cancel</button>
            <button type="submit" className="btn-primary"><Download size={16} /> Validate & Download JSON</button>
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
    <div className="flex-col animate-fade-in" style={{ gap: '4rem', padding: '2rem 0', width: '100%', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Your <span className="text-gradient">GLOWBAL</span> Match Report
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--glowbal-silver)' }}>
          Ranked options by competitiveness, with transparent fit signals from your answers.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <p style={{ color: 'var(--glowbal-silver)' }}><strong>{shortlistItems.length}</strong> shortlisted</p>
        <button className="btn-primary" onClick={() => setLeadOpen(true)}><Download size={16} /> Lead form + JSON</button>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scale size={18} color="var(--glowbal-pink)" /> Comparison (max 3)
        </h3>
        {shortlistItems.length > 3 && <p style={{ color: 'var(--glowbal-pink)', marginBottom: '0.8rem' }}>Showing first 3 of {shortlistItems.length} shortlisted options.</p>}
        <ComparisonTable items={compareItems} />
      </div>

      <TierSection title="High Reach" description="Ambitious options with lower admission probability, but strong upside." icon={Flame} color="var(--glowbal-pink)" items={results.High} delayMs="100ms" shortlist={shortlist} onToggleShortlist={toggleShortlist} onExport={exportItem} />
      <TierSection title="Target" description="Balanced fit and competitiveness for your current profile." icon={Target} color="var(--glowbal-mint)" items={results.Medium} delayMs="300ms" shortlist={shortlist} onToggleShortlist={toggleShortlist} onExport={exportItem} />
      <TierSection title="Safety" description="Lower-risk options to keep your admissions strategy resilient." icon={Anchor} color="var(--glowbal-silver)" items={results.Low} delayMs="500ms" shortlist={shortlist} onToggleShortlist={toggleShortlist} onExport={exportItem} />

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button className="btn-primary" onClick={() => window.location.reload()}>Start new matching run</button>
      </div>

      <LeadModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} shortlistItems={shortlistItems} />
    </div>
  );
};

export default ResultsDashboard;
