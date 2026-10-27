import React from 'react';
import { 
  XCircle, 
  CheckCircle2,
  GitCommit, 
  GitPullRequest, 
  ArrowUpRight 
} from 'lucide-react';
import { KpiCards } from './KpiCards';
import { ExecutionTable } from './ExecutionTable';
import { HistoricalRegressionChart } from './HistoricalRegressionChart';

export const View1Scorecard = ({
  scorecard,
  historicalRuns,
  onNavigateToStage,
}) => {
  if (!scorecard) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-sm">
        Loading PR scorecard from MongoDB...
      </div>
    );
  }

  const isFailed = scorecard.status === 'failed' || scorecard.tiers?.api?.status === 'failed';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header with Commit Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 mb-1">
            <span>REPOSITORY</span>
            <span>/</span>
            <span className="text-zinc-300 font-medium">{scorecard.repository}</span>
            <span>/</span>
            <span>PR #{scorecard.prNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50 flex items-center space-x-2.5">
            <span>{scorecard.prTitle}</span>
          </h1>
          <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400 mt-2">
            <span className="flex items-center space-x-1">
              <GitCommit size={13} strokeWidth={1.5} className="text-zinc-500" />
              <span>{(scorecard.commitSha || '').substring(0, 7)}</span>
            </span>
            <span>•</span>
            <span>branch: <strong className="text-zinc-200 font-normal">{scorecard.branch}</strong></span>
            <span>•</span>
            <span>author: <strong className="text-zinc-200 font-normal">@{scorecard.author}</strong></span>
          </div>
        </div>

        {/* PR Status Verdict Pill */}
        <div className="flex items-center space-x-2">
          {isFailed ? (
            <div className="px-3 py-1.5 bg-semantic-rose/10 border border-semantic-rose/30 rounded flex items-center space-x-2">
              <XCircle size={15} strokeWidth={1.5} className="text-semantic-rose" />
              <span className="text-xs font-mono font-medium text-semantic-rose">
                CI Check Failed: 1 Defect Isolated
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-semantic-emerald/10 border border-semantic-emerald/30 rounded flex items-center space-x-2">
              <CheckCircle2 size={15} strokeWidth={1.5} className="text-semantic-emerald" />
              <span className="text-xs font-mono font-medium text-semantic-emerald">
                All Checks Passed: Ready to Merge
              </span>
            </div>
          )}
          
          <button
            onClick={() => onNavigateToStage('diagnostics-fix')}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono rounded flex items-center space-x-1 transition-colors"
          >
            <span>Review 1-Click Fix</span>
            <ArrowUpRight size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards Component */}
      <KpiCards scorecard={scorecard} onNavigateToStage={onNavigateToStage} />

      {/* Main Grid: 4-Tier Summary Table & GitHub PR Bot Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExecutionTable scorecard={scorecard} onNavigateToStage={onNavigateToStage} />
        </div>

        {/* GitHub PR Scorecard Comment Preview */}
        <div>
          <div className="bg-zinc-925 border border-zinc-800 rounded flex flex-col h-full">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitPullRequest size={14} strokeWidth={1.5} className="text-zinc-400" />
                <span className="text-xs font-mono font-semibold text-zinc-200 uppercase">
                  GitHub PR Bot Comment Preview
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                Octokit
              </span>
            </div>

            <div className="p-4 font-mono text-xs space-y-3 flex-1 bg-zinc-950/50">
              <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800 text-zinc-400 text-[11px]">
                <span className="font-semibold text-zinc-200">test360-bot</span>
                <span>commented on {(scorecard.commitSha || '').substring(0, 7)}</span>
              </div>

              <div className="space-y-2 text-zinc-300 text-[11px] leading-relaxed">
                <div className="font-bold text-zinc-100 flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${isFailed ? 'bg-semantic-rose' : 'bg-semantic-emerald'}`}></span>
                  <span>Test360 Multi-Tier Synthesis Verdict: {isFailed ? 'Action Required' : 'Passed'}</span>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded p-2 text-[10px] space-y-1">
                  <div>• <strong>Unit Tests:</strong> {scorecard.tiers?.unit?.passed || 16}/{scorecard.tiers?.unit?.total || 16} Passed</div>
                  <div>• <strong>API Tests:</strong> {scorecard.tiers?.api?.passed || 9}/{scorecard.tiers?.api?.total || 10} Passed</div>
                  <div>• <strong>UI Smoke:</strong> {scorecard.tiers?.uiSmoke?.passed || 4}/{scorecard.tiers?.uiSmoke?.total || 4} Passed</div>
                  <div>• <strong>Autocannon:</strong> p90 {scorecard.latency?.p90 || 38}ms / p99 {scorecard.latency?.p99 || 112}ms</div>
                  <div>• <strong>Mutants Killed:</strong> {scorecard.mutationKillScore?.killed || 17}/{scorecard.mutationKillScore?.sampled || 20} ({(scorecard.mutationKillScore?.score || 85).toFixed(1)}% Kill Score)</div>
                </div>

                {isFailed && (
                  <div className="text-[10px] text-zinc-400">
                    <p className="font-semibold text-semantic-rose">Defect Isolated:</p>
                    <p className="text-zinc-500">
                      <code className="text-zinc-400">checkoutController.ts:64</code> — Negative quantity causes inventory inflation.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500">Autonomous Self-Healing</span>
                  <span className="text-semantic-emerald">1-Click Repair Available</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500">Post-Commit Hook Active</span>
              <button
                onClick={() => onNavigateToStage('diagnostics-fix')}
                className="text-xs font-mono text-zinc-100 bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition-colors"
              >
                Open Monaco Patch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Regression Tracker Component */}
      <HistoricalRegressionChart historicalRuns={historicalRuns} />
    </div>
  );
};
