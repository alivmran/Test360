import { DockerSandboxService } from './docker-sandbox.service.js';

export class SandboxController {
  static async getTelemetry(req, res) {
    const repository = req.query.repository || 'szabist-se/ecommerce-express-api';
    const prNumber = req.query.prNumber ? Number(req.query.prNumber) : 48;
    const run = await DockerSandboxService.getSandboxRun(repository, prNumber);

    res.json(run);
  }

  static async streamLogs(req, res) {
    const logs = DockerSandboxService.getDefaultLogs();
    res.json({ logs });
  }
}
