import React from 'react';
import { 
  Cpu, 
  GitPullRequest, 
  RotateCw, 
  FolderGit2, 
  Layers, 
  Network, 
  User, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
} from 'lucide-react';

export const SimplifiedHeader = ({
  currentTab,
  onSelectTab,
  selectedRepo,
  onSelectRepo,
  onAddRepository,
  repositories = [],
  currentUser,
  onRerunPipeline,
  isRerunning,
  activePr,
  onSignOut,
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: GitPullRequest },
    { id: 'ast-graph', label: 'Code Map', icon: Network },
    { id: 'test-spec', label: 'Tests', icon: Layers },
    { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
    { id: 'profile', label: 'Account', icon: User },
  ];

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
      {/* Left: Brand + Active Repository Dropdown */}
      <div className="flex items-center space-x-4">
        <div 
          onClick={() => onSelectTab('overview')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950">
            <Cpu size={17} />
          </div>
          <span className="font-semibold tracking-tight text-zinc-100 text-sm hidden sm:inline">
            Test360 AI
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block"></div>

        {/* Dynamic Repository Selector from MongoDB */}
        <div className="flex items-center space-x-1.5">
          <FolderGit2 size={13} className="text-zinc-500 hidden md:block" />
          <select
            value={selectedRepo}
            onChange={(e) => {
              if (e.target.value === '__add__') {
                e.target.blur();
                if (onAddRepository) {
                  onAddRepository();
                } else {
                  onSelectTab('repositories');
                }
              } else {
                onSelectRepo(e.target.value);
              }
            }}
            className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-md px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {repositories.map((repo) => (
              <option key={repo.fullName} value={repo.fullName}>
                {repo.fullName}
              </option>
            ))}
            <option value="__add__">+ Add Repository...</option>
          </select>
        </div>
      </div>

      {/* Middle: Clean Navigation Tabs */}
      <nav className="flex items-center space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-zinc-100' : 'text-zinc-500'} />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right: Rerun Action + User Profile Avatar Pill */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onRerunPipeline}
          disabled={isRerunning}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border ${
            isRerunning
              ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-wait'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
          }`}
          title="Re-run checks for this pull request"
        >
          <RotateCw size={13} className={isRerunning ? 'animate-spin text-zinc-300' : 'text-zinc-400'} />
          <span className="hidden sm:inline">{isRerunning ? 'Running...' : 'Run Checks'}</span>
        </button>

        {/* User Pill & Sign Out */}
        {currentUser ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <img
                src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=18181b&color=fafafa`}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-zinc-200 max-w-[100px] truncate hidden md:inline">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 font-semibold uppercase">
                {currentUser.role}
              </span>
            </button>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors"
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};
