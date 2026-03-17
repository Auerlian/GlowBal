import React, { useMemo } from 'react';

const palette = ['var(--glowbal-pink)', 'var(--glowbal-mint)', 'var(--glowbal-pink-light)', 'var(--glowbal-mint-light)'];

const makeParticle = (index) => {
  const left = (index * 37) % 100;
  const size = 8 + ((index * 11) % 18);
  const duration = 14 + (index % 10);
  const delay = (index * 0.7) % 9;
  const drift = -16 + ((index * 13) % 32);
  const opacity = 0.14 + ((index * 7) % 12) / 100;
  const color = palette[index % palette.length];

  return { left, size, duration, delay, drift, opacity, color };
};

const AmbientBackground = ({ density = 'page' }) => {
  const count = density === 'hero' ? 22 : density === 'compact' ? 12 : 18;
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => makeParticle(i + 1)), [count]);

  return (
    <div className={`ambient-layer ambient-layer--${density}`} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={`${density}-${i}`}
          className="ambient-diamond"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--ambient-opacity': p.opacity,
            '--ambient-color': p.color
          }}
        />
      ))}
    </div>
  );
};

export default AmbientBackground;
