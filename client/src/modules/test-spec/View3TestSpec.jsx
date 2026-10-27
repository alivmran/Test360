import React, { useState } from 'react';
import { Layers, Braces } from 'lucide-react';
import { HybridMatrixTable } from './HybridMatrixTable';
import { TemplateOutputViewer } from './TemplateOutputViewer';

export const View3TestSpec = ({
  testCases = [],
  templates = {},
  rawJsonMatrix = ''
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers size={13} strokeWidth={1.5} className="text-zinc-400" />
            <span>Stage 3 &amp; 4: Specification &amp; Deterministic Compilation</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">
            SLM outputs constrained JSON matrix &rarr; Validated by Zod &rarr; Deterministic AST Template Compiler
          </span>
        </div>

        <button
          onClick={() => setShowRawJson(!showRawJson)}
          className={`px-2.5 py-1 text-xs font-mono rounded border flex items-center space-x-1.5 transition-colors ${
            showRawJson
              ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
              : 'text-zinc-400 border-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Braces size={13} strokeWidth={1.5} />
          <span>{showRawJson ? 'Hide Raw Matrix' : 'Toggle Raw JSON Matrix'}</span>
        </button>
      </div>

      {/* Split Inspector: 50% Left / 50% Right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <HybridMatrixTable testCases={testCases} />
        <TemplateOutputViewer
          templates={templates}
          rawJsonMatrix={rawJsonMatrix}
          showRawJson={showRawJson}
        />
      </div>
    </div>
  );
};
