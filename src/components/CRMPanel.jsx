import React, { useMemo, useState } from 'react';
import { Copy, Download, Mail, BarChart3 } from 'lucide-react';
import { exportLeadsCsv, getLeads, seedFakeLeads } from '../services/leadsService';

const toDayKey = (iso) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const CRMPanel = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const leads = useMemo(() => getLeads(), [refreshKey]);

  const query = useMemo(() => new URLSearchParams(window.location.search), []);
  const allEmails = leads.map((l) => l.email).filter(Boolean).join(', ');

  const copyEmails = async () => {
    await navigator.clipboard.writeText(allEmails);
  };

  React.useEffect(() => {
    const seedParam = Number(query.get('seedDemo'));
    if (Number.isFinite(seedParam) && seedParam > 0) {
      seedFakeLeads(seedParam);
      setRefreshKey((x) => x + 1);
    }
    // intentionally run once on mount for explicit seed links
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    const startDate = new Date('2026-02-05T00:00:00.000Z').getTime();
    const inWindow = leads.filter((lead) => new Date(lead.createdAt).getTime() >= startDate);
    const perDay = inWindow.reduce((acc, lead) => {
      const key = toDayKey(lead.createdAt);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const days = [];
    const start = new Date('2026-02-05T00:00:00.000Z');
    const today = new Date();
    const dayCount = Math.max(Math.ceil((today.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1, 1);

    for (let i = 0; i < dayCount; i += 1) {
      const date = new Date(start.getTime() + (i * 24 * 60 * 60 * 1000));
      const key = toDayKey(date.toISOString());
      days.push({ key, value: perDay[key] || 0 });
    }

    const max = Math.max(...days.map((d) => d.value), 1);
    const tickEvery = 7;
    const ticks = days
      .map((day, index) => ({ ...day, index }))
      .filter((day) => day.index % tickEvery === 0 || day.index === days.length - 1)
      .map((day) => {
        const dt = new Date(`${day.key}T00:00:00`);
        const label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return { key: day.key, label, leftPct: days.length > 1 ? (day.index / (days.length - 1)) * 100 : 0 };
      });

    return { days, max, ticks };
  }, [leads]);

  const demoLink = `${window.location.origin}${import.meta.env.BASE_URL}?crm=1&seedDemo=142`;

  return (
    <section className="glass-panel crm-wrap animate-fade-in">
      <div className="crm-head">
        <h1>GlowBal Lead CRM</h1>
        <p>{leads.length} leads captured</p>
      </div>

      <div className="glass-panel crm-total-users" style={{ padding: '0.7rem 0.8rem', marginBottom: '0.8rem' }}>
        <strong>Total number of users:</strong> {leads.length}
      </div>

      <div className="crm-actions">
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

      <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
          <BarChart3 size={16} />
          <strong>Signups per day</strong>
        </div>
        <div className="crm-chart">
          {chartData.days.map((day) => (
            <div key={day.key} className="crm-bar-wrap" title={`${day.key}: ${day.value} signups`}>
              <div className="crm-bar" style={{ height: `${Math.max((day.value / chartData.max) * 100, day.value ? 6 : 2)}%` }} />
            </div>
          ))}
        </div>
        <div className="crm-chart-axis">
          {chartData.ticks.map((tick) => (
            <span key={tick.key} style={{ left: `${tick.leftPct}%` }}>{tick.label}</span>
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
