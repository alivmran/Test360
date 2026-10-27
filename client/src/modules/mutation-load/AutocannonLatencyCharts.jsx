import React from 'react';
import { Activity } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const AutocannonLatencyCharts = ({ metrics = [] }) => {
  return (
    <div className="bg-zinc-925 border border-zinc-800 rounded p-4">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
        <div>
          <h2 className="text-xs font-mono font-semibold tracking-wide text-zinc-200 uppercase flex items-center space-x-1.5">
            <Activity size={14} strokeWidth={1.5} className="text-zinc-400" />
            <span>Autocannon Endpoint Latency Percentiles (p90, p95, p99 ms)</span>
          </h2>
          <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
            Benchmark configuration: 100 concurrent workers &bull; 10s benchmark duration &bull; 0 event-loop stalls
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
          Average Throughput: 1,842 req/sec
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#27272A" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="endpoint" 
              stroke="#71717A" 
              tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
            />
            <YAxis 
              stroke="#71717A" 
              tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              unit="ms" 
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
            <Bar dataKey="p90" name="p90 Latency (ms)" fill="#FAFAFA" radius={[2, 2, 0, 0]} />
            <Bar dataKey="p95" name="p95 Latency (ms)" fill="#A1A1AA" radius={[2, 2, 0, 0]} />
            <Bar dataKey="p99" name="p99 Latency (ms)" fill="#F59E0B" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
