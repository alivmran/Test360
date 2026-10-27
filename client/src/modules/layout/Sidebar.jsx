import React from 'react';
import { 
  Terminal, 
  GitPullRequest, 
  GitBranch, 
  Network, 
  FileCode2, 
  Box, 
  Zap, 
  ShieldAlert, 
  ChevronDown,
  Layers
} from 'lucide-react';

export const Sidebar = ({
  currentStage,
  onSelectStage,
  selectedRepo,
  onSelectRepo,
  repositories = ['szabist-se/ecommerce-express-api', 'acme/inventory-service-ts'],
  activePr = { prNumber: 48, branch: 'feat/checkout-stock-v2', status: 'failed', commitSha: 'a4f91c2' },
  actorRole,
  onSelectRole,
}) => {
  const navItems = [
    { id: 'overview', label: '01. PR Scorecard & Overview', icon: GitPullRequest, badge: 'Verdict' },
    { id: 'ast-graph', label: '02. AST Blast-Radius Graph', icon: Network, badge: 'Babel' },
    { id: 'test-spec', label: '03. Test Spec & Compilation', icon: FileCode2, badge: 'Zod' },
    { id: 'sandbox', label: '04. Sandbox & Self-Healing', icon: Box, badge: 'Docker' },
    { id: 'mutation-load', label: '05. Mutation & Load Metrics', icon: Zap, badge: '85%' },
    { id: 'diagnostics-fix', label: '06. Diagnostics & 1-Click Fix', icon: ShieldAlert, badge: 'Monaco' },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-14 border-b border-zinc-800 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center">
            <Terminal size={15} strokeWidth={1.5} className="text-zinc-50" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-50">Test360 AI</span>
        </div>
        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
          MERN v1.0
        </span>
      </div>

      {/* Connected Repository Switcher (Dynamically fed from MongoDB) */}
      <div className="p-3 border-b border-zinc-800">
        <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-1.5 block">
          Connected Repository
        </label>
        <div className="relative">
          <select
            value={selectedRepo}
            onChange={(e) => onSelectRepo(e.target.value)}
            className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded px-2.5 py-1.5 font-mono appearance-none pr-7 cursor-pointer focus:outline-none focus:border-zinc-700 transition-colors"
          >
            {repositories.map((repo) => {
              const name = typeof repo === 'string' ? repo : repo.fullName;
              return (
                <option key={name} value={name} className="bg-zinc-900 text-zinc-200">
                  {name}
                </option>
              );
            })}
          </select>
          <ChevronDown size={14} strokeWidth={1.5} className="absolute right-2 top-2.5 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Active Pull Request Card (Live from MongoDB) */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
            Active PR Diff
          </span>
          <span className={`inline-flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded border ${
            activePr?.status === 'passed'
              ? 'text-semantic-emerald bg-semantic-emerald/10 border-semantic-emerald/20'
              : 'text-semantic-rose bg-semantic-rose/10 border-semantic-rose/20'
          }`}>
            {activePr?.status === 'passed' ? 'All Tiers Passed' : 'Failing (API Defect)'}
          </span>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded p-2 text-xs">
          <div className="flex items-center space-x-1.5 font-medium text-zinc-200 mb-1">
            <GitPullRequest size={13} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
            <span className="truncate">PR #{activePr?.prNumber || 48}: {activePr?.prTitle || 'feat(checkout)'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center space-x-1">
              <GitBranch size={11} strokeWidth={1.5} />
              <span className="text-zinc-400 truncate max-w-[110px]">{activePr?.branch || 'main'}</span>
            </span>
            <span className="text-zinc-400 font-mono">{(activePr?.commitSha || 'a4f91c2').substring(0, 7)}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[10px] uppercase font-mono tracking-wider text-zinc-500">
          Pipeline Stages (1–8)
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentStage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectStage(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs text-left transition-colors font-medium ${
                isActive
                  ? 'bg-zinc-900 text-zinc-50 border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon size={15} strokeWidth={1.5} className={isActive ? 'text-zinc-200' : 'text-zinc-500'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      : 'bg-zinc-900/60 text-zinc-500 border-zinc-800/80'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Actor Role Selector (Actor-Goal Matrix) */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center space-x-1">
            <Layers size={11} strokeWidth={1.5} />
            <span>Actor-Goal Role</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400 capitalize">{actorRole}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-zinc-900/80 p-0.5 rounded border border-zinc-800">
          {['developer', 'reviewer', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => onSelectRole(role)}
              className={`text-[10px] py-1 font-mono rounded capitalize transition-colors ${
                actorRole === role
                  ? 'bg-zinc-800 text-zinc-50 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {role === 'developer' ? 'Dev' : role === 'reviewer' ? 'Lead' : 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Engine Status / System Footer */}
      <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-semantic-emerald"></span>
          <span className="text-zinc-400">Daemon Active</span>
        </span>
        <span>PID: 49102</span>
      </div>
    </aside>
  );
};
