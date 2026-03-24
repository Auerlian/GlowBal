import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Target,
  Heart,
  Phone,
  MapPin,
  Send
} from 'lucide-react';
import { addLead } from '../services/leadsService';

const STATS = [
  { value: '500+', label: 'Universities', icon: GraduationCap },
  { value: '12+', label: 'Countries', icon: Globe2 },
  { value: 'AI', label: 'Powered Matching', icon: Sparkles },
  { value: '100%', label: 'Free to Try', icon: Heart },
];

const SERVICES = [
  {
    title: 'AI University Matching',
    desc: 'Upload your CV, answer a few questions, and receive a ranked shortlist of universities tailored to your profile.',
    icon: Target,
  },
  {
    title: '1-on-1 Mentorship',
    desc: 'Book sessions with current students at your target universities for insider advice on applications and campus life.',
    icon: Users,
  },
  {
    title: 'SOP & Document Review',
    desc: 'Get AI-assisted feedback on your Statement of Purpose and application documents before you submit.',
    icon: BookOpen,
  },
  {
    title: 'Scholarship Discovery',
    desc: 'Find real scholarship links and funding opportunities matched to your target universities.',
    icon: Award,
  },
];

const LandingPage = ({ onOpenCreator, onOpenAI }) => {
  const [form, setForm] = useState({ name: '', email: '', school: '', dob: '', phone: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const logoVideoSrc = `${import.meta.env.BASE_URL}Rotating_Globe_Video_for_Website.mp4`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.name.trim()) return;

    setStatus('loading');
    try {
      await addLead({
        name: form.name,
        email: form.email,
        goal: [form.school && `School: ${form.school}`, form.dob && `DOB: ${form.dob}`, form.phone && `Phone: ${form.phone}`].filter(Boolean).join(' | ') || ''
      });
      setStatus('success');
      setMessage("Welcome aboard! We've saved your spot on the waitlist.");
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  const signedUp = status === 'success';

  return (
    <div className="lp">
      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-hero-globe-wrap">
            <video autoPlay loop muted playsInline className="lp-hero-globe">
              <source src={logoVideoSrc} type="video/mp4" />
            </video>
          </div>
          <h1 className="lp-hero-title">
            <span className="text-gradient">GLOWBAL</span>
          </h1>
          <p className="lp-hero-tagline">
            Supportive ecosystem integrating AI &amp; a successful applicant network to aid educational decisions.
          </p>
          <div className="lp-hero-cta">
            <button className="btn-primary" onClick={onOpenCreator}>
              Try Glowbal AI <ArrowRight size={18} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* ── Vision & Mission ── */}
      <section className="lp-section" id="about">
        <div className="lp-container">
          <div className="lp-vm-grid">
            <div className="lp-vm-card glass-panel">
              <h3>Vision</h3>
              <p>
                Empowering every student to find their ideal educational path, regardless of where they come from.
              </p>
            </div>
            <div className="lp-vm-card glass-panel">
              <h3>Mission</h3>
              <p>
                Leveraging AI technology and peer mentorship networks to simplify international university discovery and applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements / Stats ── */}
      <section className="lp-section lp-section--tinted" id="achievements">
        <div className="lp-container">
          <h2 className="lp-section-heading">Our Impact</h2>
          <div className="lp-stats-grid">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="lp-stat glass-panel">
                <Icon size={28} color="var(--glowbal-mint)" />
                <span className="lp-stat-value">{value}</span>
                <span className="lp-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services / What We Offer ── */}
      <section className="lp-section" id="services">
        <div className="lp-container">
          <h2 className="lp-section-heading">What We Offer</h2>
          <p className="lp-section-sub">Everything you need to navigate your global education journey.</p>
          <div className="lp-services-grid">
            {SERVICES.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="lp-service glass-panel">
                <div className="lp-service-icon">
                  <Icon size={24} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section className="lp-section lp-section--tinted" id="waitlist">
        <div className="lp-container">
          <div className="lp-waitlist glass-panel">
            <h2>
              Join the <span className="text-gradient">Waitlist</span>
            </h2>
            <p className="lp-waitlist-sub">Be the first to access GlowBal when we launch. It's free.</p>

            {!signedUp ? (
              <form className="lp-wl-form" onSubmit={handleSubmit}>
                <div className="lp-wl-row">
                  <label>
                    Name <span className="lp-req">*</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </label>
                  <label>
                    Email <span className="lp-req">*</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                    />
                  </label>
                </div>
                <div className="lp-wl-row">
                  <label>
                    Current School
                    <input
                      value={form.school}
                      onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}
                      placeholder="Your current school or university"
                    />
                  </label>
                  <label>
                    Date of Birth
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                    />
                  </label>
                </div>
                <label>
                  Phone <span className="lp-opt">(optional)</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+84 ..."
                  />
                </label>
                <button className="btn-primary lp-wl-submit" type="submit" disabled={status === 'loading'}>
                  <Send size={16} /> {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                </button>
                {status === 'error' && <p className="lp-form-error">{message}</p>}
              </form>
            ) : (
              <div className="lp-wl-success animate-fade-in">
                <CheckCircle2 size={36} color="var(--glowbal-mint)" />
                <p className="lp-wl-success-msg">{message}</p>
                <div className="lp-wl-success-actions">
                  <button className="btn-primary" type="button" onClick={onOpenCreator}>
                    <Sparkles size={15} /> Try Glowbal AI Now
                  </button>
                  <button className="btn-secondary" type="button" onClick={onOpenAI}>
                    Open SOP Assistant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="lp-section" id="team">
        <div className="lp-container">
          <h2 className="lp-section-heading">Our Team</h2>
          <div className="lp-team-grid">
            <div className="lp-team-card glass-panel">
              <div className="lp-team-avatar">K</div>
              <h3>Khanh Linh</h3>
              <span className="lp-team-role">Founder &amp; CEO</span>
              <p>Passionate about making global education accessible to every student.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <div className="lp-footer-brand">
            <span className="text-gradient lp-footer-logo">GLOWBAL</span>
            <p>All rights reserved &copy; {new Date().getFullYear()}</p>
          </div>
          <div className="lp-footer-contact">
            <h4>Contacts</h4>
            <p><Phone size={14} /> 0911552005 (Khanh Linh)</p>
            <p><MapPin size={14} /> Vietnam (+84)</p>
            <p><Mail size={14} /> linhnk0505@gmail.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
