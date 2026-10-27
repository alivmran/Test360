import React, { useState, useEffect, useCallback } from 'react';
import { SimplifiedHeader } from './modules/layout/SimplifiedHeader';
import { View1Scorecard } from './modules/scorecard/View1Scorecard';
import { View2AstGraph } from './modules/ast-graph/View2AstGraph';
import { View3TestSpec } from './modules/test-spec/View3TestSpec';
import { RepositoriesView } from './modules/repositories/RepositoriesView';
import { ProfileAuthView } from './modules/profile/ProfileAuthView';

import { apiClient } from './shared/api/apiClient';
import { 
  mockPrScorecard, 
  mockAstNodes, 
  mockTestCases, 
  mockTemplates, 
  mockRawJsonMatrix, 
  mockHistoricalPrRuns, 
  mockDiffCode 
} from './shared/data/mockPrRun';

export const App = () => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [selectedRepo, setSelectedRepo] = useState('szabist-se/ecommerce-express-api');
  const [isRerunning, setIsRerunning] = useState(false);

  // Authenticated user session state (MERN Auth)
  const [currentUser, setCurrentUser] = useState(null);

  // Dynamic MongoDB state
  const [repositories, setRepositories] = useState([]);
  const [prScorecard, setPrScorecard] = useState(mockPrScorecard);
  const [historicalRuns, setHistoricalRuns] = useState(mockHistoricalPrRuns);
  const [astNodes, setAstNodes] = useState(mockAstNodes);
  const [testCases, setTestCases] = useState(mockTestCases);
  const [templates, setTemplates] = useState(mockTemplates);
  const [rawJsonMatrix, setRawJsonMatrix] = useState(mockRawJsonMatrix);

  // 1. Fetch initial user session from MongoDB
  const loadInitialUser = useCallback(async () => {
    try {
      const res = await apiClient.listUsers();
      if (res?.users?.length > 0) {
        setCurrentUser(res.users[0]);
      }
    } catch {
      // Fallback guest user
    }
  }, []);

  // 2. Fetch dynamic repositories and PR data from MongoDB
  const loadData = useCallback(async () => {
    try {
      // Fetch Repositories
      const repoRes = await apiClient.getRepositories().catch(() => null);
      if (repoRes?.repositories?.length) {
        setRepositories(repoRes.repositories);
        // Ensure selected repo is valid
        if (!repoRes.repositories.some((r) => r.fullName === selectedRepo)) {
          setSelectedRepo(repoRes.repositories[0].fullName);
        }
      }

      // Fetch Active PR Run for selected repository
      const prRes = await apiClient.getPullRequestRun(selectedRepo).catch(() => null);
      if (prRes?.run) {
        setPrScorecard(prRes.run);
      }

      // Fetch Historical PR Runs for selected repository
      const histRes = await apiClient.getHistoricalRuns(selectedRepo).catch(() => null);
      if (histRes?.historicalRuns?.length) {
        setHistoricalRuns(histRes.historicalRuns);
      }

      // Fetch AST Call Graph for selected repository
      const astRes = await apiClient.getAstCallGraph(selectedRepo).catch(() => null);
      if (astRes?.nodes?.length) {
        setAstNodes(astRes.nodes);
      }

      // Fetch Test Spec Matrix & Templates for selected repository
      const specRes = await apiClient.getTestSpecMatrix(selectedRepo).catch(() => null);
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
  }, [selectedRepo]);

  useEffect(() => {
    loadInitialUser();
  }, [loadInitialUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic Repository CRUD Handlers
  const handleCreateRepo = async (repoData) => {
    const res = await apiClient.createRepository(repoData);
    if (res?.repository) {
      setRepositories((prev) => [res.repository, ...prev]);
      setSelectedRepo(res.repository.fullName);
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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-50 font-sans">
      {/* Simplified, Clean Top Navigation Header */}
      <SimplifiedHeader
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedRepo={selectedRepo}
        onSelectRepo={setSelectedRepo}
        repositories={repositories}
        currentUser={currentUser}
        onRerunPipeline={handleRerunPipeline}
        isRerunning={isRerunning}
        activePr={prScorecard}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        {currentTab === 'overview' && (
          <View1Scorecard
            scorecard={prScorecard}
            historicalRuns={historicalRuns}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'ast-graph' && (
          <View2AstGraph nodesData={astNodes} />
        )}

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
          />
        )}


        {currentTab === 'profile' && (
          <ProfileAuthView
            currentUser={currentUser}
            onUserChange={setCurrentUser}
          />
        )}
      </main>
    </div>
  );
};

export default App;
