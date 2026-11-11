import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const SUITE_TABS = [
  { id: 'supertest', label: 'API Tests', filename: 'supertest.api.test.ts', key: 'supertestApi', fallback: '// API test file' },
  { id: 'jest', label: 'Unit Tests', filename: 'jest.unit.test.ts', key: 'jestUnit', fallback: '// Unit test file' },
  { id: 'playwright', label: 'Browser Tests', filename: 'playwright.smoke.spec.ts', key: 'playwrightSmoke', fallback: '// Browser test file' },
  { id: 'autocannon', label: 'Speed Tests', filename: 'autocannon.load.js', key: 'autocannonLoad', fallback: '// Speed test file' },
];

export const TemplateOutputViewer = ({
  templates = {},
  rawJsonMatrix = '',
  showRawJson = false,
  selectedTab: controlledTab,
  onSelectTab,
}) => {
  const [internalTab, setInternalTab] = useState('supertest');
  const [copied, setCopied] = useState(false);

  const selectedTab = controlledTab ?? internalTab;
  const setSelectedTab = onSelectTab ?? setInternalTab;

  const activeSuite = SUITE_TABS.find((t) => t.id === selectedTab) || SUITE_TABS[0];
  const currentCode = templates?.[activeSuite.key] || activeSuite.fallback;

  const handleCopy = () => {
    navigator.clipboard.writeText(showRawJson ? rawJsonMatrix : currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full lg:w-1/2 bg-zinc-950 flex flex-col h-full overflow-hidden">
      {/* Tabs & Copy */}
      <div className="px-3 py-2.5 border-b border-zinc-800 bg-zinc-925 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {SUITE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap ${
                selectedTab === tab.id
                  ? 'bg-zinc-800 text-zinc-100 font-medium border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center space-x-1.5 transition-colors shrink-0"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300">
        {showRawJson ? (
          <pre className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
            <code>{rawJsonMatrix}</code>
          </pre>
        ) : (
          <pre className="text-zinc-300 whitespace-pre leading-relaxed">
            <code>{currentCode}</code>
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <span>
          File:{' '}
          <strong className="font-mono text-zinc-200">
            {showRawJson ? 'test-matrix.json' : activeSuite.filename}
          </strong>
        </span>
        <span className="text-zinc-500">Ready-to-run test template</span>
      </div>
    </div>
  );
};
