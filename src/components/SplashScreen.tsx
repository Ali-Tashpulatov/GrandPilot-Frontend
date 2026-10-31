import { useState, useEffect, useCallback } from 'react';

const SPLASH_DURATION = 2500; // ms total
const SESSION_KEY = 'grandpilot_splash_shown';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'idle' | 'logo' | 'text' | 'exit' | 'done'>(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return 'done';
    return 'idle';
  });

  const startAnimation = useCallback(() => {
    // Phase 1: Logo reveal (0ms)
    setPhase('logo');

    // Phase 2: Text reveal (800ms)
    setTimeout(() => setPhase('text'), 800);

    // Phase 3: Exit transition (1900ms)
    setTimeout(() => setPhase('exit'), 1900);

    // Phase 4: Done — unmount splash (2500ms)
    setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(SESSION_KEY, '1');
    }, SPLASH_DURATION);
  }, []);

  useEffect(() => {
    if (phase === 'idle') {
      // Tiny delay so the browser paints the dark bg first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => startAnimation());
      });
    }
  }, [phase, startAnimation]);

  if (phase === 'done') {
    return <>{children}</>;
  }

  const showLogo = phase === 'logo' || phase === 'text' || phase === 'exit';
  const showText = phase === 'text' || phase === 'exit';
  const isExiting = phase === 'exit';

  return (
    <>
      {/* Splash overlay */}
      <div
        className={`splash-overlay ${isExiting ? 'splash-exit' : ''}`}
        aria-hidden="true"
      >
        {/* Ambient glow behind logo */}
        <div className={`splash-ambient ${showLogo ? 'splash-ambient-visible' : ''}`} />

        {/* Particle ring */}
        <div className={`splash-ring ${showLogo ? 'splash-ring-visible' : ''}`} />

        {/* Logo */}
        <div className={`splash-logo-wrap ${showLogo ? 'splash-logo-visible' : ''}`}>
          <img
            src="/grandpilot-logo-transparent.png"
            alt="GrandPilot"
            className="splash-logo-img"
            draggable={false}
          />
        </div>

        {/* Horizontal scan line accent */}
        <div className={`splash-scanline ${showLogo ? 'splash-scanline-visible' : ''}`} />
      </div>

      {/* Pre-render children behind splash so the layout is ready */}
      <div style={{ visibility: 'hidden', position: 'fixed', inset: 0 }}>
        {children}
      </div>
    </>
  );
}
