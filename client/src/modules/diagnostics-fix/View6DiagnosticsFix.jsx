import React, { useState } from 'react';
import { ShieldAlert, Settings } from 'lucide-react';
import { FailureDiagnosticCard } from './FailureDiagnosticCard';
import { MonacoDiffSection } from './MonacoDiffSection';
import { GitHubAppConfigPanel } from './GitHubAppConfigPanel';

export const View6DiagnosticsFix = ({
  originalCode,
  repairedCode,
  defect,
  actorRole = 'developer',
  repository = 'szabist-se/ecommerce-express-api',
  prNumber = 48,
  onRepairApplied,
}) => {
  const [activeSection, setActiveSection] = useState('repair');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Stage Bar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert size={13} strokeWidth={1.5} className="text-semantic-rose" />
            <span>Stage 8: Plain-English Triage, Monaco Diff &amp; Governance</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">
            {activeSection === 'repair' ? `Target File: ${defect?.file || 'src/controllers/checkoutController.ts'}:${defect?.line || 64}` : 'Repository Administrator Settings'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <button
            onClick={() => setActiveSection('repair')}
            className={`px-3 py-1 rounded transition-colors ${
              activeSection === 'repair'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Diagnostics &amp; Monaco Diff
          </button>
          <button
            onClick={() => setActiveSection('config')}
            className={`px-3 py-1 rounded flex items-center space-x-1.5 transition-colors ${
              activeSection === 'config'
                ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings size={12} strokeWidth={1.5} />
            <span>GitHub App Config {actorRole === 'admin' ? '(Admin)' : ''}</span>
          </button>
        </div>
      </div>

      {activeSection === 'repair' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <FailureDiagnosticCard defect={defect} />
          <MonacoDiffSection
            originalCode={originalCode}
            repairedCode={repairedCode}
            repository={repository}
            prNumber={prNumber}
            onRepairApplied={onRepairApplied}
          />
        </div>
      ) : (
        <GitHubAppConfigPanel repository={repository} />
      )}
    </div>
  );
};
