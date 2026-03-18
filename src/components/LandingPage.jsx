import React, { useMemo, useState } from 'react';
import { Mail, Sparkles, ArrowRight } from 'lucide-react';
import { addLead } from '../services/leadsService';

const LandingPage = ({ onOpenCreator }) => {
  const [form, setForm] = useState({ name: '', email: '', goal: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const appLink = useMemo(
    () => `${window.location.origin}${import.meta.env.BASE_URL}?app=1`,
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;

    setStatus('loading');
    try {
      await addLead(form);
      setStatus('success');
      setMessage('You are on the list. We\'ll email you the shortlist creator link.');
      setForm((prev) => ({ ...prev, email: '' }));
    } catch {
      setStatus('error');
      setMessage('Signup failed. Please try again.');
    }
  };

  return (
    <section className="landing-wrap glass-panel animate-fade-in">
      <div className="landing-head">
        <h1>
          Find your perfect university fit with <span className="text-gradient">GlowBal</span>
        </h1>
        <p>
          Join the waitlist and we’ll email you a private access link to test the shortlist creator.
        </p>
      </div>

      <form className="landing-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Your name"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="you@example.com"
          />
        </label>

        <label>
          What do you want help with?
          <textarea
            rows={3}
            value={form.goal}
            onChange={(e) => setForm((prev) => ({ ...prev, goal: e.target.value }))}
            placeholder="Course discovery, budget fit, country options..."
          />
        </label>

        <div className="landing-actions">
          <button className="btn-primary" type="submit" disabled={status === 'loading'}>
            <Mail size={16} /> {status === 'loading' ? 'Saving...' : 'Join waitlist'}
          </button>
          <button className="btn-secondary" type="button" onClick={onOpenCreator}>
            <Sparkles size={16} /> Try creator now
          </button>
        </div>
      </form>

      {message && <p className="landing-message">{message}</p>}

      <div className="landing-footer">
        <p>Direct app link (for emails): {appLink}</p>
        <a href={appLink}>
          Open shortlist creator <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
};

export default LandingPage;
