/**
 * Public demo entry point — cinematic boot sequence before entering the app.
 * Visiting /demo (no auth required) lands here, shows boot animation, then redirects.
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDemoMode } from '../context/DemoModeContext';
import { resolveDomainId, withDomainQuery } from '../data/domainModuleCatalog';
import { setSelectedDomain } from '../services/onboarding';

const BOOT_LINES = [
  { text: 'Initialising Brain Orchestrator...', delay: 300, color: 'text-slate-300' },
  { text: 'Loading Market Intelligence Agent...', delay: 800, color: 'text-slate-300' },
  { text: 'Connecting Creative Studio...', delay: 1300, color: 'text-slate-300' },
  { text: 'Syncing CRM Pipeline...', delay: 1800, color: 'text-slate-300' },
  { text: '10 agents ready.', delay: 2200, color: 'text-emerald-400' },
];

export default function DemoEntryPage() {
  const { enableDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const domain = resolveDomainId(params.get('domain'));
    if (domain) setSelectedDomain(domain);
    enableDemoMode('manual', domain);

    // Schedule each boot line appearing
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines((prev) => [...prev, i]);
      }, line.delay));
    });

    // Fade out after 2.8s
    timers.push(setTimeout(() => setFadeOut(true), 2800));

    // Navigate after fade completes (~3.1s)
    timers.push(setTimeout(() => {
      navigate(withDomainQuery('/app/dashboard', domain), { replace: true });
    }, 3200));

    return () => timers.forEach((t) => clearTimeout(t));
  }, [enableDemoMode, navigate, location.search]);

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden transition-opacity duration-500"
      style={{
        background: 'oklch(9% .008 255)',
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* CSS Keyframes */}
      <style>{`
        @keyframes dotDrift {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
        }
        @keyframes pulseLogo {
          0%, 100% { box-shadow: 0 0 24px #3c91ed4d, 0 0 48px #3c91ed22; }
          50% { box-shadow: 0 0 48px #3c91ed80, 0 0 96px #3c91ed44; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes bootLineIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #3c91ed14 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Animated background particles (pure CSS) */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            background: i % 4 === 0 ? '#3c91ed' : i % 4 === 1 ? '#7c3aed' : i % 4 === 2 ? '#10b981' : '#3c91ed',
            left: `${(i * 17 + 5) % 95}%`,
            top: `${(i * 23 + 8) % 90}%`,
            opacity: 0.3,
            animation: `dotDrift ${3 + (i % 4)}s ease-in-out ${(i * 0.4) % 3}s infinite`,
          }}
        />
      ))}

      {/* Glow orb */}
      <div
        className="pointer-events-none absolute rounded-full blur-[120px] opacity-20"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, #3c91ed 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
        }}
      />

      {/* Demo workspace badge */}
      <div
        className="absolute top-6 right-6 rounded-full px-4 py-1.5 text-xs font-semibold"
        style={{
          background: 'oklch(13% .008 255)',
          border: '1px solid oklch(24% .008 255)',
          color: '#3c91ed',
          animation: 'fadeIn 0.4s ease forwards',
        }}
      >
        Demo workspace
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Logo */}
        <div
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{
            background: 'oklch(13% .008 255)',
            border: '1px solid oklch(24% .008 255)',
            animation: 'pulseLogo 2s ease-in-out infinite',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3c91ed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="mb-2 text-2xl font-extrabold tracking-tight text-white"
          style={{ animation: 'fadeIn 0.5s 0.1s ease both' }}
        >
          Digital CMO AI
        </h1>
        <p
          className="mb-10 text-sm text-slate-500"
          style={{ animation: 'fadeIn 0.5s 0.2s ease both' }}
        >
          Initialising your AI marketing workspace…
        </p>

        {/* Boot lines terminal */}
        <div
          className="w-full rounded-2xl p-6 mb-8 text-left font-mono text-sm"
          style={{
            background: 'oklch(11% .008 255)',
            border: '1px solid oklch(20% .008 255)',
            minHeight: '160px',
          }}
        >
          <div className="mb-3 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            <span className="ml-2 text-xs text-slate-600">boot.log</span>
          </div>
          <div className="space-y-2">
            {BOOT_LINES.map((line, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 transition-all ${line.color} ${
                  visibleLines.includes(i) ? 'opacity-100' : 'opacity-0'
                }`}
                style={
                  visibleLines.includes(i)
                    ? { animation: 'bootLineIn 0.35s ease forwards' }
                    : {}
                }
              >
                <span className="text-slate-600 select-none">›</span>
                <span>{line.text}</span>
                {i === BOOT_LINES.length - 1 && visibleLines.includes(i) && (
                  <span className="ml-1 text-emerald-400">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-full overflow-hidden rounded-full"
          style={{
            height: '4px',
            background: 'oklch(18% .008 255)',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3c91ed, #7c3aed)',
              boxShadow: '0 0 12px #3c91ed80',
              animation: 'progressFill 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
              width: '0%',
            }}
          />
        </div>

        <p
          className="mt-4 text-xs text-slate-600"
          style={{ animation: 'fadeIn 0.5s 0.4s ease both' }}
        >
          No credit card required · Live demo data
        </p>
      </div>
    </div>
  );
}
