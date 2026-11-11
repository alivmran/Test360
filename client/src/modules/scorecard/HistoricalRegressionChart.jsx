import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  GitCommit,
  User,
  Clock,
  ArrowLeftRight,
} from 'lucide-react';

const CustomHistoryTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;
  const isFailed = item.status === 'failed';

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl text-xs space-y-1.5 min-w-[200px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono font-semibold text-zinc-100">PR #{item.prNumber}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            isFailed ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {isFailed ? 'Issue found' : 'Passed'}
        </span>
      </div>
      <div className="text-zinc-300 truncate max-w-[240px]">{item.title}</div>
      <div className="pt-1 border-t border-zinc-800 flex items-center justify-between text-zinc-400">
        <span>Quality: <strong className="text-emerald-400">{Number(item.qualityScore).toFixed(0)}%</strong></span>
        <span>Speed: <strong className="text-indigo-300">{item.speedMs} ms</strong></span>
      </div>
    </div>
  );
};

export const HistoricalRegressionChart = ({
  historicalRuns = [],
  activePrNumber,
  onSelectPr,
}) => {
  const [trendMetric, setTrendMetric] = useState('both'); // 'quality' | 'speed' | 'both'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'passed' | 'failed'
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPrNumber, setPreviewPrNumber] = useState(activePrNumber);
  const [comparePrNumber, setComparePrNumber] = useState(null);

  const normalizedRuns = useMemo(() => {
    return (historicalRuns || [])
      .map((run) => ({
        prNumber: run.prNumber,
        title: run.prTitle || run.title || `Pull Request #${run.prNumber}`,
        qualityScore: Number(run.mutationKillScore ?? run.mutationScore?.score ?? 80),
        speedMs: Number(run.latencyP90 ?? run.latency?.p90 ?? 40),
        speedP95: Number(run.latencyP95 ?? run.latency?.p95 ?? 64),
        durationSec: Number(run.totalDurationSec ?? (run.totalDurationMs ? run.totalDurationMs / 1000 : 48)),
        author: run.author || 'developer',
        commitSha: run.commitSha || 'HEAD',
        timestamp: run.timestamp || '',
        status: run.status === 'failed' ? 'failed' : 'passed',
      }))
      .sort((a, b) => a.prNumber - b.prNumber);
  }, [historicalRuns]);

  useEffect(() => {
    if (normalizedRuns.length > 0) {
      const exists = normalizedRuns.some((r) => r.prNumber === previewPrNumber);
      if (!exists) {
        setPreviewPrNumber(
          activePrNumber ?? normalizedRuns[normalizedRuns.length - 1].prNumber
        );
      }
      if (comparePrNumber === null && normalizedRuns.length > 1) {
        const sortedDesc = [...normalizedRuns].sort((a, b) => b.prNumber - a.prNumber);
        const defaultTarget =
          sortedDesc.find((r) => r.prNumber !== (previewPrNumber ?? activePrNumber)) ||
          sortedDesc[1];
        setComparePrNumber(defaultTarget?.prNumber ?? null);
      }
    }
  }, [normalizedRuns, activePrNumber]);

  const filteredRuns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return normalizedRuns.filter((run) => {
      if (statusFilter === 'passed' && run.status !== 'passed') return false;
      if (statusFilter === 'failed' && run.status !== 'failed') return false;
      if (!q) return true;
      return (
        String(run.prNumber).includes(q) ||
        run.title.toLowerCase().includes(q) ||
        run.author.toLowerCase().includes(q)
      );
    });
  }, [normalizedRuns, statusFilter, searchQuery]);

  const sortedRecentFirst = useMemo(() => {
    return [...filteredRuns].sort((a, b) => b.prNumber - a.prNumber);
  }, [filteredRuns]);

  const previewPr =
    normalizedRuns.find((r) => r.prNumber === previewPrNumber) ||
    sortedRecentFirst[0] ||
    normalizedRuns[0] ||
    null;

  const comparePr =
    normalizedRuns.find((r) => r.prNumber === comparePrNumber) || null;

  // Overall trend summaries
  const totalRuns = normalizedRuns.length;
  const passedRuns = normalizedRuns.filter((r) => r.status === 'passed').length;
  const avgQuality =
    totalRuns > 0
      ? normalizedRuns.reduce((sum, r) => sum + r.qualityScore, 0) / totalRuns
      : 0;
  const avgSpeed =
    totalRuns > 0
      ? normalizedRuns.reduce((sum, r) => sum + r.speedMs, 0) / totalRuns
      : 0;
  const qualityTrendDelta =
    totalRuns > 1
      ? normalizedRuns[totalRuns - 1].qualityScore - normalizedRuns[0].qualityScore
      : 0;

  const qualityDiff =
    previewPr && comparePr ? previewPr.qualityScore - comparePr.qualityScore : 0;
  const speedDiff =
    previewPr && comparePr ? previewPr.speedMs - comparePr.speedMs : 0;

  return (
    <div className="space-y-5">
      {/* Top Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Pass Rate</div>
            <div className="text-lg font-bold text-zinc-100 mt-0.5">
              {passedRuns} of {totalRuns} passed
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0}%
          </span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Average Test Quality</div>
            <div className="text-lg font-bold text-zinc-100 mt-0.5">
              {avgQuality.toFixed(0)}%
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              qualityTrendDelta >= 0
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                : 'text-rose-300 bg-rose-500/10 border border-rose-500/20'
            }`}
          >
            {qualityTrendDelta >= 0 ? '+' : ''}
            {qualityTrendDelta.toFixed(1)}% trend
          </span>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Average API Speed</div>
            <div className="text-lg font-bold text-zinc-100 mt-0.5">
              {avgSpeed.toFixed(0)} ms
            </div>
          </div>
          <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full">
            p90 response
          </span>
        </div>
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <h3 className="text-sm font-semibold text-zinc-100">
                Quality &amp; Speed Over Time
              </h3>
              <div className="flex items-center space-x-3 text-[11px] text-zinc-400">
                {(trendMetric === 'quality' || trendMetric === 'both') && (
                  <span className="inline-flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Quality (%)</span>
                  </span>
                )}
                {(trendMetric === 'speed' || trendMetric === 'both') && (
                  <span className="inline-flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span>API Speed (ms)</span>
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any point on the chart to preview and compare pull requests.
            </p>
          </div>

          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs w-fit">
            {[
              { id: 'both', label: 'Both' },
              { id: 'quality', label: 'Test Quality (%)' },
              { id: 'speed', label: 'API Speed (ms)' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setTrendMetric(mode.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  trendMetric === mode.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredRuns.length > 0 ? filteredRuns : normalizedRuns}
              margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
              onClick={(state) => {
                const clickedPr = state?.activePayload?.[0]?.payload?.prNumber;
                if (clickedPr) {
                  setPreviewPrNumber(clickedPr);
                }
              }}
            >
              <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="prNumber"
                stroke="#71717A"
                tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(val) => `PR #${val}`}
              />
              {(trendMetric === 'quality' || trendMetric === 'both') && (
                <YAxis
                  yAxisId="quality"
                  stroke="#71717A"
                  tick={{ fill: '#10B981', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  domain={[60, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
              )}
              {(trendMetric === 'speed' || trendMetric === 'both') && (
                <YAxis
                  yAxisId="speed"
                  orientation={trendMetric === 'both' ? 'right' : 'left'}
                  stroke="#71717A"
                  tick={{ fill: '#818CF8', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${v}ms`}
                />
              )}
              <Tooltip content={<CustomHistoryTooltip />} />
              {(trendMetric === 'quality' || trendMetric === 'both') && (
                <Line
                  yAxisId="quality"
                  type="monotone"
                  dataKey="qualityScore"
                  name="Test Quality (%)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4, cursor: 'pointer' }}
                  activeDot={{ r: 6, stroke: '#FAFAFA', strokeWidth: 1.5 }}
                />
              )}
              {(trendMetric === 'speed' || trendMetric === 'both') && (
                <Line
                  yAxisId="speed"
                  type="monotone"
                  dataKey="speedMs"
                  name="API Speed (ms)"
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={{ fill: '#818CF8', r: 4, cursor: 'pointer' }}
                  activeDot={{ r: 6, stroke: '#FAFAFA', strokeWidth: 1.5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Interactive Master-Detail: PR List + Comparison Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Filterable PR History List */}
        <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative flex-1 min-w-[160px]">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Filter by PR #, title, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
              {[
                { id: 'all', label: 'All' },
                { id: 'passed', label: 'Passed' },
                { id: 'failed', label: 'Issues' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    statusFilter === pill.id
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-zinc-800/70 max-h-[340px] overflow-y-auto">
            {sortedRecentFirst.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No pull requests match your filter.
              </div>
            ) : (
              sortedRecentFirst.map((pr) => {
                const isPreviewed = previewPr?.prNumber === pr.prNumber;
                const isFailed = pr.status === 'failed';
                return (
                  <button
                    key={pr.prNumber}
                    type="button"
                    onClick={() => setPreviewPrNumber(pr.prNumber)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                      isPreviewed ? 'bg-indigo-950/25' : 'hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {isFailed ? (
                        <AlertCircle size={15} className="text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono text-zinc-400 shrink-0">
                            #{pr.prNumber}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-zinc-100 truncate">
                            {pr.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          @{pr.author}
                          {pr.timestamp ? ` · ${pr.timestamp}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2.5 shrink-0 text-xs">
                      <span className="hidden sm:inline font-mono text-zinc-400">
                        {pr.qualityScore.toFixed(0)}% · {pr.speedMs}ms
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          isFailed
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {isFailed ? 'Issue' : 'Passed'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Interactive PR Inspector & Side-by-Side Comparison */}
        {previewPr && (
          <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
                    <span className="font-mono text-zinc-200 font-semibold">
                      PR #{previewPr.prNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        previewPr.status === 'failed'
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {previewPr.status === 'failed' ? 'Issue found' : 'Passed'}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
                    {previewPr.title}
                  </h4>
                </div>
              </div>

              {/* Metadata Pills */}
              <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                <span className="inline-flex items-center space-x-1">
                  <User size={12} className="text-zinc-500" />
                  <span>@{previewPr.author}</span>
                </span>
                <span className="inline-flex items-center space-x-1 font-mono">
                  <GitCommit size={12} className="text-zinc-500" />
                  <span>{String(previewPr.commitSha).slice(0, 7)}</span>
                </span>
                <span className="inline-flex items-center space-x-1">
                  <Clock size={12} className="text-zinc-500" />
                  <span>{previewPr.durationSec.toFixed(1)}s</span>
                </span>
              </div>

              {/* Compare Against Baseline */}
              {normalizedRuns.length > 1 && (
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-zinc-400 inline-flex items-center space-x-1.5 font-medium">
                      <ArrowLeftRight size={13} className="text-indigo-400" />
                      <span>Compare with</span>
                    </span>
                    <select
                      aria-label="Compare against pull request"
                      value={comparePr?.prNumber ?? ''}
                      onChange={(e) => setComparePrNumber(Number(e.target.value))}
                      className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:border-zinc-600"
                    >
                      {normalizedRuns
                        .filter((r) => r.prNumber !== previewPr.prNumber)
                        .sort((a, b) => b.prNumber - a.prNumber)
                        .map((opt) => (
                          <option key={opt.prNumber} value={opt.prNumber}>
                            PR #{opt.prNumber}
                          </option>
                        ))}
                    </select>
                  </div>

                  {comparePr && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
                      <div className="p-2 rounded bg-zinc-900/70">
                        <div className="text-[11px] text-zinc-500">Test Quality</div>
                        <div className="font-semibold text-zinc-100 mt-0.5">
                          {previewPr.qualityScore.toFixed(0)}%
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            qualityDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {qualityDiff >= 0 ? '+' : ''}
                          {qualityDiff.toFixed(1)}% vs #{comparePr.prNumber}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-zinc-900/70">
                        <div className="text-[11px] text-zinc-500">API Speed (p90)</div>
                        <div className="font-semibold text-zinc-100 mt-0.5">
                          {previewPr.speedMs} ms
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 ${
                            speedDiff <= 0 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {speedDiff === 0
                            ? 'Same speed'
                            : speedDiff < 0
                            ? `${Math.abs(speedDiff)}ms faster`
                            : `${speedDiff}ms slower`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectPr?.(previewPr.prNumber)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Inspect PR #{previewPr.prNumber} Checks</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
