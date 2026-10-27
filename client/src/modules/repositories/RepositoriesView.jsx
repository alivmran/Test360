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
  ExternalLink 
} from 'lucide-react';

export const RepositoriesView = ({
  repositories = [],
  selectedRepo,
  onSelectRepo,
  onCreateRepo,
  onUpdateConfig,
  onDeleteRepo,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRepo, setEditingRepo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form state for creating a new repository
  const [newRepoForm, setNewRepoForm] = useState({
    fullName: '',
    defaultBranch: 'main',
    installationId: '',
    routesDir: 'src/routes',
    controllersDir: 'src/controllers',
    servicesDir: 'src/services',
    modelsDir: 'src/models',
  });

  // Form state for editing convention directories
  const [editForm, setEditForm] = useState({
    routesDir: '',
    controllersDir: '',
    servicesDir: '',
    modelsDir: '',
    defaultBranch: '',
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newRepoForm.fullName.trim() || !newRepoForm.fullName.includes('/')) {
      setErrorMsg('Please enter a valid repository in format "owner/repo" (e.g. myorg/express-api)');
      return;
    }

    try {
      await onCreateRepo({
        fullName: newRepoForm.fullName.trim(),
        defaultBranch: newRepoForm.defaultBranch.trim() || 'main',
        installationId: newRepoForm.installationId.trim() || String(Math.floor(1000000 + Math.random() * 9000000)),
        conventions: {
          routesDir: newRepoForm.routesDir.trim(),
          controllersDir: newRepoForm.controllersDir.trim(),
          servicesDir: newRepoForm.servicesDir.trim(),
          modelsDir: newRepoForm.modelsDir.trim(),
        },
      });

      setSuccessMsg(`Repository "${newRepoForm.fullName}" registered successfully.`);
      setShowAddModal(false);
      setNewRepoForm({
        fullName: '',
        defaultBranch: 'main',
        installationId: '',
        routesDir: 'src/routes',
        controllersDir: 'src/controllers',
        servicesDir: 'src/services',
        modelsDir: 'src/models',
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create repository');
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
      setSuccessMsg(`Conventions updated for ${fullName}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update configuration');
    }
  };

  const handleDelete = async (fullName) => {
    if (!window.confirm(`Are you sure you want to disconnect repository "${fullName}"?`)) {
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
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
            <FolderGit2 size={14} className="text-zinc-400" />
            <span>Repository Management (CRUD)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Connected Repositories
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure target Express.js repositories, directory conventions, and branch analysis triggers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Add Repository</span>
        </button>
      </div>

      {/* Status Messages */}
      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-200 flex items-center space-x-2">
          <AlertCircle size={15} className="text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-200 flex items-center space-x-2">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Repositories Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {repositories.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <FolderGit2 size={36} className="mx-auto text-zinc-600 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No repositories registered</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Add your first Express.js / Node.js repository to start autonomous AST analysis and test synthesis.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition-colors"
            >
              Register New Repository
            </button>
          </div>
        ) : (
          repositories.map((repo) => {
            const isSelected = repo.fullName === selectedRepo;
            const isEditing = editingRepo === repo.fullName;

            return (
              <div
                key={repo.fullName}
                className={`p-5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-indigo-500/50 bg-indigo-950/10 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-lg bg-zinc-800/70 text-zinc-300 shrink-0 mt-0.5">
                      <FolderGit2 size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-zinc-100 text-base">{repo.fullName}</span>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-full font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1 font-mono">
                        <span className="flex items-center space-x-1">
                          <GitBranch size={12} className="text-zinc-500" />
                          <span>{repo.defaultBranch || 'main'}</span>
                        </span>
                        <span>&bull;</span>
                        <span>App ID: {repo.installationId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    {!isSelected && (
                      <button
                        onClick={() => onSelectRepo(repo.fullName)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-md transition-colors"
                      >
                        Select Active
                      </button>
                    )}
                    <button
                      onClick={() => (isEditing ? setEditingRepo(null) : startEditing(repo))}
                      className="px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs rounded-md transition-colors flex items-center space-x-1.5"
                    >
                      <Settings size={13} />
                      <span>{isEditing ? 'Cancel' : 'Conventions'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(repo.fullName)}
                      className="p-1.5 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 rounded-md transition-colors"
                      title="Disconnect repository"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Directory Conventions Drawer / View */}
                {isEditing ? (
                  <div className="pt-4 space-y-3 bg-zinc-950/40 -mx-5 -mb-5 p-5 rounded-b-xl border-t border-zinc-800">
                    <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider font-mono">
                      Edit AST Scan Conventions
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1">Routes Directory</label>
                        <input
                          type="text"
                          value={editForm.routesDir}
                          onChange={(e) => setEditForm({ ...editForm, routesDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1">Controllers Directory</label>
                        <input
                          type="text"
                          value={editForm.controllersDir}
                          onChange={(e) => setEditForm({ ...editForm, controllersDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1">Services Directory</label>
                        <input
                          type="text"
                          value={editForm.servicesDir}
                          onChange={(e) => setEditForm({ ...editForm, servicesDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[11px] mb-1">Models Directory</label>
                        <input
                          type="text"
                          value={editForm.modelsDir}
                          onChange={(e) => setEditForm({ ...editForm, modelsDir: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setEditingRepo(null)}
                        className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(repo.fullName)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors font-medium"
                      >
                        Save Conventions
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-zinc-400">
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/60 flex items-center space-x-2">
                      <Folder size={12} className="text-zinc-500 shrink-0" />
                      <span className="truncate">routes: <span className="text-zinc-300">{repo.conventions?.routesDir || 'src/routes'}</span></span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/60 flex items-center space-x-2">
                      <Folder size={12} className="text-zinc-500 shrink-0" />
                      <span className="truncate">controllers: <span className="text-zinc-300">{repo.conventions?.controllersDir || 'src/controllers'}</span></span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/60 flex items-center space-x-2">
                      <Folder size={12} className="text-zinc-500 shrink-0" />
                      <span className="truncate">services: <span className="text-zinc-300">{repo.conventions?.servicesDir || 'src/services'}</span></span>
                    </div>
                    <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800/60 flex items-center space-x-2">
                      <Folder size={12} className="text-zinc-500 shrink-0" />
                      <span className="truncate">models: <span className="text-zinc-300">{repo.conventions?.modelsDir || 'src/models'}</span></span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center space-x-2">
                <Plus size={16} className="text-indigo-400" />
                <span>Connect Express.js Repository</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">
                  Repository Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. facebook/express-starter"
                  value={newRepoForm.fullName}
                  onChange={(e) => setNewRepoForm({ ...newRepoForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1">Default Branch</label>
                  <input
                    type="text"
                    value={newRepoForm.defaultBranch}
                    onChange={(e) => setNewRepoForm({ ...newRepoForm, defaultBranch: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 mb-1">Installation App ID</label>
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
                  Source Code Folder Structure
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">Routes Dir</label>
                    <input
                      type="text"
                      value={newRepoForm.routesDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, routesDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">Controllers Dir</label>
                    <input
                      type="text"
                      value={newRepoForm.controllersDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, controllersDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">Services Dir</label>
                    <input
                      type="text"
                      value={newRepoForm.servicesDir}
                      onChange={(e) => setNewRepoForm({ ...newRepoForm, servicesDir: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-zinc-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-0.5">Models Dir</label>
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
                  className="px-3.5 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Save &amp; Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
