/**
 * AgentBoot — slim agent-status banner shown at the top of the app in demo mode.
 * Shows agent count, pulsing status dot, and a scrolling marquee of recent agent actions.
 */
import { useState } from 'react';
import { X } from 'lucide-react';
import { useDemoMode } from '../../context/DemoModeContext';

const TICKER_ITEMS = [
  'Creative Studio generated 3 ad variants',
  'SEO Engine found 47 ranking opportunities',
  'Analytics detected +12% ROAS opportunity',
  'CRM scored 156 new leads',
  'Brain Orchestrator updated campaign strategy',
  'Market Intelligence completed competitor analysis',
  'Email Optimiser improved subject lines for 3 campaigns',
  'Growth Hacker identified 8 churn-risk accounts',
  'Budget Allocation Engine reallocated $2,400 to top channels',
  'Social Media Agent scheduled 12 posts across 4 platforms',
];

export function AgentBoot() {
  const { isDemoMode } = useDemoMode();
  const [dismissed, setDismissed] = useState(false);

  if (!isDemoMode || dismissed) return null;

  const tickerText = TICKER_ITEMS.join(' · ') + ' · ';

  return (
    <>
      <style>{`
        @keyframes marqueeScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes agentPulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 #22c55e66; }
          50% { opacity: 0.8; transform: scale(1.2); box-shadow: 0 0 0 4px #22c55e22; }
        }
      `}</style>

      <div
        className="relative flex items-center justify-between overflow-hidden shrink-0 select-none"
        style={{
          height: '40px',
          background: 'linear-gradient(90deg, #1e3a5f 0%, #1a2f4e 40%, #1e3a5f 100%)',
          borderBottom: '1px solid #3c91ed30',
          boxShadow: '0 1px 0 #3c91ed18',
        }}
      >
        {/* Left: agent count + status */}
        <div className="flex items-center gap-3 pl-4 flex-shrink-0 z-10 pr-3" style={{ background: 'linear-gradient(90deg, #1e3a5f 80%, transparent)' }}>
          <span className="text-xs font-bold text-white whitespace-nowrap">🤖 10 agents active</span>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full bg-emerald-400"
              style={{ animation: 'agentPulse 2s ease-in-out infinite' }}
            />
            <span className="text-xs text-emerald-400 font-semibold whitespace-nowrap hidden sm:inline">Brain Orchestrator coordinating</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative min-w-0">
          <div
            className="flex items-center whitespace-nowrap text-xs text-slate-400"
            style={{
              animation: 'marqueeScroll 40s linear infinite',
              width: 'max-content',
            }}
          >
            <span>{tickerText}</span>
            <span>{tickerText}</span>
          </div>
        </div>

        {/* Right: dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 ml-2 mr-2 p-1 rounded hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-300"
          aria-label="Dismiss agent banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </>
  );
}

export default AgentBoot;
