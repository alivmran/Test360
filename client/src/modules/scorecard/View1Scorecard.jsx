import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  GitCommit, 
  GitPullRequest, 
  ArrowRight,
  ExternalLink 
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
      <div className="p-12 text-center text-zinc-400 font-sans text-sm">
        Loading test summary...
      </div>
    );
  }

  const isFailed = scorecard.status === 'failed' || scorecard.tiers?.api?.status === 'failed';

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
            <span className="font-semibold text-zinc-300">{scorecard.repository}</span>
            <span>/</span>
            <span>Pull Request #{scorecard.prNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50">
            {scorecard.prTitle}
          </h1>
          <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-2 font-mono">
            <span className="flex items-center space-x-1">
              <GitCommit size={13} className="text-zinc-500" />
              <span>{(scorecard.commitSha || '').substring(0, 7)}</span>
            </span>
            <span>•</span>
            <span>Branch: <strong className="text-zinc-300 font-normal">{scorecard.branch}</strong></span>
            <span>•</span>
            <span>Author: <strong className="text-zinc-300 font-normal">@{scorecard.author}</strong></span>
          </div>
        </div>

        {/* PR Status Verdict */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          {isFailed ? (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center space-x-2">
              <AlertCircle size={15} className="text-rose-400" />
              <span className="text-xs font-semibold text-rose-300">
                1 Bug Found — Fix Suggested
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center space-x-2">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                All Tests Passed — Ready to Merge
              </span>
            </div>
          )}

          <button
            onClick={() => onNavigateToStage('test-spec')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center space-x-1 transition-colors"
          >
            <span>View Generated Tests</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* Top 4 Friendly KPI Cards */}
      <KpiCards scorecard={scorecard} onNavigateToStage={onNavigateToStage} />

      {/* Main Content: Test Execution Breakdown + PR Bot Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExecutionTable scorecard={scorecard} onNavigateToStage={onNavigateToStage} />
        </div>

        {/* Friendly GitHub Bot Comment Card */}
        <div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
              <div className="flex items-center space-x-2 text-xs font-medium text-zinc-300">
                <GitPullRequest size={14} className="text-indigo-400" />
                <span>GitHub Bot PR Comment</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full font-mono">
                Auto-Posted
              </span>
            </div>

            <div className="p-4 text-xs space-y-3 flex-1 text-zinc-300 leading-relaxed">
              <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800/80 text-[11px] text-zinc-400">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                  T
                </div>
                <span className="font-semibold text-zinc-200">test360-bot</span>
                <span>commented on this pull request</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="font-semibold text-zinc-100 flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isFailed ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                  <span>Test360 Check: {isFailed ? 'Action Recommended' : 'Passed'}</span>
                </div>

                <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Unit Tests:</span>
                    <span className="text-emerald-400 font-medium">16 / 16 Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">API Integration:</span>
                    <span className="text-rose-400 font-medium">9 Passed, 1 Issue</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Browser Smoke:</span>
                    <span className="text-emerald-400 font-medium">4 / 4 Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">API Speed (p90):</span>
                    <span className="text-zinc-200 font-medium">38 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Bug Catching Score:</span>
                    <span className="text-emerald-400 font-medium">85% (17 of 20 bugs caught)</span>
                  </div>
                </div>

                {isFailed && (
                  <div className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded-lg text-[11px] space-y-1">
                    <span className="font-semibold text-rose-300 block">Issue Details:</span>
                    <p className="text-zinc-400">
                      <code>checkoutController.ts</code> (line 64) needs a validation check for <code>quantity &gt; 0</code>.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500">Fast webhook &lt;100ms</span>
              <button
                onClick={() => onNavigateToStage('test-spec')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
              >
                <span>Inspect Tests</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Pass Rate Trend */}
      <HistoricalRegressionChart historicalRuns={historicalRuns} />
    </div>
  );
};
