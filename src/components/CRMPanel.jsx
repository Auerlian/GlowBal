import React, { useMemo, useState } from 'react';
import { Copy, Download, Mail, BarChart3, Users } from 'lucide-react';
import { exportLeadsCsv, getLeads, seedFakeLeads, ensureLeadCount, validateLeadData } from '../services/leadsService';

const toDayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CRMPanel = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [targetCount, setTargetCount] = useState(213);
  const [validation, setValidation] = useState(null);
  const leads = useMemo(() => getLeads(), [refreshKey]);

  const query = useMemo(() => new URLSearchParams(window.location.search), []);

  const allEmails = leads.map((l) => l.email).filter(Boolean).join(', ');

  const copyEmails = async () => {
    await navigator.clipboard.writeText(allEmails);
  };

  const generateDemoLeads = () => {
    seedFakeLeads(Number(targetCount) || 213, 60);
    setValidation(null);
    setRefreshKey((x) => x + 1);
  };

  const fillToTarget = () => {
    ensureLeadCount(Number(targetCount) || 213, 60);
    setValidation(null);
    setRefreshKey((x) => x + 1);
  };

  const runValidation = () => {
    setValidation(validateLeadData(getLeads()));
  };

  React.useEffect(() => {
    if (query.get('seedDemo') === '213' && leads.length < 213) {
      seedFakeLeads(213, 60);
      setRefreshKey((x) => x + 1);
    }
  }, [query, leads.length]);

  const chartData = useMemo(() => {
    const cutoff = Date.now() - (60 * 24 * 60 * 60 * 1000);
    const inWindow = leads.filter((lead) => new Date(lead.createdAt).getTime() >= cutoff);
    const perDay = inWindow.reduce((acc, lead) => {
      const key = toDayKey(lead.createdAt);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const days = [];
    for (let i = 59; i >= 0; i -= 1) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const key = toDayKey(date.toISOString());
      days.push({ key, value: perDay[key] || 0 });
    }

    const max = Math.max(...days.map((d) => d.value), 1);
    return { days, max };
  }, [leads]);

  const demoLink = `${window.location.origin}${import.meta.env.BASE_URL}?crm=1&seedDemo=213`;

  return (
    <section className="glass-panel crm-wrap animate-fade-in">
      <div className="crm-head">
        <h1>GlowBal Lead CRM</h1>
        <p>{leads.length} leads captured</p>
      </div>

      <div className="crm-actions">
        <input
          type="number"
          min={1}
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
          className="crm-target-input"
          aria-label="Target signup count"
        />
        <button className="btn-secondary" onClick={generateDemoLeads}>
          <Users size={15} /> Regenerate target set
        </button>
        <button className="btn-secondary" onClick={fillToTarget}>
          Fill to target
        </button>
        <button className="btn-secondary" onClick={runValidation}>
          Validate data
        </button>
        <button className="btn-secondary" onClick={copyEmails} disabled={!leads.length}>
          <Copy size={15} /> Copy all emails
        </button>
        <button className="btn-secondary" onClick={exportLeadsCsv} disabled={!leads.length}>
          <Download size={15} /> Export CSV
        </button>
        <button className="btn-primary" onClick={() => window.open('https://auerlian.github.io/LapsliEmail/', '_blank')}>
          <Mail size={15} /> Open bulk emailer
        </button>
        <button className="btn-secondary" onClick={() => setRefreshKey((x) => x + 1)}>
          Refresh
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '0.8rem' }}>
        <p style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Direct CRM demo link</p>
        <p style={{ color: 'var(--glowbal-silver)', fontSize: '0.9rem', wordBreak: 'break-all' }}>{demoLink}</p>
      </div>

      {validation && (
        <div className="glass-panel crm-validation" style={{ padding: '0.75rem', marginBottom: '0.8rem' }}>
          <p><strong>Validation:</strong> {validation.pass ? 'PASS' : 'CHECK REQUIRED'}</p>
          <p>Total: {validation.total} · Unique emails: {validation.uniqueEmails} · Duplicates: {validation.duplicateEmails}</p>
          <p>Missing required fields: {validation.missingFields} · In last 60 days: {validation.inRangeCount}</p>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem' }}>
          <BarChart3 size={16} />
          <strong>Signups over last 60 days</strong>
        </div>
        <div className="crm-chart">
          {chartData.days.map((day) => (
            <div key={day.key} className="crm-bar-wrap" title={`${day.key}: ${day.value} signups`}>
              <div className="crm-bar" style={{ height: `${Math.max((day.value / chartData.max) * 100, day.value ? 6 : 2)}%` }} />
            </div>
          ))}
        </div>
      </div>

      <div className="crm-table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Goal</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name || '—'}</td>
                <td>{lead.email}</td>
                <td>{lead.goal || '—'}</td>
                <td>{new Date(lead.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!leads.length && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>No leads yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default CRMPanel;
