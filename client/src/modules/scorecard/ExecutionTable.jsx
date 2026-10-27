import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';

export const ExecutionTable = ({ scorecard, onNavigateToStage }) => {
  const [expandedTier, setExpandedTier] = useState('api');

  if (!scorecard || !scorecard.tiers) return null;

  const toggleTier = (tier) => {
    setExpandedTier(expandedTier === tier ? null : tier);
  };

  const { unit, api, uiSmoke, load } = scorecard.tiers;

  return (
    <div className="bg-zinc-925 border border-zinc-800 rounded">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-xs font-mono font-semibold tracking-wide text-zinc-200 uppercase">
          4-Tier Closed-Loop Execution Summary
        </h2>
        <span className="text-[11px] font-mono text-zinc-500">
          Deterministic Sandboxed Pipeline
        </span>
      </div>

      <div className="divide-y divide-zinc-800">
        {/* Tier 1: Unit */}
        <div className="p-4 transition-colors hover:bg-zinc-900/30">
          <div 
            onClick={() => toggleTier('unit')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={16} strokeWidth={1.5} className="text-semantic-emerald shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-zinc-200">Tier 1: Unit (Jest)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                    {unit?.passed || 16}/{unit?.total || 16} Passed
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{unit?.details || 'Pure functions, coupon discount calculator, cart weight aggregator, middleware token formatters.'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-zinc-500">{unit?.duration || '4.2s'}</span>
              {expandedTier === 'unit' ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
            </div>
          </div>

          {expandedTier === 'unit' && (
            <div className="mt-3 pl-7 pt-2 border-t border-zinc-800/80 font-mono text-xs text-zinc-400 space-y-1">
              <div className="text-semantic-emerald">✓ calculateDiscount() with coupon rate logic (3 tests passed)</div>
              <div className="text-semantic-emerald">✓ aggregateCartWeight() multi-item bounds (4 tests passed)</div>
              <div className="text-semantic-emerald">✓ validateOrderPayload schema boundary tests (9 tests passed)</div>
            </div>
          )}
        </div>

        {/* Tier 2: API Integration */}
        <div className={`p-4 ${api?.status === 'failed' ? 'bg-semantic-rose/5 border-l-2 border-l-semantic-rose' : 'transition-colors hover:bg-zinc-900/30'}`}>
          <div 
            onClick={() => toggleTier('api')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              {api?.status === 'failed' ? (
                <XCircle size={16} strokeWidth={1.5} className="text-semantic-rose shrink-0" />
              ) : (
                <CheckCircle2 size={16} strokeWidth={1.5} className="text-semantic-emerald shrink-0" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-zinc-200">
                    Tier 2: API (Supertest + In-Memory MongoDB)
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium ${
                    api?.status === 'failed'
                      ? 'bg-semantic-rose/20 border border-semantic-rose/30 text-semantic-rose'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
                  }`}>
                    {api?.passed}/{api?.total} Passed {api?.status === 'failed' ? '(1 Failed)' : ''}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{api?.details}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-zinc-500">{api?.duration}</span>
              {expandedTier === 'api' ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
            </div>
          </div>

          {expandedTier === 'api' && api?.status === 'failed' && (
            <div className="mt-3 pl-7 pt-2 border-t border-zinc-800/80 space-y-2 font-mono text-xs">
              <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-300">
                <div className="flex items-center justify-between text-semantic-rose mb-1 font-semibold">
                  <span>FAIL: TC-02 Boundary min-1 (item.quantity = -1)</span>
                  <span className="text-[10px] text-zinc-500">POST /api/orders/checkout</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Expected HTTP <span className="text-semantic-emerald font-semibold">400 Bad Request</span>, received <span className="text-semantic-rose font-semibold">500 Internal Server Error</span>.
                </p>
                <div className="mt-2 text-[10px] text-zinc-500 bg-zinc-900 p-2 rounded border border-zinc-800">
                  <code>Location: src/controllers/checkoutController.ts:64:13</code>
                  <br />
                  <code>Product.stockCount -= item.quantity // Cast to Number failed for value &quot;NaN&quot;</code>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400">9 other integration endpoints passed cleanly.</span>
                <button 
                  onClick={() => onNavigateToStage('diagnostics-fix')}
                  className="text-[11px] text-semantic-rose hover:underline flex items-center space-x-1"
                >
                  <span>Inspect Stderr &amp; One-Click Fix &rarr;</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tier 3: UI Smoke */}
        <div className="p-4 transition-colors hover:bg-zinc-900/30">
          <div 
            onClick={() => toggleTier('smoke')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={16} strokeWidth={1.5} className="text-semantic-emerald shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-zinc-200">Tier 3: UI Smoke (Playwright)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                    {uiSmoke?.passed || 4}/{uiSmoke?.total || 4} Passed
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{uiSmoke?.details}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-zinc-500">{uiSmoke?.duration}</span>
              {expandedTier === 'smoke' ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
            </div>
          </div>

          {expandedTier === 'smoke' && (
            <div className="mt-3 pl-7 pt-2 border-t border-zinc-800/80 font-mono text-xs text-zinc-400 space-y-1">
              <div className="text-semantic-emerald">✓ Cart item count verification</div>
              <div className="text-semantic-emerald">✓ Proceed to checkout stepper transition</div>
              <div className="text-semantic-emerald">✓ Stock badge real-time reactive render</div>
              <div className="text-semantic-emerald">✓ Idempotency client header injection</div>
            </div>
          )}
        </div>

        {/* Tier 4: Concurrency/Load */}
        <div className="p-4 transition-colors hover:bg-zinc-900/30">
          <div 
            onClick={() => toggleTier('load')}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 size={16} strokeWidth={1.5} className="text-semantic-emerald shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-zinc-200">Tier 4: Concurrency (Autocannon)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">
                    Passed ({load?.connections || 100} Concurrency)
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{load?.details}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono text-zinc-500">{load?.duration}</span>
              {expandedTier === 'load' ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
            </div>
          </div>

          {expandedTier === 'load' && (
            <div className="mt-3 pl-7 pt-2 border-t border-zinc-800/80 font-mono text-xs text-zinc-400 space-y-1">
              <div>18,420 total requests in 10.05 seconds | Zero 5xx responses</div>
              <div className="text-zinc-300">Average Throughput: 1,842 req/sec | Event Loop Lag: 1.2ms</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
