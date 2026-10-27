import { RepositoryService } from './repository.service.js';

export class RepositoryController {
  static async list(_req, res) {
    try {
      const repos = await RepositoryService.getAllRepositories();
      res.status(200).json({ repositories: repos });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async get(req, res) {
    try {
      const fullName = req.params.fullName || `${req.params.owner}/${req.params.repo}`;
      const repository = await RepositoryService.getRepositoryByName(fullName);
      if (!repository) {
        return res.status(404).json({ error: `Repository "${fullName}" not found` });
      }
      res.status(200).json({ repository });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async create(req, res) {
    try {
      const newRepo = await RepositoryService.createRepository(req.body);
      res.status(201).json({
        message: 'Repository attached successfully',
        repository: newRepo,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async scan(req, res) {
    try {
      const fullName = `${req.params.owner}/${req.params.repo}`;
      const result = await RepositoryService.scanRepository(fullName);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateConfig(req, res) {
    try {
      const fullName = `${req.params.owner}/${req.params.repo}`;
      const updated = await RepositoryService.updateRepositoryConfig(fullName, req.body);
      res.status(200).json({
        message: 'Configuration saved successfully',
        repository: updated,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async delete(req, res) {
    try {
      const fullName = `${req.params.owner}/${req.params.repo}`;
      const result = await RepositoryService.deleteRepository(fullName);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async verify(req, res) {
    try {
      const input = req.query.input || req.body?.input;
      const metadata = await RepositoryService.verifyGitHubRepo(input);
      res.status(200).json(metadata);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async simulatePr(req, res) {
    try {
      const result = await RepositoryService.simulatePullRequestWebhook(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

