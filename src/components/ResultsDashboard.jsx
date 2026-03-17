import React, { useMemo, useState } from 'react';
import {
  ExternalLink,
  Target,
  Flame,
  Anchor,
  Star,
  Scale,
  Download,
  X,
  Mail,
  User,
  Calendar,
  Wallet,
  NotebookText
} from 'lucide-react';
import { trackEvent } from '../services/analytics';

const MAX_COMPARE = 3;

const ResultCard = ({ item, color, isShortlisted, onToggleShortlist }) => {
  return (
    <div
      className="glass-panel"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ height: '200px', width: '100%', overflow: 'hidden' }}>
        <img
          src={item.image}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>{item.name}</h3>
          <span
            style={{
              background: 'rgba(0,0,0,0.05)',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-block',
              color: 'var(--glowbal-text)'
            }}
          >
            📍 {item.location}
          </span>
        </div>

        <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.95rem', lineHeight: '1.5' }}>{item.desc}</p>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'grid', gap: '0.75rem' }}>
          <button
            className="btn-secondary"
            onClick={() => onToggleShortlist(item)}
            style={{
              borderColor: isShortlisted ? color : undefined,
              background: isShortlisted ? 'rgba(0, 180, 216, 0.08)' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Star size={16} color={isShortlisted ? 'var(--glowbal-mint)' : 'currentColor'} />
            {isShortlisted ? 'Remove from shortlist' : 'Save to shortlist'}
          </button>

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
  );
};

const TierSection = ({ title, description, icon: Icon, color, items, delayMs, shortlist, onToggleShortlist }) => (
  <div className={`flex-col animate-slide-in`} style={{ gap: '2rem', animationDelay: delayMs }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: `1px solid ${color}`, paddingBottom: '1rem' }}>
      <Icon size={32} color={color} />
      <div>
        <h2 style={{ fontSize: '2rem', color }}>{title} Tier</h2>
        <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem' }}>{description}</p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      {items.map((item) => (
        <ResultCard
          key={item.id}
          item={item}
          color={color}
          isShortlisted={Boolean(shortlist[item.id])}
          onToggleShortlist={onToggleShortlist}
        />
      ))}
    </div>
  </div>
);

const ComparisonTable = ({ items }) => {
  if (items.length === 0) {
    return <p style={{ color: 'var(--glowbal-silver)' }}>Shortlist up to 3 universities to compare key details.</p>;
  }

  const rows = [
    { label: 'University', accessor: 'name' },
    { label: 'Location', accessor: 'location' },
    { label: 'Profile Summary', accessor: 'desc' },
    {
      label: 'Website',
      accessor: 'link',
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--glowbal-mint)', fontWeight: 600 }}>
          Open link
        </a>
      )
    }
  ];

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>Criteria</th>
            {items.map((item) => (
              <th key={item.id} style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                {item.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td style={{ fontWeight: 700, padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>{row.label}</td>
              {items.map((item) => (
                <td key={`${row.label}-${item.id}`} style={{ padding: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)', color: 'var(--glowbal-silver)' }}>
                  {row.render ? row.render(item[row.accessor]) : item[row.accessor]}
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    intake: '',
    budget: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      nextErrors.email = 'Please enter a valid email';
    }
    if (!formData.intake.trim()) nextErrors.intake = 'Preferred intake is required';
    if (!formData.budget.trim()) nextErrors.budget = 'Budget is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      submittedAt: new Date().toISOString(),
      lead: formData,
      shortlistedUniversities: shortlistItems.map((item) => ({
        id: item.id,
        name: item.name,
        location: item.location,
        link: item.link
      }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `glowbal-lead-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    trackEvent('lead_form_submit', {
      hasNotes: Boolean(formData.notes.trim()),
      shortlistCount: shortlistItems.length,
      intake: formData.intake
    });

    onClose();
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(0,0,0,0.12)',
    fontFamily: 'inherit',
    fontSize: '0.95rem'
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.75rem' }}>Get Personalised Counselling</h2>
          <button className="btn-secondary" onClick={onClose} style={{ padding: '0.4rem 0.8rem' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ color: 'var(--glowbal-silver)', marginBottom: '1rem' }}>
          Fill in your details to export a lead profile JSON your counselling team can use.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={15} /> Name</span>
            <input style={inputStyle} value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
            {errors.name && <small style={{ color: 'var(--glowbal-pink)' }}>{errors.name}</small>}
          </label>

          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={15} /> Email</span>
            <input style={inputStyle} value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
            {errors.email && <small style={{ color: 'var(--glowbal-pink)' }}>{errors.email}</small>}
          </label>

          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={15} /> Preferred Intake</span>
            <input placeholder="e.g. Fall 2027" style={inputStyle} value={formData.intake} onChange={(e) => setFormData(prev => ({ ...prev, intake: e.target.value }))} />
            {errors.intake && <small style={{ color: 'var(--glowbal-pink)' }}>{errors.intake}</small>}
          </label>

          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Wallet size={15} /> Budget</span>
            <input placeholder="e.g. $30,000 - $45,000" style={inputStyle} value={formData.budget} onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))} />
            {errors.budget && <small style={{ color: 'var(--glowbal-pink)' }}>{errors.budget}</small>}
          </label>

          <label style={{ display: 'grid', gap: '0.3rem' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><NotebookText size={15} /> Notes (optional)</span>
            <textarea rows={4} style={inputStyle} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Download size={16} /> Validate & Download Lead JSON</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResultsDashboard = ({ results }) => {
  const [shortlist, setShortlist] = useState({});
  const [showLeadModal, setShowLeadModal] = useState(false);

  const shortlistItems = useMemo(() => Object.values(shortlist), [shortlist]);
  const comparisonItems = shortlistItems.slice(0, MAX_COMPARE);

  const handleToggleShortlist = (item) => {
    setShortlist((prev) => {
      const isRemoving = Boolean(prev[item.id]);

      if (isRemoving) {
        const next = { ...prev };
        delete next[item.id];
        trackEvent('shortlist_remove', { universityId: item.id, universityName: item.name });
        return next;
      }

      const next = { ...prev, [item.id]: item };
      trackEvent('shortlist_add', { universityId: item.id, universityName: item.name, totalShortlisted: Object.keys(next).length });
      return next;
    });
  };

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

      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Star size={18} color="var(--glowbal-mint)" />
          <strong>{shortlistItems.length}</strong>
          <span style={{ color: 'var(--glowbal-silver)' }}>universities shortlisted</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={() => setShowLeadModal(true)}>
            Capture Lead
          </button>
          <button className="btn-primary" onClick={() => setShowLeadModal(true)}>
            <Download size={16} /> Lead Form + JSON
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Scale size={20} color="var(--glowbal-pink)" /> Quick Comparison (Top {MAX_COMPARE})
        </h2>
        <p style={{ color: 'var(--glowbal-silver)', marginBottom: '1rem' }}>
          Compare up to 3 shortlisted options side-by-side.
        </p>
        <ComparisonTable items={comparisonItems} />
      </div>

      <TierSection
        title="High Reach"
        description="Highly selective, but possible. Your dream schools."
        icon={Flame}
        color="var(--glowbal-pink)"
        items={results.High}
        delayMs="100ms"
        shortlist={shortlist}
        onToggleShortlist={handleToggleShortlist}
      />

      <TierSection
        title="Target"
        description="Strong match for your profile. Likely to be accepted."
        icon={Target}
        color="var(--glowbal-mint)"
        items={results.Medium}
        delayMs="300ms"
        shortlist={shortlist}
        onToggleShortlist={handleToggleShortlist}
      />

      <TierSection
        title="Safety"
        description="Secure backup options where admission is highly probable."
        icon={Anchor}
        color="var(--glowbal-silver)"
        items={results.Low}
        delayMs="500ms"
        shortlist={shortlist}
        onToggleShortlist={handleToggleShortlist}
      />

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Start Over
        </button>
      </div>

      <LeadModal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} shortlistItems={shortlistItems} />
    </div>
  );
};

export default ResultsDashboard;
