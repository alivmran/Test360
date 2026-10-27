import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const HistoricalRegressionChart = ({ historicalRuns = [] }) => {
  const [trendMetric, setTrendMetric] = useState('mutation');

  // Normalize data in case backend returns nested or flat objects
  const chartData = (historicalRuns || []).map((run) => ({
    prNumber: run.prNumber,
    mutationKillScore: run.mutationKillScore ?? run.mutationScore?.score ?? 80,
    latencyP90: run.latencyP90 ?? run.latency?.p90 ?? 40,
    latencyP95: run.latencyP95 ?? run.latency?.p95 ?? 65,
    latencyP99: run.latencyP99 ?? run.latency?.p99 ?? 120,
    status: run.status,
  }));

  return (
    <div className="bg-zinc-925 border border-zinc-800 rounded p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-zinc-800 gap-2">
        <div>
          <h3 className="text-xs font-mono font-semibold tracking-wide text-zinc-200 uppercase">
            Historical PR Regression Tracker (Last 8 PRs)
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            Tracking Mutation Kill Score (%) and Latency Percentiles (p90/p95/p99) over time from MongoDB
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setTrendMetric('mutation')}
            className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
              trendMetric === 'mutation'
                ? 'bg-zinc-800 text-zinc-50 border-zinc-700'
                : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            Mutation Kill Score (%)
          </button>
          <button
            onClick={() => setTrendMetric('latency')}
            className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
              trendMetric === 'latency'
                ? 'bg-zinc-800 text-zinc-50 border-zinc-700'
                : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
          >
            Latency Percentiles (ms)
          </button>
        </div>
      </div>

      <div className="h-60 w-full">
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
              domain={trendMetric === 'mutation' ? [70, 95] : [20, 180]}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#121215', 
                borderColor: '#27272A', 
                borderRadius: 4, 
                fontFamily: 'JetBrains Mono',
                fontSize: 11,
                color: '#FAFAFA'
              }} 
            />
            <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#A1A1AA' }} />
            {trendMetric === 'mutation' ? (
              <Line 
                type="monotone" 
                dataKey="mutationKillScore" 
                name="Mutation Kill Score (%)" 
                stroke="#10B981" 
                strokeWidth={1.5}
                dot={{ fill: '#10B981', r: 3 }}
                activeDot={{ r: 5 }}
              />
            ) : (
              <>
                <Line 
                  type="monotone" 
                  dataKey="latencyP90" 
                  name="p90 Latency (ms)" 
                  stroke="#FAFAFA" 
                  strokeWidth={1.5}
                  dot={{ fill: '#FAFAFA', r: 2.5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latencyP95" 
                  name="p95 Latency (ms)" 
                  stroke="#A1A1AA" 
                  strokeWidth={1.5}
                  dot={{ fill: '#A1A1AA', r: 2.5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="latencyP99" 
                  name="p99 Latency (ms)" 
                  stroke="#F59E0B" 
                  strokeWidth={1.5}
                  dot={{ fill: '#F59E0B', r: 2.5 }}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
