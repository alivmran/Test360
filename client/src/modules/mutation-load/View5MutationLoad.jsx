import React from 'react';
import { AutocannonLatencyCharts } from './AutocannonLatencyCharts';
import { MutantMatrixTable } from './MutantMatrixTable';

export const View5MutationLoad = ({
  mutants = [],
  autocannonMetrics = [],
}) => {
  const killedCount = (mutants || []).filter((m) => m.verdict === 'KILLED').length;
  const survivedCount = (mutants || []).filter((m) => m.verdict === 'SURVIVED').length;
  const total = mutants?.length || 1;
  const killRate = ((killedCount / total) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Mutation Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 mb-1">
            <span>STAGE 7</span>
            <span>/</span>
            <span>AST FAULT INJECTION &amp; CONCURRENCY VERIFICATION</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50 flex items-center space-x-2">
            <span>Mutation Kill Score &amp; Autocannon Load Telemetry</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            20-Mutant Cap in PR Blast Radius &bull; Autocannon 100-Worker Concurrency Benchmark &bull; Seeded in MongoDB
          </p>
        </div>

        {/* Mutation Score Card */}
        <div className="flex items-center space-x-3 bg-zinc-925 border border-zinc-800 p-2.5 rounded">
          <div className="text-right font-mono">
            <span className="text-[10px] text-zinc-500 block uppercase">Kill Score</span>
            <span className="text-lg font-bold text-semantic-emerald">{killRate}%</span>
          </div>
          <div className="h-8 w-px bg-zinc-800"></div>
          <div className="text-[11px] font-mono text-zinc-400 space-y-0.5">
            <div className="text-semantic-emerald font-semibold">{killedCount} Killed</div>
            <div className="text-semantic-amber">{survivedCount} Survived</div>
          </div>
        </div>
      </div>

      {/* Autocannon Charts Component */}
      <AutocannonLatencyCharts metrics={autocannonMetrics} />

      {/* 20-Mutant Matrix Table Component */}
      <MutantMatrixTable mutants={mutants} />
    </div>
  );
};
