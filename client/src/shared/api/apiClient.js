// Test360 AI Dynamic API Client
// Connects React frontend directly to Express.js + Mongoose backend

const BASE_URL = '/api';

export const apiClient = {
  // Global telemetry and health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  },

  // ==================== AUTHENTICATION & PROFILE ====================
  async register(userData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(credentials) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getProfile(userId) {
    const res = await fetch(`${BASE_URL}/auth/profile/${userId}`);
    if (!res.ok) throw new Error(`Failed to fetch user profile`);
    return res.json();
  },

  async updateProfile(userId, updates) {
    const res = await fetch(`${BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  },

  async listUsers(role) {
    const query = role ? `?role=${role}` : '';
    const res = await fetch(`${BASE_URL}/auth/users${query}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // ==================== REPOSITORY CRUD ====================
  async getRepositories() {
    const res = await fetch(`${BASE_URL}/repositories`);
    if (!res.ok) throw new Error(`Failed to fetch repositories: ${res.statusText}`);
    return res.json();
  },

  async verifyRepository(input) {
    const res = await fetch(`${BASE_URL}/repositories/verify?input=${encodeURIComponent(input)}`);
    if (!res.ok) throw new Error(`Repository verification failed`);
    return res.json();
  },

  async createRepository(repoData) {
    const res = await fetch(`${BASE_URL}/repositories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repoData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create repository');
    return data;
  },

  async updateRepositoryConfig(owner, repo, config) {
    const res = await fetch(`${BASE_URL}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update repository configuration');
    return data;
  },

  async scanRepository(owner, repo) {
    const res = await fetch(`${BASE_URL}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/scan`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to scan repository');
    return data;
  },

  async simulatePrWebhook(payload) {
    const res = await fetch(`${BASE_URL}/repositories/simulate-pr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to simulate PR webhook');
    return data;
  },

  async deleteRepository(owner, repo) {
    const res = await fetch(`${BASE_URL}/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete repository');
    return data;
  },

  // ==================== PR SCORECARD & RUNS ====================
  async getPullRequestRun(repo, prNumber = null) {
    const query = new URLSearchParams();
    if (repo) query.set('repository', repo);
    if (prNumber) query.set('prNumber', prNumber);

    const res = await fetch(`${BASE_URL}/pull-requests/latest?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch PR run for ${repo}: ${res.statusText}`);
    return res.json();
  },

  async getHistoricalRuns(repo) {
    const query = repo ? `?repository=${encodeURIComponent(repo)}` : '';
    const res = await fetch(`${BASE_URL}/pull-requests/history${query}`);
    if (!res.ok) throw new Error(`Failed to fetch historical runs: ${res.statusText}`);
    return res.json();
  },

  // ==================== AST BLAST RADIUS GRAPH ====================
  async getAstCallGraph(repo, commitSha = null) {
    const query = new URLSearchParams();
    if (repo) query.set('repository', repo);
    if (commitSha) query.set('commitSha', commitSha);

    const res = await fetch(`${BASE_URL}/ast/graph?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch AST graph: ${res.statusText}`);
    return res.json();
  },

  // ==================== TEST SYNTHESIS MATRIX ====================
  async getTestSpecMatrix(repo, prNumber = null) {
    const query = new URLSearchParams();
    if (repo) query.set('repository', repo);
    if (prNumber) query.set('prNumber', prNumber);

    const res = await fetch(`${BASE_URL}/test-specs?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch test spec matrix: ${res.statusText}`);
    return res.json();
  },

  async validateTestMatrix(jsonString) {
    const res = await fetch(`${BASE_URL}/test-specs/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonString }),
    });
    return res.json();
  },


  // ==================== SANDBOX TELEMETRY ====================
  async getSandboxTelemetry(repo, prNumber = 48) {
    const encodedRepo = encodeURIComponent(repo);
    const res = await fetch(`${BASE_URL}/sandbox/telemetry?repository=${encodedRepo}&prNumber=${prNumber}`);
    if (!res.ok) throw new Error(`Failed to fetch sandbox telemetry: ${res.statusText}`);
    return res.json();
  },

  async getSandboxLogs() {
    const res = await fetch(`${BASE_URL}/sandbox/logs`);
    if (!res.ok) throw new Error(`Failed to fetch sandbox logs: ${res.statusText}`);
    return res.json();
  },

  // ==================== MUTATIONS & LOAD ====================
  async getMutationReport(repo, prNumber = 48) {
    const encodedRepo = encodeURIComponent(repo);
    const res = await fetch(`${BASE_URL}/mutations/report?repository=${encodedRepo}&prNumber=${prNumber}`);
    if (!res.ok) throw new Error(`Failed to fetch mutation report: ${res.statusText}`);
    return res.json();
  },

  // ==================== DIAGNOSTICS & REPAIR ====================
  async getDefectTriage() {
    const res = await fetch(`${BASE_URL}/diagnostics/triage`);
    if (!res.ok) throw new Error(`Failed to fetch defect triage: ${res.statusText}`);
    return res.json();
  },

  async applyOneClickRepair(payload) {
    const res = await fetch(`${BASE_URL}/diagnostics/apply-repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to apply repair: ${res.statusText}`);
    return res.json();
  },

  // ==================== TRIGGER RE-RUN ====================
  async rerunPipeline(payload) {
    const res = await fetch(`${BASE_URL}/pull-requests/rerun`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to trigger pipeline rerun: ${res.statusText}`);
    return res.json();
  },
};
