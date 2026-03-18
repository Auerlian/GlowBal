import React, { useMemo, useState } from 'react';
import {
  ExternalLink,
  Target,
  Flame,
  Anchor,
  Info,
  BookmarkPlus,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Download,
  Bookmark,
  Columns3,
  GraduationCap,
  Trophy,
  Users,
  CalendarClock,
  Clock3,
  Mail,
  PoundSterling
} from 'lucide-react';
import { trackEvent } from '../services/analytics';
import { requestMentorSession } from '../services/mentorService';

const TIER_CONFIG = [
  { key: 'High', label: 'Reach', icon: Flame, color: 'var(--glowbal-pink)', description: 'Ambitious options with strong upside.' },
  { key: 'Medium', label: 'Target', icon: Target, color: 'var(--glowbal-mint)', description: 'Balanced fits for your current profile.' },
  { key: 'Low', label: 'Safety', icon: Anchor, color: 'var(--glowbal-silver)', description: 'Lower-risk options for resilience.' }
];

const MENTOR_PHOTOS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
];

const SCHOLARSHIP_LINKS = {
  'University of Oxford': [
    { name: 'Oxford Scholarships and Funding', applyLink: 'https://www.ox.ac.uk/admissions/graduate/fees-and-funding/oxford-funding' },
    { name: 'Oxford Clarendon Fund', applyLink: 'https://www.ox.ac.uk/clarendon' }
  ],
  'University of Cambridge': [
    { name: 'Cambridge International Scholarships', applyLink: 'https://www.student-funding.cam.ac.uk/' },
    { name: 'Gates Cambridge Scholarships', applyLink: 'https://www.gatescambridge.org/apply/' }
  ],
  'Massachusetts Institute of Technology': [
    { name: 'MIT Scholarships', applyLink: 'https://sfs.mit.edu/undergraduate-students/the-cost-of-attendance/making-mit-affordable/' }
  ],
  'Stanford University': [
    { name: 'Stanford Financial Aid', applyLink: 'https://financialaid.stanford.edu/' }
  ],
  'University of Toronto': [
    { name: 'U of T Scholarships', applyLink: 'https://future.utoronto.ca/finances/' }
  ],
  'University of Melbourne': [
    { name: 'Melbourne Scholarships', applyLink: 'https://scholarships.unimelb.edu.au/' }
  ],
  'Technical University of Munich': [
    { name: 'TUM Scholarships', applyLink: 'https://www.tum.de/en/studies/fees-and-financial-aid/scholarships' }
  ],
  'École Polytechnique': [
    { name: 'École Polytechnique Funding', applyLink: 'https://programmes.polytechnique.edu/en/ingenieur-polytechnicien-program/admissions/scholarships-and-financial-aid' }
  ],
  'National University of Singapore': [
    { name: 'NUS Scholarships', applyLink: 'https://www.nus.edu.sg/oam/scholarships' }
  ],
  'University of Tokyo': [
    { name: 'UTokyo Scholarships', applyLink: 'https://www.u-tokyo.ac.jp/en/prospective-students/scholarships.html' }
  ],
  'ETH Zurich': [
    { name: 'ETH Excellence Scholarship', applyLink: 'https://ethz.ch/en/studies/financial/scholarships/excellencescholarship.html' }
  ],
  'Seoul National University': [
    { name: 'SNU Scholarships', applyLink: 'https://en.snu.ac.kr/admission/scholarships' }
  ]
};

const buildScholarships = (item) => {
  const mapped = SCHOLARSHIP_LINKS[item.name] || [];
  if (mapped.length) {
    return mapped.map((s, idx) => ({ ...s, id: `${item.id}-s-${idx + 1}` }));
  }

  const origin = (() => {
    try { return new URL(item.link).origin; } catch { return item.link; }
  })();

  return [
    { id: `${item.id}-fallback-1`, name: `${item.name} Scholarships`, applyLink: item.link },
    { id: `${item.id}-fallback-2`, name: `${item.name} Funding & Aid`, applyLink: `${origin}/` }
  ];
};

const buildUniversityProfile = (item) => {
  const seed = (item?.id || item?.name || 'uni').toString().length;
  const topCourses = Array.isArray(item?.subjectStrength) && item.subjectStrength.length
    ? item.subjectStrength.slice(0, 4)
    : ['Computer Science', 'Business', 'Data Science', 'Engineering'];

  const mentors = Array.from({ length: 4 }).map((_, index) => ({
    id: `${item.id}-mentor-${index + 1}`,
    name: `${['Alex', 'Maya', 'Sam', 'Noor'][index]} ${['Patel', 'Carter', 'Ibrahim', 'Wong'][index]}`,
    image: MENTOR_PHOTOS[index % MENTOR_PHOTOS.length],
    course: topCourses[index % topCourses.length],
    year: `${2 + (index % 3)}rd Year`,
    bio: `Current ${topCourses[index % topCourses.length]} student at ${item.name}. Helps with SOPs, applications and interview prep.`,
    price: `£${25 + index * 10}/session`,
    hours: `${10 + index}:00 - ${14 + index}:00 (Mon-Fri)`,
    slots: ['Mon 10:00', 'Tue 14:30', 'Thu 16:00', 'Fri 11:30'].map((slot) => `${slot} GMT`)
  }));

  return {
    studentPopulation: `${(15000 + seed * 321).toLocaleString()} students`,
    globalRank: `#${90 + seed}`,
    nationalRank: `#${15 + (seed % 20)}`,
    rating: `${(4.1 + (seed % 7) * 0.1).toFixed(1)}/5`,
    topCourses,
    scholarships: buildScholarships(item),
    mentors
  };
};

const UniversityImage = ({ item, className }) => {
  const placeholder = `${import.meta.env.BASE_URL}images/university-placeholder.svg`;
  const candidates = (item?.imageCandidates?.length ? item.imageCandidates : [item?.image, item?.imageFallback]).filter(Boolean);
  const [idx, setIdx] = useState(0);
  return (
    <img
      src={candidates[idx] || placeholder}
      alt={item?.name || 'University image'}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={(e) => {
        if (idx < candidates.length - 1) setIdx((p) => p + 1);
        else e.currentTarget.src = placeholder;
      }}
    />
  );
};

const UniversityFullPage = ({ item, isShortlisted, onToggleShortlist, onBack }) => {
  const [activeMentorId, setActiveMentorId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestName, setRequestName] = useState('');
  const [requestStatus, setRequestStatus] = useState('');

  const profile = useMemo(() => buildUniversityProfile(item), [item]);
  const activeMentor = profile.mentors.find((m) => m.id === activeMentorId) || profile.mentors[0];

  const submitMentorRequest = async () => {
    if (!selectedSlot) return setRequestStatus('Select a time slot first.');
    if (!requestEmail || !requestEmail.includes('@')) return setRequestStatus('Enter a valid email.');

    try {
      setRequestStatus('Sending request...');
      await requestMentorSession({
        universityName: item.name,
        mentorName: activeMentor.name,
        mentorCourse: activeMentor.course,
        slot: selectedSlot,
        email: requestEmail,
        name: requestName
      });
      setRequestStatus('Request sent ✅ You will receive an email confirmation shortly.');
    } catch (error) {
      setRequestStatus(error.message || 'Could not send request. Please try again.');
    }
  };

  return (
    <section className="uni-fullpage animate-fade-in">
      <div className="uni-full-hero glass-panel">
        <UniversityImage item={item} className="uni-full-hero-image" />
        <div className="uni-full-hero-overlay" />
        <div className="uni-full-hero-content">
          <button className="btn-secondary" onClick={onBack}><ArrowLeft size={15} /> Back to matches</button>
          <h1>{item.name}</h1>
          <p>{item.location}</p>
          <div className="report-meta-row">
            <span className="report-meta-pill"><Users size={14} /> {profile.studentPopulation}</span>
            <span className="report-meta-pill"><Trophy size={14} /> Global {profile.globalRank}</span>
            <span className="report-meta-pill"><GraduationCap size={14} /> National {profile.nationalRank}</span>
            <span className="report-meta-pill"><Info size={14} /> {profile.rating}</span>
          </div>
          <button className="btn-primary" onClick={() => onToggleShortlist(item)}>
            {isShortlisted ? <><CheckCircle2 size={15} /> Shortlisted</> : <><BookmarkPlus size={15} /> Add to shortlist</>}
          </button>
        </div>
      </div>

      <div className="uni-full-grid">
        <article className="glass-panel uni-full-card">
          <h3><Info size={16} /> Overview</h3>
          <p>{item.desc}</p>
          <h4>Best matching courses</h4>
          <ul>
            {profile.topCourses.map((course) => <li key={course}>{course}</li>)}
          </ul>
        </article>

        <article className="glass-panel uni-full-card">
          <h3><Trophy size={16} /> Real scholarship links</h3>
          <div className="scholarship-list">
            {profile.scholarships.map((s) => (
              <a key={s.id} href={s.applyLink} target="_blank" rel="noopener noreferrer" className="scholarship-row">
                <span>{s.name}</span>
                <ExternalLink size={14} />
              </a>
            ))}
          </div>
        </article>
      </div>

      <article className="glass-panel uni-full-card mentor-card-advanced">
        <h3><CalendarClock size={16} /> Student mentors</h3>
        <div className="mentor-advanced-grid">
          <aside className="mentor-profile-list">
            {profile.mentors.map((mentor) => (
              <button key={mentor.id} className={`mentor-profile-chip ${mentor.id === activeMentor.id ? 'is-active' : ''}`} onClick={() => setActiveMentorId(mentor.id)}>
                <img src={mentor.image} alt={mentor.name} />
                <div>
                  <strong>{mentor.name}</strong>
                  <span>{mentor.course}</span>
                  <small><PoundSterling size={12} /> {mentor.price}</small>
                </div>
              </button>
            ))}
          </aside>

          <section className="mentor-booking-panel">
            <div className="mentor-booking-head">
              <img src={activeMentor.image} alt={activeMentor.name} />
              <div>
                <h4>{activeMentor.name}</h4>
                <p>{activeMentor.year} · {activeMentor.course}</p>
                <p>{activeMentor.bio}</p>
                <p className="mentor-hours"><Clock3 size={14} /> {activeMentor.hours}</p>
              </div>
            </div>

            <div className="mentor-slots">
              {activeMentor.slots.map((slot) => (
                <button key={`${activeMentor.id}-${slot}`} className={`btn-secondary mentor-slot ${selectedSlot === slot ? 'btn-selected' : ''}`} onClick={() => setSelectedSlot(slot)}>
                  {slot}
                </button>
              ))}
            </div>

            <div className="mentor-request-form">
              <label>
                Your name
                <input value={requestName} onChange={(e) => setRequestName(e.target.value)} placeholder="Optional" />
              </label>
              <label>
                Your email
                <div className="mentor-email-row">
                  <Mail size={14} />
                  <input value={requestEmail} onChange={(e) => setRequestEmail(e.target.value)} placeholder="you@example.com" type="email" />
                </div>
              </label>
              <button className="btn-primary" onClick={submitMentorRequest}>Request this session</button>
              {requestStatus && <p className="mentor-request-status">{requestStatus}</p>}
            </div>
          </section>
        </div>
      </article>
    </section>
  );
};

const ResultsDashboard = ({ results }) => {
  const [shortlist, setShortlist] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [showCompare, setShowCompare] = useState(false);

  const allResults = useMemo(() => [...results.High, ...results.Medium, ...results.Low], [results]);
  const selectedItem = useMemo(() => allResults.find((i) => i.id === selectedId) || null, [allResults, selectedId]);
  const shortlistItems = useMemo(() => allResults.filter((i) => shortlist.has(i.id)), [allResults, shortlist]);

  const toggleShortlist = (item) => {
    setShortlist((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  if (selectedItem) {
    return (
      <UniversityFullPage
        item={selectedItem}
        isShortlisted={shortlist.has(selectedItem.id)}
        onToggleShortlist={toggleShortlist}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="results-wrap flex-col animate-fade-in">
      <header className="results-header report-header">
        <h1>Your <span className="text-gradient">GlowBal</span> match report</h1>
        <p>Select a university to open a full-screen details page.</p>
      </header>

      <section className="glass-panel report-menu-bar">
        <div className="report-menu-actions">
          <span className="report-shortlist-chip"><Bookmark size={14} /> {shortlistItems.length} shortlisted</span>
          <button className="btn-secondary" onClick={() => setShowCompare((v) => !v)} disabled={!shortlistItems.length}>
            <Columns3 size={15} /> {showCompare ? 'Hide compare' : 'Compare shortlisted'}
          </button>
        </div>
      </section>

      {showCompare && (
        <section className="glass-panel compare-modal-panel">
          <h2>Compare shortlisted universities</h2>
          <div className="compare-grid">
            {shortlistItems.map((item) => (
              <article key={item.id} className="compare-card">
                <UniversityImage item={item} className="compare-card-image" />
                <h3>{item.name}</h3>
                <p>{item.location}</p>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ marginTop: '0.6rem', textDecoration: 'none' }}>
                  Official site <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="report-columns" aria-label="University recommendation columns">
        {TIER_CONFIG.map(({ key, label, description, icon: TierGlyph, color }) => {
          const tierItems = (results[key] || []).slice(0, 4);
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
                  const isShortlisted = shortlist.has(item.id);
                  return (
                    <button key={item.id} className="report-compact-card" onClick={() => setSelectedId(item.id)}>
                      <UniversityImage item={item} className="report-compact-image" />
                      <div className="report-compact-body">
                        <div><h3>{item.name}</h3><p>{item.location}</p></div>
                        <span className="report-score-pill">Match {item.score}%</span>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        className={`report-card-bookmark ${isShortlisted ? 'is-on' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleShortlist(item); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleShortlist(item); } }}
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

      <div className="results-footer-cta">
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Start a new matching run <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ResultsDashboard;
