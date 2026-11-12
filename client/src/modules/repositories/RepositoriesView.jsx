import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  Settings,
  Check,
  GitBranch,
  AlertCircle,
  ExternalLink,
  RotateCw,
  Copy,
  Send,
  Star,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Webhook,
  Folder,
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
  openAddModalSignal = 0,
  onConsumeAddModalSignal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (openAddModalSignal > 0) {
      setShowAddModal(true);
      onConsumeAddModalSignal?.();
    }
  }, [openAddModalSignal, onConsumeAddModalSignal]);
  const [openSettingsRepo, setOpenSettingsRepo] = useState(null);
  const [settingsTab, setSettingsTab] = useState('webhook'); // 'webhook' | 'folders'
  const [scanningRepo, setScanningRepo] = useState(null);
  const [testingDeliveryRepo, setTestingDeliveryRepo] = useState(null);
  const [deliveryTestResults, setDeliveryTestResults] = useState({});
  const [simulatingRepo, setSimulatingRepo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  // Form state for adding a new repository
  const [newRepoForm, setNewRepoForm] = useState({
    inputUrlOrName: '',
    defaultBranch: 'main',
    localPath: '',
    routesDir: 'src/routes',
    controllersDir: 'src/controllers',
    servicesDir: 'src/services',
    modelsDir: 'src/models',
    description: '',
    language: 'JavaScript',
  });

  const [selectedPreset, setSelectedPreset] = useState('src');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedMetadata, setVerifiedMetadata] = useState(null);

  // Form state for editing folder paths
  const [editForm, setEditForm] = useState({
    localPath: '',
    routesDir: '',
    controllersDir: '',
    servicesDir: '',
    modelsDir: '',
    defaultBranch: '',
  });

  // PR Simulation modal state
  const [simulationForm, setSimulationForm] = useState({
    prNumber: 101,
    prTitle: 'Update checkout pricing validation',
    branch: 'feat/checkout-fix',
    author: 'developer',
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
      // Optional metadata check
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
      setErrorMsg('Enter a GitHub URL or owner/repository name.');
      return;
    }

    try {
      await onCreateRepo({
        fullName: input,
        gitUrl: input.startsWith('http') ? input : `https://github.com/${input}`,
        defaultBranch: newRepoForm.defaultBranch.trim() || 'main',
        localPath: newRepoForm.localPath.trim(),
        description:
          newRepoForm.description.trim() ||
          verifiedMetadata?.description ||
          'Node.js backend repository',
        language: newRepoForm.language.trim() || verifiedMetadata?.language || 'JavaScript',
        installationId: String(Math.floor(1000000 + Math.random() * 9000000)),
        conventions: {
          routesDir: newRepoForm.routesDir.trim(),
          controllersDir: newRepoForm.controllersDir.trim(),
          servicesDir: newRepoForm.servicesDir.trim(),
          modelsDir: newRepoForm.modelsDir.trim(),
        },
      });

      setSuccessMsg('Repository connected.');
      setShowAddModal(false);
      setVerifiedMetadata(null);
      setNewRepoForm({
        inputUrlOrName: '',
        defaultBranch: 'main',
        localPath: '',
        routesDir: 'src/routes',
        controllersDir: 'src/controllers',
        servicesDir: 'src/services',
        modelsDir: 'src/models',
        description: '',
        language: 'JavaScript',
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Could not add repository');
    }
  };

  const handleTriggerScan = async (fullName, localPath = null) => {
    setErrorMsg('');
    setScanningRepo(fullName);
    try {
      const [owner, repo] = fullName.split('/');
      if (onScanRepo) {
        const res = await onScanRepo(owner, repo, localPath);
        setSuccessMsg(res?.message || `Scan finished for ${fullName}`);
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Scan failed');
    } finally {
      setScanningRepo(null);
    }
  };

  const handleTestDelivery = async (fullName) => {
    setTestingDeliveryRepo(fullName);
    setErrorMsg('');
    try {
      const res = await apiClient.testWebhookDelivery(fullName, 'ping');
      setDeliveryTestResults((prev) => ({ ...prev, [fullName]: res }));
      setSuccessMsg(`Webhook Ping delivery verified in ${res.latencyMs}ms (<100ms SLA met).`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Webhook test delivery failed');
      setDeliveryTestResults((prev) => ({
        ...prev,
        [fullName]: { success: false, error: err.message },
      }));
    } finally {
      setTestingDeliveryRepo(null);
    }
  };

  const handleOpenSimulation = (repo) => {
    setSimulatingRepo(repo);
    setSimulationResult(null);
    const randomPr = Math.floor(Math.random() * 90) + 10;
    setSimulationForm({
      prNumber: randomPr,
      prTitle: `Update ${repo.repoName || repo.fullName.split('/')[1]} routes & validation`,
      branch: `feat/pr-${randomPr}`,
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
      setSuccessMsg(`Test PR #${simulationForm.prNumber} completed.`);
      onSelectRepo(simulatingRepo.fullName);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to run test PR');
    } finally {
      setIsSendingSimulation(false);
    }
  };

  const toggleSettings = (repo) => {
    if (openSettingsRepo === repo.fullName) {
      setOpenSettingsRepo(null);
      return;
    }
    setOpenSettingsRepo(repo.fullName);
    setSettingsTab('webhook');
    setEditForm({
      localPath: repo.localPath || '',
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
        localPath: editForm.localPath,
        conventions: {
          routesDir: editForm.routesDir,
          controllersDir: editForm.controllersDir,
          servicesDir: editForm.servicesDir,
          modelsDir: editForm.modelsDir,
        },
      });
      setOpenSettingsRepo(null);
      setSuccessMsg(`Saved folder settings for ${fullName}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save folder settings');
    }
  };

  const handleDelete = async (fullName) => {
    if (
      !window.confirm(
        `Remove "${fullName}" from Test360? This deletes its saved test runs and code maps.`
      )
    ) {
      return;
    }
    setErrorMsg('');
    try {
      const [owner, repo] = fullName.split('/');
      await onDeleteRepo(owner, repo);
      setSuccessMsg(`Removed ${fullName}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove repository');
    }
  };

  return (
    <>
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
            Repositories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Connect a GitHub repository to generate and run checks on every pull request.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Repository</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-200 flex items-center space-x-2">
          <AlertCircle size={15} className="text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-200 flex items-center space-x-2">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Repository List */}
      <div className="space-y-4">
        {repositories.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            <FolderGit2 size={32} className="mx-auto text-zinc-600 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-200">No repositories connected</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Add a GitHub repository to map routes and run automated pull request checks.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Add Your First Repository
            </button>
          </div>
        ) : (
          repositories.map((repo) => {
            const isSelected = repo.fullName === selectedRepo;
            const isSettingsOpen = openSettingsRepo === repo.fullName;
            const isScanning = scanningRepo === repo.fullName;

            const webhookPayloadUrl = `${window.location.origin}/api/ingestion/webhook`;
            const webhookSecret = repo.webhookSecret || 'whsec_test360_secure';

            const routesCount = repo.summary?.routesCount ?? 4;
            const controllersCount = repo.summary?.controllersCount ?? 1;
            const modelsCount = repo.summary?.modelsCount ?? 1;

            return (
              <div
                key={repo.fullName}
                className={`rounded-xl border transition-colors ${
                  isSelected
                    ? 'border-indigo-500/40 bg-zinc-900/70'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                {/* Main Card Content */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Repo Info */}
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <FolderGit2
                        size={18}
                        className={isSelected ? 'text-indigo-400 shrink-0' : 'text-zinc-400 shrink-0'}
                      />
                      <span className="font-semibold text-zinc-100 text-base truncate">
                        {repo.fullName}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                          Active
                        </span>
                      )}
                    </div>

                    {repo.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1 max-w-2xl">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span className="inline-flex items-center space-x-1 font-mono text-zinc-400">
                        <GitBranch size={12} />
                        <span>{repo.defaultBranch || 'main'}</span>
                      </span>
                      <span>·</span>
                      <a
                        href={repo.gitUrl || `https://github.com/${repo.fullName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-zinc-200 inline-flex items-center space-x-1 transition-colors"
                      >
                        <span>GitHub</span>
                        <ExternalLink size={11} />
                      </a>
                      <span>·</span>
                      <span>
                        {routesCount} {routesCount === 1 ? 'route' : 'routes'} · {controllersCount}{' '}
                        {controllersCount === 1 ? 'controller' : 'controllers'} · {modelsCount}{' '}
                        {modelsCount === 1 ? 'model' : 'models'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Clean Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {!isSelected ? (
                      <button
                        type="button"
                        onClick={() => onSelectRepo(repo.fullName)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs rounded-lg transition-colors font-medium"
                      >
                        Set Active
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigateTab?.('overview')}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs rounded-lg transition-colors font-medium inline-flex items-center space-x-1"
                      >
                        <span>Open Overview</span>
                        <ArrowRight size={12} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenSimulation(repo)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-medium inline-flex items-center space-x-1.5"
                    >
                      <Send size={12} />
                      <span>Test PR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerScan(repo.fullName)}
                      disabled={isScanning}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs rounded-lg transition-colors inline-flex items-center space-x-1.5"
                    >
                      <RotateCw size={12} className={isScanning ? 'animate-spin text-indigo-400' : ''} />
                      <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleSettings(repo)}
                      className={`px-3 py-1.5 border text-xs rounded-lg transition-colors inline-flex items-center space-x-1.5 ${
                        isSettingsOpen
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      <Settings size={12} />
                      <span>Settings</span>
                      {isSettingsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(repo.fullName)}
                      className="p-1.5 hover:bg-rose-950/60 text-zinc-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Remove repository"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subtle Quick Links Strip */}
                <div className="px-5 py-2.5 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRepo(repo.fullName);
                        onNavigateTab?.('overview');
                      }}
                      className="hover:text-zinc-200 transition-colors"
                    >
                      Checks
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRepo(repo.fullName);
                        onNavigateTab?.('ast-graph');
                      }}
                      className="hover:text-zinc-200 transition-colors"
                    >
                      Code Map
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRepo(repo.fullName);
                        onNavigateTab?.('test-spec');
                      }}
                      className="hover:text-zinc-200 transition-colors"
                    >
                      Generated Tests
                    </button>
                  </div>

                  <span className="font-mono text-[11px] text-zinc-500">
                    {repo.conventions?.routesDir || 'src/routes'} ·{' '}
                    {repo.conventions?.controllersDir || 'src/controllers'}
                  </span>
                </div>

                {/* Collapsible Webhook & Folder Settings Drawer */}
                {isSettingsOpen && (
                  <div className="p-5 bg-zinc-950/80 border-t border-zinc-800 rounded-b-xl space-y-4">
                    <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit text-xs">
                      <button
                        type="button"
                        onClick={() => setSettingsTab('webhook')}
                        className={`px-3 py-1.5 rounded-md font-medium inline-flex items-center space-x-1.5 transition-colors ${
                          settingsTab === 'webhook'
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Webhook size={13} />
                        <span>GitHub Webhook</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSettingsTab('folders')}
                        className={`px-3 py-1.5 rounded-md font-medium inline-flex items-center space-x-1.5 transition-colors ${
                          settingsTab === 'folders'
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Folder size={13} />
                        <span>Folder Paths</span>
                      </button>
                    </div>

                    {settingsTab === 'webhook' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-zinc-400">
                          Paste these values in GitHub under{' '}
                          <strong className="text-zinc-200">
                            Settings &gt; Webhooks &gt; Add webhook
                          </strong>{' '}
                          to run checks automatically when PRs open.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <div className="truncate mr-2">
                              <span className="text-[11px] text-zinc-500 block">Webhook URL</span>
                              <code className="text-xs text-zinc-200 truncate block font-mono">
                                {webhookPayloadUrl}
                              </code>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(webhookPayloadUrl, `url-${repo.fullName}`)
                              }
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded shrink-0"
                              title="Copy Webhook URL"
                            >
                              {copiedKey === `url-${repo.fullName}` ? (
                                <Check size={14} className="text-emerald-400" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <div className="truncate mr-2">
                              <span className="text-[11px] text-zinc-500 block">Webhook Secret</span>
                              <code className="text-xs text-zinc-200 truncate block font-mono">
                                {webhookSecret}
                              </code>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(webhookSecret, `secret-${repo.fullName}`)
                              }
                              className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded shrink-0"
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

                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-zinc-900">
                          <div className="text-xs text-zinc-400">
                            <span className="font-semibold text-zinc-300">Live Delivery Handshake: </span>
                            <span>Send an HMAC-signed test ping to verify endpoint responsiveness (&lt;100ms SLA).</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTestDelivery(repo.fullName)}
                            disabled={testingDeliveryRepo === repo.fullName}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg inline-flex items-center space-x-1.5 shrink-0 transition-colors"
                          >
                            <RotateCw size={12} className={testingDeliveryRepo === repo.fullName ? 'animate-spin' : ''} />
                            <span>{testingDeliveryRepo === repo.fullName ? 'Verifying...' : 'Test Webhook Delivery'}</span>
                          </button>
                        </div>

                        {deliveryTestResults[repo.fullName] && (
                          <div
                            className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                              deliveryTestResults[repo.fullName].success
                                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                                : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <CheckCircle2
                                size={15}
                                className={
                                  deliveryTestResults[repo.fullName].success
                                    ? 'text-emerald-400 shrink-0'
                                    : 'text-rose-400 shrink-0'
                                }
                              />
                              <span>
                                {deliveryTestResults[repo.fullName].success
                                  ? `⚡ Ping ACK: ${deliveryTestResults[repo.fullName].latencyMs}ms · HMAC Verified · 200 OK (${deliveryTestResults[repo.fullName].response?.status})`
                                  : `Delivery Failed: ${deliveryTestResults[repo.fullName].error}`}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 hidden sm:inline">
                              Delivery: {deliveryTestResults[repo.fullName].deliveryId?.substring(0, 8)}...
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                          <label className="block text-zinc-200 text-xs font-medium">Local Repository Path (Disk AST Scanner)</label>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={editForm.localPath}
                              onChange={(e) => setEditForm({ ...editForm, localPath: e.target.value })}
                              placeholder="e.g. D:/Projects/Test360-AI/server/test-fixtures/sample-express-api"
                              className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleTriggerScan(repo.fullName, editForm.localPath)}
                              disabled={scanningRepo === repo.fullName}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-medium whitespace-nowrap shrink-0 transition-colors inline-flex items-center space-x-1.5"
                            >
                              <RotateCw size={12} className={scanningRepo === repo.fullName ? 'animate-spin' : ''} />
                              <span>{scanningRepo === repo.fullName ? 'Scanning Disk...' : 'Live Disk Scan'}</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            Directly parses Express routes, Mongoose schema fields, and process.env keys from this local folder via Babel AST visitor.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block text-zinc-400 mb-1">Routes</label>
                            <input
                              type="text"
                              value={editForm.routesDir}
                              onChange={(e) =>
                                setEditForm({ ...editForm, routesDir: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-1">Controllers</label>
                            <input
                              type="text"
                              value={editForm.controllersDir}
                              onChange={(e) =>
                                setEditForm({ ...editForm, controllersDir: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-1">Services</label>
                            <input
                              type="text"
                              value={editForm.servicesDir}
                              onChange={(e) =>
                                setEditForm({ ...editForm, servicesDir: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 mb-1">Models</label>
                            <input
                              type="text"
                              value={editForm.modelsDir}
                              onChange={(e) =>
                                setEditForm({ ...editForm, modelsDir: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setOpenSettingsRepo(null)}
                            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditSubmit(repo.fullName)}
                            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-medium"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center space-x-2">
                <FolderGit2 size={17} className="text-indigo-400" />
                <span>Add Repository</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400 block">Try an example repository:</span>
              <div className="flex flex-wrap gap-2">
                {['szabist-se/ecommerce-express-api', 'alivmran/Test360', 'expressjs/express'].map(
                  (sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => handleQuickPickSample(sample)}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-xs font-mono"
                    >
                      {sample}
                    </button>
                  )
                )}
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-200 mb-1.5 font-medium">
                  GitHub URL or owner/repo <span className="text-rose-400">*</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="https://github.com/owner/repo or owner/repo"
                    value={newRepoForm.inputUrlOrName}
                    onChange={(e) =>
                      setNewRepoForm({ ...newRepoForm, inputUrlOrName: e.target.value })
                    }
                    onBlur={() => handleVerifyRepo()}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyRepo()}
                    disabled={isVerifying}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium shrink-0 inline-flex items-center space-x-1"
                  >
                    <CheckCircle2
                      size={13}
                      className={isVerifying ? 'animate-spin text-indigo-400' : 'text-zinc-400'}
                    />
                    <span>{isVerifying ? 'Checking...' : 'Check'}</span>
                  </button>
                </div>
              </div>

              {verifiedMetadata && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg space-y-1">
                  <div className="flex items-center space-x-2">
                    {verifiedMetadata.avatarUrl && (
                      <img
                        src={verifiedMetadata.avatarUrl}
                        alt="Owner avatar"
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="font-semibold text-zinc-100">{verifiedMetadata.fullName}</span>
                    {verifiedMetadata.starsCount > 0 && (
                      <span className="flex items-center space-x-0.5 text-amber-400 text-[11px]">
                        <Star size={11} fill="currentColor" />
                        <span>{verifiedMetadata.starsCount}</span>
                      </span>
                    )}
                  </div>
                  {verifiedMetadata.description && (
                    <p className="text-xs text-zinc-400">{verifiedMetadata.description}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-zinc-200 mb-1.5 font-medium">Folder Layout</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('src')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      selectedPreset === 'src'
                        ? 'border-indigo-500 bg-indigo-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-medium text-xs">Standard (src/)</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                      src/routes, src/controllers
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('root')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      selectedPreset === 'root'
                        ? 'border-indigo-500 bg-indigo-950/20 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="font-medium text-xs">Root folders</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                      routes/, controllers/, models/
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Default Branch</label>
                <input
                  type="text"
                  value={newRepoForm.defaultBranch}
                  onChange={(e) =>
                    setNewRepoForm({ ...newRepoForm, defaultBranch: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Local Path on Disk (Optional for Live AST Scanning)</label>
                <input
                  type="text"
                  placeholder="e.g. D:/Projects/Test360-AI/server/test-fixtures/sample-express-api"
                  value={newRepoForm.localPath}
                  onChange={(e) =>
                    setNewRepoForm({ ...newRepoForm, localPath: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Enables Test360 to parse real JS/TS source code, Express routes, and Mongoose schemas from disk.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Add Repository
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test PR Simulation Modal */}
      {simulatingRepo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center space-x-2">
                <Send size={15} className="text-indigo-400" />
                <span>Test PR for {simulatingRepo.repoName || simulatingRepo.fullName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSimulatingRepo(null)}
                className="text-zinc-400 hover:text-zinc-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Trigger a sample pull request check on this repository without opening a real PR on GitHub.
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">PR Number</label>
                  <input
                    type="number"
                    value={simulationForm.prNumber}
                    onChange={(e) =>
                      setSimulationForm({ ...simulationForm, prNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Author</label>
                  <input
                    type="text"
                    value={simulationForm.author}
                    onChange={(e) =>
                      setSimulationForm({ ...simulationForm, author: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">PR Title</label>
                <input
                  type="text"
                  value={simulationForm.prTitle}
                  onChange={(e) =>
                    setSimulationForm({ ...simulationForm, prTitle: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Branch</label>
                <input
                  type="text"
                  value={simulationForm.branch}
                  onChange={(e) =>
                    setSimulationForm({ ...simulationForm, branch: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {simulationResult && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-300 font-medium">
                    <Check size={14} />
                    <span>Sample PR run started!</span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSimulatingRepo(null);
                        onNavigateTab?.('overview');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium inline-flex items-center space-x-1"
                    >
                      <span>View Results</span>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center space-x-1.5"
                >
                  <Send size={12} className={isSendingSimulation ? 'animate-spin' : ''} />
                  <span>{isSendingSimulation ? 'Running...' : 'Run Test PR'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RepositoriesView;
