import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const TemplateOutputViewer = ({
  templates = {},
  rawJsonMatrix = '',
  showRawJson = false
}) => {
  const [selectedTab, setSelectedTab] = useState('supertest');
  const [copied, setCopied] = useState(false);

  const getTemplateCode = () => {
    switch (selectedTab) {
      case 'jest':
        return { filename: 'jest.unit.test.ts', code: templates?.jestUnit || '// Unit template' };
      case 'supertest':
        return { filename: 'supertest.api.test.ts', code: templates?.supertestApi || '// Supertest template' };
      case 'playwright':
        return { filename: 'playwright.smoke.spec.ts', code: templates?.playwrightSmoke || '// Playwright smoke template' };
      case 'autocannon':
        return { filename: 'autocannon.load.js', code: templates?.autocannonLoad || '// Autocannon load template' };
      default:
        return { filename: 'supertest.api.test.ts', code: templates?.supertestApi || '' };
    }
  };

  const currentTemplate = getTemplateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(showRawJson ? rawJsonMatrix : currentTemplate.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full lg:w-1/2 bg-zinc-950 flex flex-col h-full overflow-hidden">
      {/* Tabs & Copy */}
      <div className="p-2 border-b border-zinc-800 bg-zinc-925 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setSelectedTab('supertest')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              selectedTab === 'supertest'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            supertest.api.test.ts
          </button>
          <button
            onClick={() => setSelectedTab('jest')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              selectedTab === 'jest'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            jest.unit.test.ts
          </button>
          <button
            onClick={() => setSelectedTab('playwright')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              selectedTab === 'playwright'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            playwright.smoke.spec.ts
          </button>
          <button
            onClick={() => setSelectedTab('autocannon')}
            className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
              selectedTab === 'autocannon'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            autocannon.load.js
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center space-x-1.5 transition-colors"
        >
          {copied ? <Check size={12} className="text-semantic-emerald" /> : <Copy size={12} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
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
            <code>{currentTemplate.code}</code>
          </pre>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0">
        <span className="text-zinc-400">
          Deterministic Template Target: <strong>{currentTemplate.filename}</strong>
        </span>
        <span className="text-zinc-500">
          Zero Free-Form Arbitrary Code Execution
        </span>
      </div>
    </div>
  );
};
