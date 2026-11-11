import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Copy,
  Check,
  RotateCw,
  FileCode2,
} from 'lucide-react';

const PAGE_SIZE = 5;

const UNIT_CASE_TEMPLATES = [
  'Discount coupon applies 10% for valid code',
  'Empty or unknown coupon keeps original price',
  'Negative subtotal is rejected with validation error',
  'Cart weight calculator sums multi-item weights',
  'Zero item quantity fails before database write',
  'Order payload validates required shipping address',
  'Idempotency key format helper accepts valid UUIDs',
  'Stock boundary check allows exact available count',
  'Currency rounding preserves two decimal places',
  'Tax helper applies regional rate accurately',
  'Expired auth token check rejects stale sessions',
  'Payload sanitizer strips unexpected fields',
  'ObjectId validator catches malformed order IDs',
  'Line-item subtotal handles fractional prices',
  'Inventory decrement blocks negative stock balance',
  'Discount cap prevents total from dropping below zero',
  'Shipping tier helper picks rate by total weight',
  'Order number generator returns unique sequence',
  'Promo code expiry check rejects past dates',
  'Cart item deduplication merges identical SKUs',
];

const API_CASE_TEMPLATES = [
  'POST /api/orders/checkout rejects negative quantity with 400',
  'POST /api/orders/checkout creates order on valid payload (201)',
  'POST /api/orders/checkout rejects missing idempotency key (400)',
  'POST /api/orders/checkout rejects quantity = 0 (400)',
  'POST /api/orders/reserve-stock reserves exact stock count (200)',
  'POST /api/orders/reserve-stock returns 409 when stock is short',
  'GET /api/orders/:id/status returns 400 on invalid order ID',
  'GET /api/orders/:id/status returns live order details (200)',
  'PUT /api/orders/:id updates order status cleanly (200)',
  'DELETE /api/orders/:id cancels pending order safely (200)',
  'GET /api/products returns active catalog list (200)',
  'POST /api/cart/validate checks item availability (200)',
];

const BROWSER_CASE_TEMPLATES = [
  'Adding items to cart updates summary badge',
  'Checkout stepper moves cleanly to shipping details',
  'Form shows clear error when required fields are empty',
  'Order confirmation button submits and renders receipt',
  'Mobile viewport navigation menu opens and closes cleanly',
];

const LOAD_CASE_TEMPLATES = [
  'Sustained 100 concurrent connections without timeouts',
  'Zero 5xx server crashes during peak traffic burst',
  'Event-loop responsiveness stayed within fast threshold',
];

const buildTierCases = (tierId, tierData, scorecard) => {
  if (Array.isArray(tierData?.cases) && tierData.cases.length > 0) {
    return tierData.cases;
  }

  if (tierId === 'load') {
    return LOAD_CASE_TEMPLATES.map((name, idx) => ({
      id: `LOAD-${idx + 1}`,
      name,
      status: tierData?.status === 'failed' ? 'failed' : 'passed',
      duration: `${18 + idx * 7}ms`,
    }));
  }

  const templatesByTier = {
    unit: UNIT_CASE_TEMPLATES,
    api: API_CASE_TEMPLATES,
    smoke: BROWSER_CASE_TEMPLATES,
  };
  const prefixByTier = {
    unit: 'UT',
    api: 'API',
    smoke: 'UI',
  };

  const templates = templatesByTier[tierId] || UNIT_CASE_TEMPLATES;
  const prefix = prefixByTier[tierId] || 'TC';
  const total = Math.max(1, Number(tierData?.total) || templates.length);
  const passed = Math.min(total, Number(tierData?.passed ?? total));
  const failedCount = Math.max(0, total - passed);

  const cases = [];
  for (let i = 0; i < total; i += 1) {
    const isFailed = i < failedCount;
    const baseTitle =
      templates[i] || `${tierId.toUpperCase()} verification check #${i + 1}`;
    const name =
      isFailed && tierId === 'api' && i === 0
        ? scorecard?.isolatedDefect?.description ||
          tierData?.failureMessage ||
          baseTitle
        : baseTitle;

    cases.push({
      id: `${prefix}-${String(i + 1).padStart(2, '0')}`,
      name,
      status: isFailed ? 'failed' : 'passed',
      duration: `${12 + ((i * 17) % 68)}ms`,
    });
  }

  return cases;
};

export const ExecutionTable = ({
  scorecard,
  selectedTier,
  onSelectTier,
  onNavigateToStage,
  onRerunPipeline,
  isRerunning,
}) => {
  const [filter, setFilter] = useState('all');
  const [copiedError, setCopiedError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const tiers = scorecard?.tiers || {};
  const { unit, api, uiSmoke, load } = tiers;

  const checkItems = [
    {
      id: 'unit',
      title: 'Unit Tests',
      status: unit?.status || 'passed',
      summary: `${unit?.passed ?? 16}/${unit?.total ?? 16} passed`,
      duration: unit?.duration || '4.2s',
      details:
        unit?.details ||
        'Checked helper functions, discount math, cart totals, and input rules.',
      cases: buildTierCases('unit', unit, scorecard),
    },
    {
      id: 'api',
      title: 'API Tests',
      status: api?.status || 'passed',
      summary:
        api?.status === 'failed'
          ? `${api?.passed ?? 9}/${api?.total ?? 10} passed · ${(api?.total ?? 10) - (api?.passed ?? 9)} bug`
          : `${api?.passed ?? 10}/${api?.total ?? 10} passed`,
      duration: api?.duration || '18.7s',
      details:
        api?.details ||
        'Tested HTTP endpoints against an isolated test database.',
      failureMessage:
        api?.failureMessage ||
        scorecard?.isolatedDefect?.description ||
        'An API request returned a 500 server error on invalid input.',
      defectFile: scorecard?.isolatedDefect?.file || 'src/controllers/checkoutController.ts',
      defectLine: scorecard?.isolatedDefect?.line || 64,
      cases: buildTierCases('api', api, scorecard),
    },
    {
      id: 'smoke',
      title: 'Browser Tests',
      status: uiSmoke?.status || 'passed',
      summary: `${uiSmoke?.passed ?? 4}/${uiSmoke?.total ?? 4} passed`,
      duration: uiSmoke?.duration || '11.5s',
      details:
        uiSmoke?.details ||
        'Opened the app in a headless browser and clicked through key user flows.',
      cases: buildTierCases('smoke', uiSmoke, scorecard),
    },
    {
      id: 'load',
      title: 'Speed Tests',
      status: load?.status || 'passed',
      summary: `${scorecard?.latency?.p90 ?? load?.p90 ?? 38} ms avg`,
      duration: load?.duration || '18.0s',
      details:
        load?.details ||
        `Simulated ${load?.connections ?? 100} concurrent users to verify response times.`,
      latency: {
        p90: scorecard?.latency?.p90 ?? load?.p90 ?? 38,
        p95: scorecard?.latency?.p95 ?? load?.p95 ?? 61,
        p99: scorecard?.latency?.p99 ?? load?.p99 ?? 112,
        connections: load?.connections ?? 100,
      },
      cases: buildTierCases('load', load, scorecard),
    },
  ];

  // Auto-select failing check first if user hasn't picked one
  useEffect(() => {
    if (!selectedTier) {
      const firstFailed = checkItems.find((c) => c.status === 'failed');
      onSelectTier?.(firstFailed ? firstFailed.id : 'unit');
    }
  }, [scorecard?.prNumber]);

  const filteredItems = checkItems.filter((item) => {
    if (filter === 'passed') return item.status === 'passed';
    if (filter === 'failed') return item.status === 'failed';
    return true;
  });

  const activeCheck =
    checkItems.find((item) => item.id === selectedTier) ||
    filteredItems[0] ||
    checkItems[0];

  // Reset pagination to page 1 when switching check category or PR
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCheck?.id, scorecard?.prNumber]);

  const totalCases = activeCheck?.cases?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCases / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedCases = (activeCheck?.cases || []).slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleCopyError = () => {
    if (!activeCheck?.failureMessage) return;
    navigator.clipboard.writeText(
      `${activeCheck.defectFile}:${activeCheck.defectLine} - ${activeCheck.failureMessage}`
    );
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2000);
  };

  if (!scorecard || !scorecard.tiers) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Compact Interactive Check List */}
      <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col self-start">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Test Results</h2>
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'failed', label: 'Issues' },
              { id: 'passed', label: 'Passed' },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setFilter(pill.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filter === pill.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-zinc-800/70">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No checks match this filter.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = activeCheck?.id === item.id;
              const isFailed = item.status === 'failed';
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTier?.(item.id)}
                  className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-zinc-800/60' : 'hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    {isFailed ? (
                      <AlertCircle size={17} className="text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-100 truncate">
                        {item.title}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          isFailed ? 'text-rose-400' : 'text-zinc-400'
                        }`}
                      >
                        {item.summary}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-zinc-500 shrink-0 ml-2">
                    <span className="text-xs font-mono">{item.duration}</span>
                    <ChevronRight
                      size={15}
                      className={isSelected ? 'text-zinc-200' : 'text-zinc-600'}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Focused Detail Inspector with 5-per-page Pagination */}
      <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
        {activeCheck && (
          <>
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-zinc-100">
                      {activeCheck.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        activeCheck.status === 'failed'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      {activeCheck.status === 'failed' ? 'Issue found' : 'Passed'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{activeCheck.details}</p>
                </div>

                <span className="text-xs font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md">
                  Ran in {activeCheck.duration}
                </span>
              </div>

              {/* Failure banner if failed */}
              {activeCheck.status === 'failed' && (
                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-1.5">
                    <div className="text-xs font-semibold text-rose-300">
                      What went wrong
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed">
                      {activeCheck.failureMessage}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2 font-mono text-zinc-300">
                      <FileCode2 size={14} className="text-zinc-500" />
                      <span>
                        {activeCheck.defectFile} · Line {activeCheck.defectLine}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyError}
                      className="inline-flex items-center space-x-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
                    >
                      {copiedError ? (
                        <>
                          <Check size={13} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy error</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Response time summary for Speed Tests */}
              {activeCheck.latency && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-[11px] text-zinc-500">Typical (90%)</div>
                    <div className="text-sm font-semibold text-zinc-100 mt-0.5 font-mono">
                      {activeCheck.latency.p90} ms
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-[11px] text-zinc-500">Slow (95%)</div>
                    <div className="text-sm font-semibold text-zinc-100 mt-0.5 font-mono">
                      {activeCheck.latency.p95} ms
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="text-[11px] text-zinc-500">Slowest (99%)</div>
                    <div className="text-sm font-semibold text-zinc-100 mt-0.5 font-mono">
                      {activeCheck.latency.p99} ms
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Test Cases List (5 per page) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>
                    Showing {totalCases === 0 ? 0 : startIndex + 1}–
                    {Math.min(startIndex + PAGE_SIZE, totalCases)} of {totalCases} checks
                  </span>
                  {totalPages > 1 && (
                    <span className="font-mono">
                      Page {safePage} of {totalPages}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {paginatedCases.map((testCase) => {
                    const caseFailed = testCase.status === 'failed';
                    return (
                      <div
                        key={testCase.id}
                        className={`flex items-center justify-between gap-3 text-xs px-3.5 py-2.5 rounded-lg border ${
                          caseFailed
                            ? 'bg-rose-950/15 border-rose-900/40 text-rose-200'
                            : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {caseFailed ? (
                            <AlertCircle size={14} className="text-rose-400 shrink-0" />
                          ) : (
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          )}
                          <span className="font-mono text-[11px] text-zinc-500 shrink-0">
                            {testCase.id}
                          </span>
                          <span className="truncate">{testCase.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-500 shrink-0">
                          {testCase.duration}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center space-x-1 transition-colors"
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 rounded-md text-xs font-mono transition-colors ${
                            pageNum === safePage
                              ? 'bg-zinc-100 text-zinc-950 font-semibold'
                              : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center space-x-1 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Action Footer */}
            <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onRerunPipeline}
                disabled={isRerunning}
                className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium inline-flex items-center space-x-1.5 transition-colors"
              >
                <RotateCw size={13} className={isRerunning ? 'animate-spin' : ''} />
                <span>{isRerunning ? 'Running...' : 'Re-run checks'}</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => onNavigateToStage?.('ast-graph')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                >
                  Open Code Map
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToStage?.('test-spec')}
                  className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
                >
                  <span>View Generated Tests</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
