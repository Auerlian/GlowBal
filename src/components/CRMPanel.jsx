import React, { useMemo, useState } from 'react';
import { Copy, Download, Mail } from 'lucide-react';
import { exportLeadsCsv, getLeads } from '../services/leadsService';

const CRMPanel = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const leads = useMemo(() => getLeads(), [refreshKey]);

  const allEmails = leads.map((l) => l.email).filter(Boolean).join(', ');

  const copyEmails = async () => {
    await navigator.clipboard.writeText(allEmails);
  };

  return (
    <section className="glass-panel crm-wrap animate-fade-in">
      <div className="crm-head">
        <h1>GlowBal Lead CRM</h1>
        <p>{leads.length} leads captured</p>
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
