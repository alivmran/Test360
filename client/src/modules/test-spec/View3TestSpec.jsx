import React, { useState } from 'react';
import { Layers, Braces } from 'lucide-react';
import { HybridMatrixTable } from './HybridMatrixTable';
import { TemplateOutputViewer } from './TemplateOutputViewer';

const mapExecutionTierToTab = (tier) => {
  const normalized = (tier || '').toLowerCase();
  if (normalized.includes('unit')) return 'jest';
  if (normalized.includes('smoke') || normalized.includes('ui') || normalized.includes('browser')) {
    return 'playwright';
  }
  if (normalized.includes('load') || normalized.includes('speed')) return 'autocannon';
  return 'supertest';
};

export const View3TestSpec = ({
  testCases = [],
  templates = {},
  rawJsonMatrix = '',
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(testCases?.[0]?.id || null);
  const [selectedTemplateTab, setSelectedTemplateTab] = useState('supertest');

  const handleSelectCase = (testCase) => {
    setSelectedCaseId(testCase.id);
    if (!showRawJson && testCase.executionTier) {
      setSelectedTemplateTab(mapExecutionTierToTab(testCase.executionTier));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3 text-xs min-w-0">
          <span className="text-zinc-200 font-semibold flex items-center space-x-2 shrink-0">
            <Layers size={15} className="text-indigo-400" />
            <span>Generated Tests</span>
          </span>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="text-zinc-400 truncate hidden sm:inline">
            Review the test scenarios created for this PR and inspect the test code.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowRawJson(!showRawJson)}
          className={`px-3 py-1.5 text-xs rounded-lg border flex items-center space-x-1.5 transition-colors shrink-0 ${
            showRawJson
              ? 'bg-indigo-600/20 text-indigo-200 border-indigo-500/40 font-medium'
              : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100'
          }`}
        >
          <Braces size={13} />
          <span>{showRawJson ? 'Hide Raw JSON' : 'Show Raw JSON'}</span>
        </button>
      </div>

      {/* Split Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <HybridMatrixTable
          testCases={testCases}
          selectedCaseId={selectedCaseId}
          onSelectCase={handleSelectCase}
        />
        <TemplateOutputViewer
          templates={templates}
          rawJsonMatrix={rawJsonMatrix}
          showRawJson={showRawJson}
          selectedTab={selectedTemplateTab}
          onSelectTab={setSelectedTemplateTab}
        />
      </div>
    </div>
  );
};
