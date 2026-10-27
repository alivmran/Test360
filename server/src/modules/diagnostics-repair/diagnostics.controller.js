import { DiagnosticsService } from './diagnostics.service.js';

export class DiagnosticsController {
  static async getTriage(_req, res) {
    const defect = DiagnosticsService.getDefectDetails();
    res.json({ defect });
  }

  static async approveRepair(req, res) {
    const { repository, prNumber, commitSha, commitMessage, repairedCodePatch } = req.body;

    if (!commitMessage) {
      return res.status(400).json({ error: 'Commit message is required for developer governance.' });
    }

    const result = await DiagnosticsService.applyOneClickRepair({
      repository: repository || 'szabist-se/ecommerce-express-api',
      prNumber: prNumber || 48,
      commitSha: commitSha || 'a4f91c28f93e921d',
      commitMessage,
      repairedCodePatch,
    });

    res.json({
      message: 'Repair successfully committed to PR branch.',
      newCommitSha: result.commitSha,
      status: result.status,
    });
  }
}
