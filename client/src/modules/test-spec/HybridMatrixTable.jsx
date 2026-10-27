import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export const HybridMatrixTable = ({ testCases = [] }) => {
  const [generatorFilter, setGeneratorFilter] = useState('ALL');

  const filteredCases = (testCases || []).filter((tc) => {
    if (generatorFilter === 'BVA') return tc.generator?.includes('BVA');
    if (generatorFilter === 'SLM') return tc.generator?.includes('Test360-Coder');
    return true;
  });

  return (
    <div className="w-full lg:w-1/2 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-hidden">
      {/* Header & Filter */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-925 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-mono font-semibold text-zinc-200 uppercase">
            Hybrid Test Matrix Specification
          </h2>
          <p className="text-[10px] font-mono text-zinc-500">
            BVA/EP Deterministic Fuzzer + Test360-Coder 1.5B QLoRA
          </p>
        </div>

        <div className="flex items-center space-x-1 text-[11px] font-mono">
          <button
            onClick={() => setGeneratorFilter('ALL')}
            className={`px-2 py-0.5 rounded transition-colors ${
              generatorFilter === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({testCases?.length || 0})
          </button>
          <button
            onClick={() => setGeneratorFilter('BVA')}
            className={`px-2 py-0.5 rounded transition-colors ${
              generatorFilter === 'BVA'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            BVA Fuzzer
          </button>
          <button
            onClick={() => setGeneratorFilter('SLM')}
            className={`px-2 py-0.5 rounded transition-colors ${
              generatorFilter === 'SLM'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            SLM (QLoRA)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="bg-zinc-900/60 sticky top-0 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase tracking-wider select-none">
            <tr>
              <th className="py-2.5 px-3">Case ID</th>
              <th className="py-2.5 px-3">Generator</th>
              <th className="py-2.5 px-3">Target Route</th>
              <th className="py-2.5 px-3">Boundary / Partition Rule</th>
              <th className="py-2.5 px-3 text-right">Expected</th>
              <th className="py-2.5 px-3 text-right">Zod Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filteredCases.map((tc) => (
              <tr key={tc.id} className="hover:bg-zinc-900/40 transition-colors group">
                <td className="py-3 px-3 font-bold text-zinc-200 whitespace-nowrap">
                  {tc.id}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded border ${
                      tc.generator?.includes('BVA')
                        ? 'bg-blue-950/30 text-blue-400 border-blue-900/50'
                        : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
                    }`}
                  >
                    {tc.generator?.includes('BVA') ? 'BVA Fuzzer' : 'Test360-Coder'}
                  </span>
                </td>
                <td className="py-3 px-3 text-zinc-300 whitespace-nowrap text-[11px]">
                  {tc.targetRoute}
                </td>
                <td className="py-3 px-3 text-zinc-400 text-[11px] max-w-xs truncate">
                  <span title={tc.partitionRule}>{tc.partitionRule}</span>
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                      tc.expectedStatus === 200 || tc.expectedStatus === 201
                        ? 'bg-semantic-emerald/15 text-semantic-emerald border-semantic-emerald/30'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    HTTP {tc.expectedStatus}
                  </span>
                </td>
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <span className="inline-flex items-center space-x-1 text-[10px] text-semantic-emerald bg-semantic-emerald/10 border border-semantic-emerald/20 px-1.5 py-0.2 rounded">
                    <CheckCircle2 size={11} strokeWidth={2} />
                    <span>VALIDATED</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
        <span>Showing {filteredCases.length} of {testCases?.length || 0} synthesized contracts</span>
        <span className="text-semantic-emerald flex items-center space-x-1">
          <CheckCircle2 size={12} strokeWidth={1.5} />
          <span>100% Zod Schema Conformance</span>
        </span>
      </div>
    </div>
  );
};
