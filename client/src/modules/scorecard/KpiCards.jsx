import React from 'react';
import { CheckCircle2, AlertTriangle, FileCode2, Zap, Gauge, ArrowRight } from 'lucide-react';

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
  const totalMutants = scorecard.mutationKillScore?.sampled ?? scorecard.mutationScore?.sampled ?? 20;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Test Status */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium">Test Results</span>
          {failedTiers > 0 ? (
            <AlertTriangle size={15} className="text-amber-400" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-400" />
          )}
        </div>
        <div>
          <div className="text-xl font-bold text-zinc-100">
            {passedTiers} Passed{' '}
            <span className={failedTiers > 0 ? 'text-rose-400 text-sm font-semibold' : 'text-emerald-400 text-sm font-semibold'}>
              · {failedTiers > 0 ? `${failedTiers} Issue Found` : 'All Clear'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ran in {scorecard.totalPipelineDuration || '52.4s'}
          </p>
        </div>
      </div>

      {/* Card 2: Code Affected */}
      <div 
        onClick={() => onNavigateToStage('ast-graph')}
        className="bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium">Code Affected</span>
          <FileCode2 size={15} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
        <div>
          <div className="text-xl font-bold text-zinc-100">
            {scorecard.blastRadius?.routesImpacted ?? 4} API Routes
          </div>
          <p className="text-xs text-zinc-400 mt-1 flex items-center justify-between">
            <span>{scorecard.blastRadius?.filesTraversed ?? 14} files checked</span>
            <span className="text-[11px] text-indigo-400 font-medium group-hover:underline">View Map &rarr;</span>
          </p>
        </div>
      </div>

      {/* Card 3: Bug Catching Quality */}
      <div 
        onClick={() => onNavigateToStage('test-spec')}
        className="bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium">Bug-Catching Score</span>
          <Zap size={15} className="text-emerald-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-emerald-400">
            {mutationScore.toFixed(0)}% Reliable
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Caught {killedCount} of {totalMutants} simulated bugs
          </p>
        </div>
      </div>

      {/* Card 4: API Response Speed */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
          <span className="font-medium">API Response Speed</span>
          <Gauge size={15} className="text-sky-400" />
        </div>
        <div>
          <div className="text-xl font-bold text-zinc-100">
            {scorecard.latency?.p90 ?? 38}ms
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Fast response under 100 users load
          </p>
        </div>
      </div>
    </div>
  );
};
