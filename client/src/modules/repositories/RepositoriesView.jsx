import React, { useState } from 'react';
import { 
  FolderGit2, 
  Plus, 
  Trash2, 
  Settings, 
  Check, 
  GitBranch, 
  Folder, 
  AlertCircle,
  ExternalLink,
  Radar,
  Sparkles,
  Layers,
  Copy,
  Send,
  Star,
  GitPullRequest,
  Shield,
  ArrowRight,
  Code2,
  CheckCircle2
} from 'lucide-react';
import { apiClient } from '../../shared/api/apiClient';

export const RepositoriesView = ({
  repositories = [],
  selectedRepo,
  onSelectRepo,
  onCreateRepo,
  onUpdateConfig,
  onDeleteRepo,
  onScanRepo,
  onSimulatePr,
  onNavigateTab,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
  const [scanningRepo, setScanningRepo] = useState(null);
  const [simulatingRepo, setSimulatingRepo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  // Form state for creating a new repository
  const [newRepoForm, setNewRepoForm] = useState({
    inputUrlOrName: '',
    defaultBranch: 'main',
    installationId: '',
    routesDir: 'src/routes',
    controllersDir: 'src/controllers',
    servicesDir: 'src/services',
    modelsDir: 'src/models',
    description: '',
    language: 'JavaScript / Node.js',
  });

  const [selectedPreset, setSelectedPreset] = useState('src'); // 'src' | 'root' | 'custom'
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedMetadata, setVerifiedMetadata] = useState(null);

  // Form state for editing convention directories
  const [editForm, setEditForm] = useState({
    routesDir: '',
    controllersDir: '',
    servicesDir: '',
    modelsDir: '',
    defaultBranch: '',
  });

  // PR Simulation modal state
  const [simulationForm, setSimulationForm] = useState({
    prNumber: 101,
    prTitle: 'feat(orders): add express discount calculation & inventory lock',
    branch: 'feat/orders-v2',
    author: 'dev-alinasir',
  });
  const [isSendingSimulation, setIsSendingSimulation] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    if (preset === 'src') {
      setNewRepoForm((prev) => ({
        ...prev,
        routesDir: 'src/routes',
        controllersDir: 'src/controllers',
        servicesDir: 'src/services',
        modelsDir: 'src/models',
      }));
    } else if (preset === 'root') {
      setNewRepoForm((prev) => ({
        ...prev,
        routesDir: 'routes',
        controllersDir: 'controllers',
        servicesDir: 'services',
        modelsDir: 'models',
      }));
    }
  };

  const handleQuickPickSample = (sampleUrl) => {
    setNewRepoForm((prev) => ({ ...prev, inputUrlOrName: sampleUrl }));
    handleVerifyRepo(sampleUrl);
  };

  const handleVerifyRepo = async (inputToVerify) => {
    const input = (inputToVerify || newRepoForm.inputUrlOrName).trim();
    if (!input) return;

    setIsVerifying(true);
    setVerifiedMetadata(null);
    try {
      const data = await apiClient.verifyRepository(input);
      setVerifiedMetadata(data);
      if (data.defaultBranch) {
        setNewRepoForm((prev) => ({
          ...prev,
          defaultBranch: data.defaultBranch,
          description: data.description || prev.description,
          language: data.language || prev.language,
        }));
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const input = newRepoForm.inputUrlOrName.trim();
    if (!input) {
      setErrorMsg('Please enter a GitHub repository URL or "owner/repo" name.');
      return;
    }

    try {
      await onCreateRepo({
        fullName: input,
        gitUrl: input.startsWith('http') ? input : `https://github.com/${input}`,
        defaultBranch: newRepoForm.defaultBranch.trim() || 'main',
        description: newRepoForm.description.trim() || verifiedMetadata?.description || 'Express.js backend application',
        language: newRepoForm.language.trim() || verifiedMetadata?.language || 'JavaScript',
        installationId: newRepoForm.installationId.trim() || String(Math.floor(1000000 + Math.random() * 9000000)),
        conventions: {
          routesDir: newRepoForm.routesDir.trim(),
          controllersDir: newRepoForm.controllersDir.trim(),
          servicesDir: newRepoForm.servicesDir.trim(),
          modelsDir: newRepoForm.modelsDir.trim(),
        },
      });

      setSuccessMsg(`Repository attached and initial AST baseline created!`);
      setShowAddModal(false);
      setVerifiedMetadata(null);
      setNewRepoForm({
        inputUrlOrName: '',
        defaultBranch: 'main',
        installationId: '',
        routesDir: 'src/routes',
        controllersDir: 'src/controllers',
        servicesDir: 'src/services',
        modelsDir: 'src/models',
        description: '',
        language: 'JavaScript / Node.js',
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to attach repository');
    }
  };

  const handleTriggerScan = async (fullName) => {
    setErrorMsg('');
    setScanningRepo(fullName);
    try {
      const [owner, repo] = fullName.split('/');
      if (onScanRepo) {
        const res = await onScanRepo(owner, repo);
        setSuccessMsg(res?.message || `Architecture scan complete for "${fullName}"`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Scan failed');
    } finally {
      setScanningRepo(null);
    }
  };

  const handleOpenSimulation = (repo) => {
    setSimulatingRepo(repo);
    setSimulationResult(null);
    const randomPr = Math.floor(Math.random() * 90) + 10;
    setSimulationForm({
      prNumber: randomPr,
      prTitle: `feat: optimize ${repo.repoName} routes & validate idempotency`,
      branch: `feat/update-pr${randomPr}`,
      author: repo.owner || 'developer',
    });
  };

  const handleExecuteSimulation = async () => {
    if (!simulatingRepo || !onSimulatePr) return;
    setIsSendingSimulation(true);
    setErrorMsg('');
    try {
      const res = await onSimulatePr({
        fullName: simulatingRepo.fullName,
        prNumber: Number(simulationForm.prNumber),
        prTitle: simulationForm.prTitle,
        branch: simulationForm.branch,
        author: simulationForm.author,
      });

      setSimulationResult(res);
      setSuccessMsg(res?.message || `PR #${simulationForm.prNumber} webhook received and processed!`);
      onSelectRepo(simulatingRepo.fullName);
    } catch (err) {
      setErrorMsg(err.message || 'Simulation failed');
    } finally {
      setIsSendingSimulation(false);
    }
  };

  const startEditing = (repo) => {
    setEditingRepo(repo.fullName);
    setEditForm({
      routesDir: repo.conventions?.routesDir || 'src/routes',
      controllersDir: repo.conventions?.controllersDir || 'src/controllers',
      servicesDir: repo.conventions?.servicesDir || 'src/services',
      modelsDir: repo.conventions?.modelsDir || 'src/models',
      defaultBranch: repo.defaultBranch || 'main',
    });
  };

  const handleEditSubmit = async (fullName) => {
    setErrorMsg('');
    try {
      const [owner, repo] = fullName.split('/');
      await onUpdateConfig(owner, repo, {
        defaultBranch: editForm.defaultBranch,
        conventions: {
          routesDir: editForm.routesDir,
          controllersDir: editForm.controllersDir,
          servicesDir: editForm.servicesDir,
          modelsDir: editForm.modelsDir,
        },
      });
      setEditingRepo(null);
      setSuccessMsg(`Folder conventions saved for ${fullName}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update configuration');
    }
  };

  const handleDelete = async (fullName) => {
    if (!window.confirm(`Are you sure you want to disconnect repository "${fullName}"? This will remove its test runs and AST graphs.`)) {
      return;
    }
    setErrorMsg('');
    try {
      const [owner, repo] = fullName.split('/');
      await onDeleteRepo(owner, repo);
      setSuccessMsg(`Repository "${fullName}" disconnected.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete repository');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-zinc-400 mb-1">
            <FolderGit2 size={14} className="text-indigo-400" />
            <span className="font-semibold uppercase tracking-wider text-zinc-300">Repositories</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
            Attached Repositories
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Attach your Express.js &amp; Node.js applications to synthesize multi-tier tests, run automated AST blast radius analysis, and receive live PR scorecards.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Attach Repository</span>
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-center space-x-2">
          <AlertCircle size={15} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 flex items-center space-x-2">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Repositories Cards Grid */}
      <div className="grid grid-cols-1 gap-5">
        {repositories.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
            <FolderGit2 size={36} className="mx-auto text-zinc-600 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No repositories attached yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Attach a GitHub repository to automatically discover routes, build call graphs, and synthesize test suites.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Attach Your First Repository
            </button>
          </div>
        ) : (
          repositories.map((repo) => {
            const isSelected = repo.fullName === selectedRepo;
            const isEditing = editingRepo === repo.fullName;
            const isScanning = scanningRepo === repo.fullName;

            const webhookPayloadUrl = `${window.location.origin}/api/ingestion/webhook`;
            const webhookSecret = repo.webhookSecret || 'whsec_test360_secure';

            return (
              <div
                key={repo.fullName}
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-950/15 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
                  <div className="flex items-start space-x-3.5">
                    <div className="p-2.5 rounded-xl bg-zinc-800/80 text-zinc-200 shrink-0 mt-0.5 border border-zinc-700/50">
                      <FolderGit2 size={22} className="text-indigo-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-zinc-100 text-base">{repo.fullName}</span>
                        {isSelected ? (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded-full">
                            {repo.status === 'scanned' ? 'Scanned' : 'Connected'}
                          </span>
                        )}
                        {repo.language && (
                          <span className="px-2 py-0.5 text-[10px] bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 rounded-full font-medium">
                            {repo.language}
                          </span>
                        )}
                      </div>

                      {repo.description && (
                        <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                          {repo.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-1.5 font-mono">
                        <span className="flex items-center space-x-1">
                          <GitBranch size={12} className="text-zinc-500" />
                          <span>{repo.defaultBranch || 'main'}</span>
                        </span>
                        <span>&bull;</span>
                        <a
                          href={repo.gitUrl || `https://github.com/${repo.fullName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-indigo-300 flex items-center space-x-1 text-zinc-400"
                        >
                          <span>github.com/{repo.fullName}</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                    {!isSelected && (
                      <button
                        onClick={() => onSelectRepo(repo.fullName)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors font-medium"
                      >
                        Select Active
                      </button>
                    )}

                    <button
                      onClick={() => handleTriggerScan(repo.fullName)}
                      disabled={isScanning}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center space-x-1.5 font-medium"
                      title="Scan AST routes & models"
                    >
                      <Radar size={13} className={isScanning ? 'animate-spin text-indigo-400' : 'text-zinc-400'} />
                      <span>{isScanning ? 'Scanning...' : 'Scan Architecture'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenSimulation(repo)}
                      className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs rounded-lg transition-colors flex items-center space-x-1.5 font-medium"
                      title="Trigger test PR event"
                    >
                      <Send size={12} className="text-indigo-400" />
                      <span>Simulate PR</span>
                    </button>

                    <button
                      onClick={() => (isEditing ? setEditingRepo(null) : startEditing(repo))}
                      className="px-2.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Settings size={13} />
                      <span>{isEditing ? 'Close' : 'Folders'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(repo.fullName)}
                      className="p-1.5 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Disconnect repository"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Architecture & Stats Bar */}
                <div className="pt-3 pb-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-zinc-800/40">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                    <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 text-zinc-300">
                      📁 {repo.conventions?.routesDir || 'src/routes'}
                    </span>
                    <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 text-zinc-300">
                      📁 {repo.conventions?.controllersDir || 'src/controllers'}
                    </span>
                    <span className="bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 text-zinc-300">
                      📁 {repo.conventions?.modelsDir || 'src/models'}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-300 flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50">
                      <strong>{repo.summary?.routesCount || 4}</strong> Routes
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50">
                      <strong>{repo.summary?.controllersCount || 2}</strong> Controllers
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50">
                      <strong>{repo.summary?.modelsCount || 2}</strong> Schemas
                    </span>
                  </div>
                </div>

                {/* GitHub App & Webhook Configuration Box */}
                <div className="mt-3 p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
                      <Shield size={14} className="text-indigo-400" />
                      <span>GitHub Webhook Configuration</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Event: Pull Request, Push
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400">
                    Add this Webhook URL and Secret in your GitHub repository settings (<strong>Settings &gt; Webhooks &gt; Add Webhook</strong>) so Test360 AI receives PR events under &lt;100ms SLA.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="truncate mr-2">
                        <span className="text-[10px] text-zinc-500 block uppercase font-mono">Payload URL</span>
                        <code className="text-xs text-zinc-200 truncate block font-mono">{webhookPayloadUrl}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(webhookPayloadUrl, `url-${repo.fullName}`)}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded shrink-0"
                        title="Copy Webhook URL"
                      >
                        {copiedKey === `url-${repo.fullName}` ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="truncate mr-2">
                        <span className="text-[10px] text-zinc-500 block uppercase font-mono">Secret (HMAC SHA-256)</span>
                        <code className="text-xs text-zinc-200 truncate block font-mono">{webhookSecret}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(webhookSecret, `secret-${repo.fullName}`)}
                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded shrink-0"
                        title="Copy Secret"
                      >
                        {copiedKey === `secret-${repo.fullName}` ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="mt-3 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectRepo(repo.fullName);
                        if (onNavigateTab) onNavigateTab('overview');
                      }}
                      className="px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs flex items-center space-x-1 font-medium transition-colors"
                    >
                      <span>PR Scorecard</span>
                      <ArrowRight size={12} className="text-zinc-400" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectRepo(repo.fullName);
                        if (onNavigateTab) onNavigateTab('ast-graph');
                      }}
                      className="px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs flex items-center space-x-1 font-medium transition-colors"
                    >
                      <span>AST Blast Radius</span>
                      <ArrowRight size={12} className="text-zinc-400" />
                    </button>

                    <button
                      onClick={() => {
                        onSelectRepo(repo.fullName);
                        if (onNavigateTab) onNavigateTab('test-spec');
                      }}
                      className="px-2.5 py-1 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs flex items-center space-x-1 font-medium transition-colors"
                    >
                      <span>Test Synthesis</span>
                      <ArrowRight size={12} className="text-zinc-400" />
                    </button>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    Updated: {new Date(repo.updatedAt || repo.lastScannedAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>

                {/* Inline Folder Conventions Editor */}
                {isEditing && (
                  <div className="mt-4 pt-4 space-y-3 bg-zinc-950/70 -mx-5 -mb-5 p-5 rounded-b-2xl border-t border-zinc-800">
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                      Configure Source Code Folders
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Specify where Express.js routes, controllers, and models are located so Babel AST traversal maps dependencies properly.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1 font-medium">Routes Folder</label>
                        <input
                          type="text"
                          value={editForm.routesDir}
                          onChange={(e) => setEditForm({ ...editForm, routesDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1 font-medium">Controllers Folder</label>
                        <input
                          type="text"
                          value={editForm.controllersDir}
                          onChange={(e) => setEditForm({ ...editForm, controllersDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1 font-medium">Services Folder</label>
                        <input
                          type="text"
                          value={editForm.servicesDir}
                          onChange={(e) => setEditForm({ ...editForm, servicesDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1 font-medium">Models Folder</label>
                        <input
                          type="text"
                          value={editForm.modelsDir}
                          onChange={(e) => setEditForm({ ...editForm, modelsDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setEditingRepo(null)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(repo.fullName)}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-semibold"
                      >
                        Save Folder Paths
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Attach Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
                <FolderGit2 size={18} className="text-indigo-400" />
                <span>Attach an Express.js Repository</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Quick Pick Sample Repositories */}
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-300 block">
                Quick Sample Pick:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickPickSample('szabist-se/ecommerce-express-api')}
                  className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-mono border border-zinc-700/50"
                >
                  szabist-se/ecommerce-express-api
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPickSample('alivmran/Test360')}
                  className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-mono border border-zinc-700/50"
                >
                  alivmran/Test360
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPickSample('expressjs/express')}
                  className="px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] font-mono border border-zinc-700/50"
                >
                  expressjs/express
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-200 mb-1 font-semibold">
                  GitHub Repository URL or Name <span className="text-red-400">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="https://github.com/owner/repo or owner/repo"
                    value={newRepoForm.inputUrlOrName}
                    onChange={(e) => {
                      setNewRepoForm({ ...newRepoForm, inputUrlOrName: e.target.value });
                    }}
                    onBlur={() => handleVerifyRepo()}
                    className="flex-1 px-3 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyRepo()}
                    disabled={isVerifying}
                    className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium shrink-0 flex items-center space-x-1"
                  >
                    {isVerifying ? (
                      <Radar size={13} className="animate-spin text-indigo-400" />
                    ) : (
                      <CheckCircle2 size={13} className="text-zinc-400" />
                    )}
                    <span>{isVerifying ? 'Checking...' : 'Check Repo'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Paste any public/private GitHub repository URL or type <code>owner/repo</code>.
                </span>
              </div>

              {/* Verified Metadata Preview */}
              {verifiedMetadata && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    {verifiedMetadata.avatarUrl && (
                      <img
                        src={verifiedMetadata.avatarUrl}
                        alt="Owner avatar"
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="font-bold text-zinc-100">{verifiedMetadata.fullName}</span>
                    <span className="px-1.5 py-0.5 text-[10px] bg-indigo-500/20 text-indigo-300 rounded font-mono">
                      {verifiedMetadata.language || 'Node.js'}
                    </span>
                    {verifiedMetadata.starsCount > 0 && (
                      <span className="flex items-center space-x-0.5 text-amber-300 text-[10px]">
                        <Star size={11} fill="currentColor" />
                        <span>{verifiedMetadata.starsCount}</span>
                      </span>
                    )}
                  </div>
                  {verifiedMetadata.description && (
                    <p className="text-[11px] text-zinc-300">
                      {verifiedMetadata.description}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-zinc-200 mb-1.5 font-semibold">
                  Project Structure Preset
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('src')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedPreset === 'src'
                        ? 'border-indigo-500 bg-indigo-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">Standard Express (src/)</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">src/routes, src/controllers</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('root')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedPreset === 'root'
                        ? 'border-indigo-500 bg-indigo-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">Root MVC (routes/)</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">routes/, controllers/, models/</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Default Branch</label>
                  <input
                    type="text"
                    value={newRepoForm.defaultBranch}
                    onChange={(e) => setNewRepoForm({ ...newRepoForm, defaultBranch: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Installation ID</label>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={newRepoForm.installationId}
                    onChange={(e) => setNewRepoForm({ ...newRepoForm, installationId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <span className="block text-[11px] font-mono text-zinc-400 mb-2 uppercase tracking-wider font-semibold">
                  Source Folders (Auto-configured by Preset)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Routes</label>
                    <input
                      type="text"
                      value={newRepoForm.routesDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, routesDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Controllers</label>
                    <input
                      type="text"
                      value={newRepoForm.controllersDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, controllersDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Services</label>
                    <input
                      type="text"
                      value={newRepoForm.servicesDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, servicesDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">Models</label>
                    <input
                      type="text"
                      value={newRepoForm.modelsDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, modelsDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  Attach &amp; Synthesize Baseline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulate PR Webhook Modal */}
      {simulatingRepo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
                <Send size={16} className="text-indigo-400" />
                <span>Simulate PR Webhook for {simulatingRepo.repoName}</span>
              </h3>
              <button
                onClick={() => setSimulatingRepo(null)}
                className="text-zinc-400 hover:text-zinc-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Dispatches a simulated GitHub Pull Request event payload to <code>/api/ingestion/webhook</code> to test the event-driven pipeline under &lt;100ms SLA.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">PR Number</label>
                  <input
                    type="number"
                    value={simulationForm.prNumber}
                    onChange={(e) => setSimulationForm({ ...simulationForm, prNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">PR Author</label>
                  <input
                    type="text"
                    value={simulationForm.author}
                    onChange={(e) => setSimulationForm({ ...simulationForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">PR Title</label>
                <input
                  type="text"
                  value={simulationForm.prTitle}
                  onChange={(e) => setSimulationForm({ ...simulationForm, prTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Branch</label>
                <input
                  type="text"
                  value={simulationForm.branch}
                  onChange={(e) => setSimulationForm({ ...simulationForm, branch: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {simulationResult && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-300 font-semibold">
                    <Check size={14} />
                    <span>Webhook Ingestion ACK Met!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    {simulationResult.message}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatingRepo(null);
                        if (onNavigateTab) onNavigateTab('overview');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>Open PR Scorecard</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSimulatingRepo(null)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleExecuteSimulation}
                  disabled={isSendingSimulation}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
                >
                  <Send size={13} className={isSendingSimulation ? 'animate-spin' : ''} />
                  <span>{isSendingSimulation ? 'Ingesting...' : 'Send PR Webhook Event'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoriesView;
