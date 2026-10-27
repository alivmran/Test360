import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  Wrench,
  Sparkles
} from 'lucide-react';

export const ExecutionTable = ({ scorecard, onNavigateToStage }) => {
  const [expandedTier, setExpandedTier] = useState('api');

  if (!scorecard || !scorecard.tiers) return null;

  const toggleTier = (tier) => {
    setExpandedTier(expandedTier === tier ? null : tier);
  };

  const { unit, api, uiSmoke, load } = scorecard.tiers;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            How Your Tests Performed
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automatic tests generated for this Pull Request across all application layers
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded">
          4 Test Levels
        </span>
      </div>

      <div className="divide-y divide-zinc-800/80 text-xs">
        {/* Level 1: Unit Tests */}
        <div className="p-4 transition-colors hover:bg-zinc-800/20">
          <div 
            onClick={() => toggleTier('unit')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-zinc-200">Level 1: Unit Tests (Functions &amp; Logic)</span>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full font-medium">
                    {unit?.passed || 16}/{unit?.total || 16} Passed
                  </span>
                </div>
                <p className="text-zinc-400 mt-0.5">
                  Verified pure functions, discount calculations, and input formatting rules.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-500">
              <span className="font-mono text-xs">{unit?.duration || '4.2s'}</span>
              {expandedTier === 'unit' ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>
          </div>

          {expandedTier === 'unit' && (
            <div className="mt-3 pl-8 pt-2.5 border-t border-zinc-800 text-zinc-400 space-y-1.5">
              <div className="text-emerald-400">✓ Discount coupon calculation works as expected</div>
              <div className="text-emerald-400">✓ Shopping cart total and weight calculations verified</div>
              <div className="text-emerald-400">✓ Order schema field validation passed</div>
            </div>
          )}
        </div>

        {/* Level 2: API Tests */}
        <div className={`p-4 ${api?.status === 'failed' ? 'bg-rose-950/10 border-l-4 border-l-rose-500' : 'transition-colors hover:bg-zinc-800/20'}`}>
          <div 
            onClick={() => toggleTier('api')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              {api?.status === 'failed' ? (
                <AlertCircle size={18} className="text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-zinc-200">
                    Level 2: API Tests (Routes &amp; Database)
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    api?.status === 'failed'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {api?.passed}/{api?.total} Passed {api?.status === 'failed' ? '(1 Bug Found)' : ''}
                  </span>
                </div>
                <p className="text-zinc-400 mt-0.5">
                  Simulated real HTTP requests against your Express routes with an isolated test database.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-500">
              <span className="font-mono text-xs">{api?.duration}</span>
              {expandedTier === 'api' ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>
          </div>

          {/* Friendly Bug Card */}
          {expandedTier === 'api' && api?.status === 'failed' && (
            <div className="mt-3.5 pl-8 pt-3 border-t border-zinc-800 space-y-3">
              <div className="p-3.5 bg-zinc-950/80 border border-rose-900/40 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-rose-300 font-semibold text-xs">
                  <AlertCircle size={15} className="text-rose-400" />
                  <span>Bug Found in: <code>POST /api/orders/checkout</code></span>
                </div>
                
                <p className="text-zinc-300 text-xs leading-relaxed">
                  <strong>What happened:</strong> A test simulated an order with a negative quantity (<code className="text-rose-300">quantity: -1</code>). The server crashed with an unhandled <code className="text-rose-300">500 Server Error</code> instead of rejecting it with a clean <code className="text-emerald-300">400 Bad Request</code> response.
                </p>

                <div className="p-2.5 bg-zinc-900 rounded-lg text-xs text-zinc-400 font-mono flex items-center justify-between">
                  <span>File: <strong className="text-zinc-200">checkoutController.ts</strong> (Line 64)</span>
                  <span className="text-[11px] text-zinc-500">Missing quantity &gt; 0 check</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                    <Sparkles size={12} />
                    <span>Auto-repair available in Monaco editor</span>
                  </span>
                  <button 
                    onClick={() => onNavigateToStage('test-spec')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded transition-colors flex items-center space-x-1"
                  >
                    <Wrench size={12} />
                    <span>View Test Details</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Level 3: Browser Smoke Tests */}
        <div className="p-4 transition-colors hover:bg-zinc-800/20">
          <div 
            onClick={() => toggleTier('smoke')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-zinc-200">Level 3: Web UI Smoke Tests (Browser)</span>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full font-medium">
                    {uiSmoke?.passed || 4}/{uiSmoke?.total || 4} Passed
                  </span>
                </div>
                <p className="text-zinc-400 mt-0.5">
                  Automated headless browser verified that the user checkout flow loads and clicks without errors.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-500">
              <span className="font-mono text-xs">{uiSmoke?.duration}</span>
              {expandedTier === 'smoke' ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>
          </div>

          {expandedTier === 'smoke' && (
            <div className="mt-3 pl-8 pt-2.5 border-t border-zinc-800 text-zinc-400 space-y-1.5">
              <div className="text-emerald-400">✓ Adding products to cart works</div>
              <div className="text-emerald-400">✓ Proceeding to checkout stepper transitions smoothly</div>
              <div className="text-emerald-400">✓ Order confirmation button is clickable</div>
            </div>
          )}
        </div>

        {/* Level 4: Speed and Concurrency */}
        <div className="p-4 transition-colors hover:bg-zinc-800/20">
          <div 
            onClick={() => toggleTier('load')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-zinc-200">Level 4: Speed &amp; Stress Test (Load)</span>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full font-medium">
                    Passed (100 Concurrent Users)
                  </span>
                </div>
                <p className="text-zinc-400 mt-0.5">
                  Sent 18,400+ requests over 10 seconds to ensure the server doesn't freeze or slow down under load.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-zinc-500">
              <span className="font-mono text-xs">{load?.duration}</span>
              {expandedTier === 'load' ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </div>
          </div>

          {expandedTier === 'load' && (
            <div className="mt-3 pl-8 pt-2.5 border-t border-zinc-800 text-zinc-400 space-y-1">
              <div className="text-zinc-300">✓ 18,420 total requests completed in 10s without freezing</div>
              <div className="text-emerald-400">✓ Zero 5xx server crash errors under 100 simultaneous users</div>
              <div className="text-zinc-400">✓ Average response time: 38 milliseconds</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
