import React, { useMemo, useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { addLead } from '../services/leadsService';

const LandingPage = ({ onOpenCreator, onOpenAI }) => {
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
      setMessage('You’re in 🎉 We’ve saved your spot and sent a confirmation to your email.');
      setForm((prev) => ({ ...prev, email: '' }));
    } catch {
      setStatus('error');
      setMessage('Signup failed. Please try again.');
    }
  };

  const signedUp = status === 'success';

  return (
    <section className="landing-wrap glass-panel animate-fade-in">
      <div className="landing-head">
        <h1>
          Find your perfect university fit with <span className="text-gradient">GlowBal</span>
        </h1>
        <p>
          Join the waitlist to get early access. We’ll email your invite and onboarding details.
        </p>
      </div>

      {!signedUp && (
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
          </div>
        </form>
      )}

      {message && <p className={`landing-message ${signedUp ? 'is-success' : ''}`}>{message}</p>}

      {signedUp && (
        <div className="signup-success-card animate-fade-in" role="status" aria-live="polite">
          <div className="signup-success-head">
            <CheckCircle2 size={20} />
            <strong>Signup confirmed</strong>
          </div>
          <p>
            While you wait, you can already explore the AI assistant and matching flow.
          </p>
          <div className="signup-success-actions">
            <button className="btn-secondary" type="button" onClick={onOpenAI}>
              <Sparkles size={15} /> Open AI assistant
            </button>
            <button className="btn-primary" type="button" onClick={onOpenCreator}>
              <Compass size={15} /> Open Match flow
            </button>
          </div>
          <div className="landing-footer">
            <p>Direct app link (for emails): {appLink}</p>
            <a href={appLink}>
              Open Match page <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}
    </section>
  );
};

export default LandingPage;
