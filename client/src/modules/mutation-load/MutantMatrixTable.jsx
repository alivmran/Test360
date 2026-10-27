import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export const MutantMatrixTable = ({ mutants = [] }) => {
  const [verdictFilter, setVerdictFilter] = useState('ALL');

  const killedCount = (mutants || []).filter((m) => m.verdict === 'KILLED').length;
  const survivedCount = (mutants || []).filter((m) => m.verdict === 'SURVIVED').length;

  const filteredMutants = (mutants || []).filter((m) => {
    if (verdictFilter === 'KILLED') return m.verdict === 'KILLED';
    if (verdictFilter === 'SURVIVED') return m.verdict === 'SURVIVED';
    return true;
  });

  return (
    <div className="bg-zinc-925 border border-zinc-800 rounded">
      <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-mono font-semibold tracking-wide text-zinc-200 uppercase flex items-center space-x-1.5">
            <Zap size={14} strokeWidth={1.5} className="text-semantic-emerald" />
            <span>AST Mutation Verification Matrix ({mutants?.length || 20} Representative Mutants)</span>
          </h2>
          <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
            Mutants synthesized via AST node replacement in traversed PR files &bull; Queried from MongoDB
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <button
            onClick={() => setVerdictFilter('ALL')}
            className={`px-2.5 py-1 rounded transition-colors ${
              verdictFilter === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({mutants?.length || 0})
          </button>
          <button
            onClick={() => setVerdictFilter('KILLED')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-colors ${
              verdictFilter === 'KILLED'
                ? 'bg-semantic-emerald/15 text-semantic-emerald font-semibold border border-semantic-emerald/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Killed ({killedCount})</span>
          </button>
          <button
            onClick={() => setVerdictFilter('SURVIVED')}
            className={`px-2.5 py-1 rounded flex items-center space-x-1 transition-colors ${
              verdictFilter === 'SURVIVED'
                ? 'bg-semantic-amber/15 text-semantic-amber font-semibold border border-semantic-amber/30'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <span>Survived ({survivedCount})</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="bg-zinc-900/60 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider select-none">
            <tr>
              <th className="py-2.5 px-3">Mutant ID</th>
              <th className="py-2.5 px-3">Target File &amp; Line</th>
              <th className="py-2.5 px-3">Mutation Category</th>
              <th className="py-2.5 px-3">Original AST Code &rarr; Mutated AST</th>
              <th className="py-2.5 px-3">Verdict</th>
              <th className="py-2.5 px-3">Killing Test Suite</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filteredMutants.map((mutant) => {
              const isKilled = mutant.verdict === 'KILLED';
              return (
                <tr key={mutant.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-zinc-200 whitespace-nowrap">
                    {mutant.id}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-zinc-300 text-[11px]">
                    <span>{(mutant.file || '').replace('src/', '')}</span>
                    <span className="text-zinc-500">:{mutant.line}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                      {mutant.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] max-w-sm truncate">
                    <span className="text-zinc-400 line-through mr-1">{mutant.originalAstCode}</span>
                    <span className="text-zinc-600">&rarr;</span>
                    <span className="text-zinc-200 font-semibold ml-1">{mutant.mutatedAstCode}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        isKilled
                          ? 'bg-semantic-emerald/15 text-semantic-emerald border-semantic-emerald/30'
                          : 'bg-semantic-amber/15 text-semantic-amber border-semantic-amber/30'
                      }`}
                    >
                      {mutant.verdict}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-zinc-400 whitespace-nowrap">
                    {mutant.killingTestSuite ? (
                      <span className="text-zinc-300">{mutant.killingTestSuite}</span>
                    ) : (
                      <span className="text-zinc-500 italic">None (Mutant Survived)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span>Showing {filteredMutants.length} of {mutants?.length || 20} sampled mutants</span>
        <span className="text-zinc-400">
          Capped at 20 representative mutants to enforce &lt;60s PR feedback SLA
        </span>
      </div>
    </div>
  );
};
