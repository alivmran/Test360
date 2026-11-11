import React, { useState, useEffect, useCallback } from 'react';
import { SimplifiedHeader } from './modules/layout/SimplifiedHeader';
import { View1Scorecard } from './modules/scorecard/View1Scorecard';
import { View2AstGraph } from './modules/ast-graph/View2AstGraph';
import { View3TestSpec } from './modules/test-spec/View3TestSpec';
import { RepositoriesView } from './modules/repositories/RepositoriesView';
import { ProfileAuthView } from './modules/profile/ProfileAuthView';
import { LandingPage } from './modules/landing/LandingPage';
import { AuthPage } from './modules/auth/AuthPage';

import { apiClient } from './shared/api/apiClient';
import {
  mockPrScorecard,
  mockAstNodes,
  mockTestCases,
  mockTemplates,
  mockRawJsonMatrix,
  mockHistoricalPrRuns,
} from './shared/data/mockPrRun';

const AUTH_TOKEN_KEY = 'test360_auth_token';

const resolveInitialPublicView = () => {
  const path = window.location.pathname.toLowerCase();
  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  return 'landing';
};

export const App = () => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedRepo, setSelectedRepo] = useState('szabist-se/ecommerce-express-api');
  const [selectedPrNumber, setSelectedPrNumber] = useState(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [openAddRepoNonce, setOpenAddRepoNonce] = useState(0);

  // Authenticated session state
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [publicView, setPublicView] = useState(resolveInitialPublicView);

  // Dynamic MongoDB state
  const [repositories, setRepositories] = useState([]);
  const [prScorecard, setPrScorecard] = useState(mockPrScorecard);
  const [historicalRuns, setHistoricalRuns] = useState(mockHistoricalPrRuns);
  const [astNodes, setAstNodes] = useState(mockAstNodes);
  const [testCases, setTestCases] = useState(mockTestCases);
  const [templates, setTemplates] = useState(mockTemplates);
  const [rawJsonMatrix, setRawJsonMatrix] = useState(mockRawJsonMatrix);

  const navigatePublicView = useCallback((view) => {
    setPublicView(view);
    const targetPath = view === 'landing' ? '/' : `/${view}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Keep public view synchronized with browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setPublicView(resolveInitialPublicView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Restore authenticated session from stored token if present
  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setCurrentUser(null);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const res = await apiClient.getMe(token);
      if (res?.user) {
        setCurrentUser(res.user);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setCurrentUser(null);
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  // 2. Fetch dynamic repositories and PR data from MongoDB
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const repoRes = await apiClient.getRepositories().catch(() => null);
      if (repoRes?.repositories?.length) {
        setRepositories(repoRes.repositories);
        if (!repoRes.repositories.some((r) => r.fullName === selectedRepo)) {
          setSelectedRepo(repoRes.repositories[0].fullName);
        }
      }

      const prRes = await apiClient
        .getPullRequestRun(selectedRepo, selectedPrNumber)
        .catch(() => null);
      if (prRes?.run) {
        setPrScorecard(prRes.run);
      }

      const histRes = await apiClient.getHistoricalRuns(selectedRepo).catch(() => null);
      if (histRes?.historicalRuns?.length) {
        setHistoricalRuns(histRes.historicalRuns);
      }

      const astRes = await apiClient.getAstCallGraph(selectedRepo).catch(() => null);
      if (astRes?.nodes?.length) {
        setAstNodes(astRes.nodes);
      }

      const specRes = await apiClient
        .getTestSpecMatrix(selectedRepo, selectedPrNumber)
        .catch(() => null);
      if (specRes?.testCases?.length) {
        setTestCases(specRes.testCases);
      }
      if (specRes?.templates) {
        setTemplates(specRes.templates);
      }
      if (specRes?.rawJsonMatrix) {
        setRawJsonMatrix(specRes.rawJsonMatrix);
      }
    } catch (err) {
      console.warn('[Test360 AI] API fetch fallback active:', err.message);
    }
  }, [currentUser, selectedRepo, selectedPrNumber]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAuthSuccess = ({ user, token }) => {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    setCurrentUser(user);
    setCurrentTab('overview');
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setCurrentUser(null);
    setCurrentTab('overview');
    navigatePublicView('landing');
  };

  const handleSelectRepo = (repoFullName) => {
    setSelectedRepo(repoFullName);
    setSelectedPrNumber(null);
  };

  const handleOpenAddRepository = useCallback(() => {
    setCurrentTab('repositories');
    setOpenAddRepoNonce((n) => n + 1);
  }, []);

  const handleConsumeAddRepoSignal = useCallback(() => {
    setOpenAddRepoNonce(0);
  }, []);

  // Dynamic Repository CRUD Handlers
  const handleCreateRepo = async (repoData) => {
    const res = await apiClient.createRepository(repoData);
    if (res?.repository) {
      setRepositories((prev) => [res.repository, ...prev]);
      setSelectedRepo(res.repository.fullName);
      setSelectedPrNumber(null);
      await loadData();
    }
    return res;
  };

  const handleUpdateConfig = async (owner, repo, config) => {
    const res = await apiClient.updateRepositoryConfig(owner, repo, config);
    if (res?.repository) {
      setRepositories((prev) =>
        prev.map((r) => (r.fullName === res.repository.fullName ? res.repository : r))
      );
    }
    return res;
  };

  const handleScanRepo = async (owner, repo) => {
    const res = await apiClient.scanRepository(owner, repo);
    await loadData();
    return res;
  };

  const handleSimulatePr = async (payload) => {
    const res = await apiClient.simulatePrWebhook(payload);
    await loadData();
    return res;
  };

  const handleDeleteRepo = async (owner, repo) => {
    const fullName = `${owner}/${repo}`;
    await apiClient.deleteRepository(owner, repo);
    setRepositories((prev) => prev.filter((r) => r.fullName !== fullName));
    if (selectedRepo === fullName && repositories.length > 1) {
      const remaining = repositories.filter((r) => r.fullName !== fullName);
      if (remaining.length > 0) setSelectedRepo(remaining[0].fullName);
    }
  };

  // Dynamic Pipeline Rerun
  const handleRerunPipeline = async () => {
    setIsRerunning(true);
    try {
      await apiClient.rerunPipeline({
        repository: selectedRepo,
        prNumber: prScorecard?.prNumber || 1,
      });
      await loadData();
    } catch (err) {
      console.error('Error re-running pipeline:', err);
    } finally {
      setTimeout(() => {
        setIsRerunning(false);
      }, 1000);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen w-screen bg-zinc-950 text-zinc-400 flex items-center justify-center font-mono text-xs">
        Verifying workspace session...
      </div>
    );
  }

  // Unauthenticated Public Flow: Landing Page or Login / Register Page
  if (!currentUser) {
    if (publicView === 'login' || publicView === 'register') {
      return (
        <AuthPage
          initialMode={publicView}
          onBackToLanding={() => navigatePublicView('landing')}
          onAuthSuccess={handleAuthSuccess}
        />
      );
    }

    return <LandingPage onNavigateAuth={navigatePublicView} />;
  }

  // Authenticated Workspace Dashboard
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-50 font-sans">
      <SimplifiedHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedRepo={selectedRepo}
        onSelectRepo={handleSelectRepo}
        onAddRepository={handleOpenAddRepository}
        repositories={repositories}
        currentUser={currentUser}
        onRerunPipeline={handleRerunPipeline}
        isRerunning={isRerunning}
        activePr={prScorecard}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 overflow-y-auto bg-zinc-950">
        {currentTab === 'overview' && (
          <View1Scorecard
            scorecard={prScorecard}
            historicalRuns={historicalRuns}
            selectedPrNumber={selectedPrNumber}
            onSelectPrNumber={setSelectedPrNumber}
            onNavigateToStage={setCurrentTab}
            onRerunPipeline={handleRerunPipeline}
            isRerunning={isRerunning}
          />
        )}

        {currentTab === 'ast-graph' && <View2AstGraph nodesData={astNodes} />}

        {currentTab === 'test-spec' && (
          <View3TestSpec
            testCases={testCases}
            templates={templates}
            rawJsonMatrix={rawJsonMatrix}
          />
        )}

        {currentTab === 'repositories' && (
          <RepositoriesView
            repositories={repositories}
            selectedRepo={selectedRepo}
            onSelectRepo={setSelectedRepo}
            onCreateRepo={handleCreateRepo}
            onUpdateConfig={handleUpdateConfig}
            onDeleteRepo={handleDeleteRepo}
            onScanRepo={handleScanRepo}
            onSimulatePr={handleSimulatePr}
            onNavigateTab={setCurrentTab}
            openAddModalSignal={openAddRepoNonce}
            onConsumeAddModalSignal={handleConsumeAddRepoSignal}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileAuthView
            currentUser={currentUser}
            onUserChange={setCurrentUser}
            onSignOut={handleSignOut}
          />
        )}
      </main>
    </div>
  );
};

export default App;
