import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const HistoricalRegressionChart = ({
  historicalRuns = [],
  activePrNumber,
  onSelectPr,
}) => {
  const [trendMetric, setTrendMetric] = useState('quality');

  const chartData = (historicalRuns || []).map((run) => ({
    prNumber: run.prNumber,
    title: run.prTitle || run.title || `Pull Request #${run.prNumber}`,
    qualityScore: run.mutationKillScore ?? run.mutationScore?.score ?? 80,
    speedMs: run.latencyP90 ?? run.latency?.p90 ?? 40,
    status: run.status,
  }));

  const sortedRecentFirst = [...chartData].sort((a, b) => b.prNumber - a.prNumber);

  return (
    <div className="space-y-5">
      {/* Trend Chart Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-zinc-800 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Quality &amp; Speed Over Time
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Compare how recent pull requests performed.
            </p>
          </div>

          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTrendMetric('quality')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                trendMetric === 'quality'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Test Quality (%)
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric('speed')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                trendMetric === 'speed'
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              API Speed (ms)
            </button>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="prNumber"
                stroke="#71717A"
                tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickFormatter={(val) => `PR #${val}`}
              />
              <YAxis
                stroke="#71717A"
                tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                domain={trendMetric === 'quality' ? [60, 100] : [0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181B',
                  borderColor: '#27272A',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#FAFAFA',
                }}
                labelFormatter={(val) => `Pull Request #${val}`}
              />
              {trendMetric === 'quality' ? (
                <Line
                  type="monotone"
                  dataKey="qualityScore"
                  name="Test Quality (%)"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
              ) : (
                <Line
                  type="monotone"
                  dataKey="speedMs"
                  name="Response Time (ms)"
                  stroke="#E4E4E7"
                  strokeWidth={2}
                  dot={{ fill: '#E4E4E7', r: 3.5 }}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive PR History List */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">Recent Pull Requests</h3>
          <span className="text-xs text-zinc-400">Click any PR to inspect it</span>
        </div>
        <div className="divide-y divide-zinc-800/70">
          {sortedRecentFirst.map((pr) => {
            const isActive = pr.prNumber === activePrNumber;
            const isFailed = pr.status === 'failed';
            return (
              <button
                key={pr.prNumber}
                type="button"
                onClick={() => onSelectPr?.(pr.prNumber)}
                className={`w-full text-left px-5 py-3 flex items-center justify-between gap-4 transition-colors ${
                  isActive ? 'bg-zinc-800/60' : 'hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {isFailed ? (
                    <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-zinc-400">#{pr.prNumber}</span>
                      <span className="text-sm font-medium text-zinc-100 truncate">
                        {pr.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs">
                  <span className="hidden sm:inline text-zinc-400 font-mono">
                    {Number(pr.qualityScore).toFixed(0)}% · {pr.speedMs} ms
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      isFailed
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    {isFailed ? 'Issue found' : 'Passed'}
                  </span>
                  <ArrowRight size={14} className="text-zinc-500" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
