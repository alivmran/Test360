import { Repository } from './repository.model.js';

export class RepositoryService {
  /**
   * List all repositories from MongoDB
   */
  static async getAllRepositories() {
    return await Repository.find().sort({ updatedAt: -1 });
  }

  /**
   * Find repository by fullName or ID
   */
  static async getRepositoryByName(fullName) {
    return await Repository.findOne({ fullName });
  }

  /**
   * Create a new repository from user-submitted form data
   */
  static async createRepository({ fullName, owner, repoName, installationId, defaultBranch, conventions }) {
    let resolvedOwner = owner;
    let resolvedRepoName = repoName;
    let resolvedFullName = fullName;

    if (resolvedFullName && (!resolvedOwner || !resolvedRepoName)) {
      const parts = resolvedFullName.split('/');
      if (parts.length === 2) {
        resolvedOwner = parts[0].trim();
        resolvedRepoName = parts[1].trim();
      }
    } else if (resolvedOwner && resolvedRepoName && !resolvedFullName) {
      resolvedFullName = `${resolvedOwner.trim()}/${resolvedRepoName.trim()}`;
    }

    if (!resolvedFullName || !resolvedOwner || !resolvedRepoName) {
      throw new Error('Please provide repository fullName (e.g. owner/repo) or separate owner and repoName.');
    }

    const existing = await Repository.findOne({ fullName: resolvedFullName });
    if (existing) {
      throw new Error(`Repository "${resolvedFullName}" is already registered.`);
    }

    const newRepo = await Repository.create({
      fullName: resolvedFullName,
      owner: resolvedOwner,
      repoName: resolvedRepoName,
      installationId: installationId || String(Math.floor(1000000 + Math.random() * 9000000)),
      defaultBranch: defaultBranch || 'main',
      conventions: {
        routesDir: conventions?.routesDir || 'src/routes',
        controllersDir: conventions?.controllersDir || 'src/controllers',
        servicesDir: conventions?.servicesDir || 'src/services',
        modelsDir: conventions?.modelsDir || 'src/models',
      },
    });

    return newRepo;
  }

  /**
   * Update repository conventions and configuration dynamically
   */
  static async updateRepositoryConfig(fullName, data) {
    const repo = await Repository.findOne({ fullName });
    if (!repo) {
      throw new Error(`Repository "${fullName}" not found.`);
    }

    if (data.conventions) {
      repo.conventions = {
        routesDir: data.conventions.routesDir ?? repo.conventions.routesDir,
        controllersDir: data.conventions.controllersDir ?? repo.conventions.controllersDir,
        servicesDir: data.conventions.servicesDir ?? repo.conventions.servicesDir,
        modelsDir: data.conventions.modelsDir ?? repo.conventions.modelsDir,
      };
    }

    if (data.defaultBranch) repo.defaultBranch = data.defaultBranch;
    if (data.installationId) repo.installationId = data.installationId;

    await repo.save();
    return repo;
  }

  /**
   * Delete repository from MongoDB
   */
  static async deleteRepository(fullName) {
    const result = await Repository.findOneAndDelete({ fullName });
    if (!result) {
      throw new Error(`Repository "${fullName}" not found for deletion.`);
    }
    return { success: true, message: `Repository "${fullName}" disconnected successfully.` };
  }
}
