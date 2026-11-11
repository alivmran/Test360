import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

const formatSimpleRule = (rule = '') => {
  return rule
    .replace(/^Boundary min-1:\s*/i, 'Edge case: ')
    .replace(/^Boundary min:\s*/i, 'Edge case: ')
    .replace(/^Boundary max\+1:\s*/i, 'Upper limit: ')
    .replace(/^Boundary max:\s*/i, 'Limit check: ')
    .replace(/^Equivalence valid:\s*/i, 'Valid case: ')
    .replace(/^Equivalence invalid:\s*/i, 'Invalid input: ')
    .replace(/\s*\(Lower non-positive boundary\)/i, '')
    .replace(/\s*\(Negative integer fuzzing\)/i, '')
    .replace(/\s*\(Exact inventory depletion\)/i, '')
    .trim();
};

export const HybridMatrixTable = ({
  testCases = [],
  selectedCaseId = null,
  onSelectCase,
}) => {
  const [generatorFilter, setGeneratorFilter] = useState('ALL');

  const filteredCases = (testCases || []).filter((tc) => {
    if (generatorFilter === 'BVA') return tc.generator?.includes('BVA');
    if (generatorFilter === 'SLM') return tc.generator?.includes('Test360-Coder');
    return true;
  });

  const activeCase =
    filteredCases.find((tc) => tc.id === selectedCaseId) ||
    filteredCases[0] ||
    null;

  return (
    <div className="w-full lg:w-1/2 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-hidden">
      {/* Header & Filter */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-925 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Test Cases</h2>
          <p className="text-xs text-zinc-400">
            Auto-generated edge cases and AI scenarios
          </p>
        </div>

        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs shrink-0">
          {[
            { id: 'ALL', label: `All (${testCases?.length || 0})` },
            { id: 'BVA', label: 'Edge Cases' },
            { id: 'SLM', label: 'AI Scenarios' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setGeneratorFilter(btn.id)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                generatorFilter === btn.id
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-zinc-900/60 sticky top-0 border-b border-zinc-800 text-[11px] text-zinc-400 font-medium select-none">
            <tr>
              <th className="py-2.5 px-4">ID</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3">What is tested</th>
              <th className="py-2.5 px-3 text-right">Expected</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filteredCases.map((tc) => {
              const isEdge = tc.generator?.includes('BVA');
              const isSelected = activeCase?.id === tc.id;
              return (
                <tr
                  key={tc.id}
                  onClick={() => onSelectCase?.(tc)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-950/20' : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-semibold text-zinc-200 whitespace-nowrap align-top">
                    {tc.id}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap align-top">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                        isEdge
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                      }`}
                    >
                      {isEdge ? 'Edge Case' : 'AI Scenario'}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top">
                    <div className="font-mono text-[11px] text-zinc-200 font-medium">
                      {tc.targetRoute}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 leading-snug">
                      {formatSimpleRule(tc.partitionRule)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap align-top">
                    <span
                      className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded border ${
                        tc.expectedStatus === 200 || tc.expectedStatus === 201
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {tc.expectedStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap align-top">
                    <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} />
                      <span>Ready</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Case Explanation */}
      {activeCase?.rationale && (
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/40 text-xs shrink-0">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="font-medium text-zinc-200">
              {activeCase.id} · Why this test runs
            </span>
            <span className="text-[11px] text-zinc-500">
              Suite: {activeCase.executionTier || 'API'}
            </span>
          </div>
          <p className="text-zinc-400 leading-relaxed">{activeCase.rationale}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <span>
          Showing {filteredCases.length} of {testCases?.length || 0} tests
        </span>
        <span className="text-emerald-400 flex items-center space-x-1.5">
          <CheckCircle2 size={13} />
          <span>All specs valid</span>
        </span>
      </div>
    </div>
  );
};
