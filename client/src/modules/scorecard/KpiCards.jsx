import React from 'react';
import { Layers, Zap, Activity } from 'lucide-react';

export const KpiCards = ({ scorecard, onNavigateToStage }) => {
  if (!scorecard) return null;

  const passedTiers = scorecard.tiers
    ? Object.values(scorecard.tiers).filter((t) => t.status === 'passed').length
    : 3;
  const failedTiers = scorecard.tiers
    ? Object.values(scorecard.tiers).filter((t) => t.status === 'failed').length
    : 1;

  const mutationScore = scorecard.mutationKillScore?.score ?? scorecard.mutationScore?.score ?? 85.0;
  const killedCount = scorecard.mutationKillScore?.killed ?? scorecard.mutationScore?.killed ?? 17;
  const survivedCount = scorecard.mutationKillScore?.survived ?? scorecard.mutationScore?.survived ?? 3;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: 4-Tier Suite Verdict */}
      <div className="bg-zinc-925 border border-zinc-800 rounded p-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
          <span>4-Tier Suite Verdict</span>
          <Layers size={14} strokeWidth={1.5} className="text-zinc-500" />
        </div>
        <div className="text-lg font-bold font-mono text-zinc-50 tracking-tight">
          {passedTiers} Passed / <span className={failedTiers > 0 ? "text-semantic-rose" : "text-semantic-emerald"}>{failedTiers} Failed</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2 pt-2 border-t border-zinc-800/80">
          <span>Pipeline Duration</span>
          <span className="text-zinc-300 font-medium">{scorecard.totalPipelineDuration || `${((scorecard.totalDurationMs || 52400) / 1000).toFixed(1)}s`}</span>
        </div>
      </div>

      {/* KPI 2: PR Blast Radius */}
      <div 
        onClick={() => onNavigateToStage('ast-graph')}
        className="bg-zinc-925 hover:bg-zinc-900/60 border border-zinc-800 rounded p-4 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
          <span>PR Blast Radius</span>
          <span className="text-[10px] text-semantic-amber font-mono">[Stage 2]</span>
        </div>
        <div className="text-lg font-bold font-mono text-zinc-50 tracking-tight">
          {scorecard.blastRadius?.routesImpacted ?? 4} Routes Impacted
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2 pt-2 border-t border-zinc-800/80">
          <span>Traversed AST Files</span>
          <span className="text-zinc-300 font-medium">{scorecard.blastRadius?.filesTraversed ?? 14} Files</span>
        </div>
      </div>

      {/* KPI 3: Mutation Kill Score */}
      <div 
        onClick={() => onNavigateToStage('mutation-load')}
        className="bg-zinc-925 hover:bg-zinc-900/60 border border-zinc-800 rounded p-4 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
          <span>Mutation Kill Score</span>
          <Zap size={14} strokeWidth={1.5} className="text-semantic-emerald" />
        </div>
        <div className="text-lg font-bold font-mono text-semantic-emerald tracking-tight">
          {mutationScore.toFixed(1)}%
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2 pt-2 border-t border-zinc-800/80">
          <span>Mutants Tested</span>
          <span className="text-zinc-300 font-medium">
            {killedCount} Killed / {survivedCount} Survived
          </span>
        </div>
      </div>

      {/* KPI 4: Load Concurrency */}
      <div 
        onClick={() => onNavigateToStage('mutation-load')}
        className="bg-zinc-925 hover:bg-zinc-900/60 border border-zinc-800 rounded p-4 cursor-pointer transition-colors"
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
          <span>Autocannon Concurrency</span>
          <Activity size={14} strokeWidth={1.5} className="text-zinc-500" />
        </div>
        <div className="text-lg font-bold font-mono text-zinc-50 tracking-tight">
          p90: {scorecard.latency?.p90 ?? 38}ms
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mt-2 pt-2 border-t border-zinc-800/80">
          <span>p95 / p99 Latency</span>
          <span className="text-zinc-300 font-medium">{scorecard.latency?.p95 ?? 61}ms / {scorecard.latency?.p99 ?? 112}ms</span>
        </div>
      </div>
    </div>
  );
};
