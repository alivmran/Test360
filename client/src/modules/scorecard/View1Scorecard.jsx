import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  GitBranch,
  GitPullRequest,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';
import { KpiCards } from './KpiCards';
import { ExecutionTable } from './ExecutionTable';
import { HistoricalRegressionChart } from './HistoricalRegressionChart';

export const View1Scorecard = ({
  scorecard,
  historicalRuns = [],
  selectedPrNumber,
  onSelectPrNumber,
  onNavigateToStage,
  onRerunPipeline,
  isRerunning,
}) => {
  const [activeSubTab, setActiveSubTab] = useState('checks'); // 'checks' | 'history' | 'summary'
  const [selectedTier, setSelectedTier] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!scorecard) {
    return (
      <div className="p-12 text-center text-zinc-400 font-sans text-sm">
        Loading pull request summary...
      </div>
    );
  }

  const isFailed = scorecard.status === 'failed' || scorecard.tiers?.api?.status === 'failed';
  const unit = scorecard.tiers?.unit;
  const api = scorecard.tiers?.api;
  const uiSmoke = scorecard.tiers?.uiSmoke;
  const speedMs = scorecard.latency?.p90 ?? scorecard.tiers?.load?.p90 ?? 38;
  const qualityScore = scorecard.mutationKillScore?.score ?? scorecard.mutationScore?.score ?? 85;

  const sortedPrOptions = [...(historicalRuns || [])].sort((a, b) => b.prNumber - a.prNumber);

  const handleCardAction = (action) => {
    if (action === 'checks') {
      setActiveSubTab('checks');
      setSelectedTier(isFailed ? 'api' : 'unit');
    } else if (action === 'speed') {
      setActiveSubTab('checks');
      setSelectedTier('load');
    }
  };

  const handleSelectHistoricalPr = (prNum) => {
    onSelectPrNumber?.(prNum);
    setSelectedTier(null);
    setActiveSubTab('checks');
  };

  const markdownSummary = [
    `### Test360 AI Check: ${isFailed ? 'Issue Found' : 'All Passed'} (PR #${scorecard.prNumber})`,
    `- **Unit Tests:** ${unit?.passed ?? 16}/${unit?.total ?? 16} passed`,
    `- **API Tests:** ${api?.passed ?? 9}/${api?.total ?? 10} passed`,
    `- **Browser Tests:** ${uiSmoke?.passed ?? 4}/${uiSmoke?.total ?? 4} passed`,
    `- **API Speed:** ${speedMs} ms`,
    `- **Test Quality:** ${Number(qualityScore).toFixed(0)}%`,
    isFailed
      ? `\n**Issue:** ${api?.failureMessage || scorecard.isolatedDefect?.description || 'Check failed on invalid input.'}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const handleCopySummary = () => {
    navigator.clipboard.writeText(markdownSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
        <div className="min-w-0">
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
            <span>{scorecard.repository}</span>
            <span>/</span>
            <span>PR #{scorecard.prNumber}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-50 truncate">
            {scorecard.prTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-1.5">
            <span className="inline-flex items-center space-x-1 font-mono">
              <GitBranch size={12} className="text-zinc-500" />
              <span>{scorecard.branch}</span>
            </span>
            <span>·</span>
            <span>by @{scorecard.author}</span>
          </div>
        </div>

        {/* Interactive PR Selector + Status */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {sortedPrOptions.length > 0 && (
            <select
              aria-label="Select Pull Request"
              value={selectedPrNumber ?? scorecard.prNumber}
              onChange={(e) => handleSelectHistoricalPr(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              {sortedPrOptions.map((pr) => (
                <option key={pr.prNumber} value={pr.prNumber}>
                  PR #{pr.prNumber} · {pr.status === 'failed' ? 'Issue found' : 'Passed'}
                </option>
              ))}
            </select>
          )}

          {isFailed ? (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-lg inline-flex items-center space-x-1.5 text-xs font-medium text-rose-300">
              <AlertCircle size={14} className="text-rose-400" />
              <span>1 issue found</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg inline-flex items-center space-x-1.5 text-xs font-medium text-emerald-300">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Ready to merge</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Interactive Summary Cards */}
      <KpiCards
        scorecard={scorecard}
        onNavigateToStage={onNavigateToStage}
        onCardAction={handleCardAction}
      />

      {/* Focused Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1">
          {[
            { id: 'checks', label: 'Checks' },
            { id: 'history', label: `History (${sortedPrOptions.length})` },
            { id: 'summary', label: 'PR Comment' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigateToStage?.('test-spec')}
          className="text-xs text-zinc-400 hover:text-zinc-100 inline-flex items-center space-x-1 transition-colors"
        >
          <span>All test cases</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Active Sub-View (1 focused view at a time) */}
      {activeSubTab === 'checks' && (
        <ExecutionTable
          scorecard={scorecard}
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          onNavigateToStage={onNavigateToStage}
          onRerunPipeline={onRerunPipeline}
          isRerunning={isRerunning}
        />
      )}

      {activeSubTab === 'history' && (
        <HistoricalRegressionChart
          historicalRuns={historicalRuns}
          activePrNumber={scorecard.prNumber}
          onSelectPr={handleSelectHistoricalPr}
        />
      )}

      {activeSubTab === 'summary' && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden max-w-2xl">
          <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-medium text-zinc-200">
              <GitPullRequest size={14} className="text-zinc-400" />
              <span>GitHub PR Comment Preview</span>
            </div>
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs inline-flex items-center space-x-1.5 transition-colors"
            >
              {copiedSummary ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>

          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-zinc-400 pb-3 border-b border-zinc-800/80">
              <span className="font-semibold text-zinc-200">test360-bot</span>
              <span>posted a summary on PR #{scorecard.prNumber}</span>
            </div>

            <div className="space-y-2 bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Unit Tests</span>
                <span className="text-emerald-400 font-medium">
                  {unit?.passed ?? 16} / {unit?.total ?? 16} passed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">API Tests</span>
                <span className={api?.status === 'failed' ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
                  {api?.passed ?? 9} / {api?.total ?? 10} passed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Browser Tests</span>
                <span className="text-emerald-400 font-medium">
                  {uiSmoke?.passed ?? 4} / {uiSmoke?.total ?? 4} passed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">API Speed</span>
                <span className="text-zinc-200 font-medium">{speedMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Test Quality</span>
                <span className="text-zinc-200 font-medium">{Number(qualityScore).toFixed(0)}%</span>
              </div>
            </div>

            {isFailed && (
              <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-1">
                <div className="font-semibold text-rose-300">Issue found</div>
                <p className="text-zinc-300 leading-relaxed">
                  {api?.failureMessage ||
                    scorecard.isolatedDefect?.description ||
                    'An input validation issue was caught during API testing.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
