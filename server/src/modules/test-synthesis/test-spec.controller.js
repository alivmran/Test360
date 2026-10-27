import { TestSpecService } from './test-spec.service.js';
import { TemplateCompilerService } from './template-compiler.service.js';

export class TestSpecController {
  static async getSpecMatrix(req, res) {
    const prNumber = req.params.prNumber
      ? parseInt(req.params.prNumber, 10)
      : req.query.prNumber
      ? parseInt(req.query.prNumber, 10)
      : null;
    const commitSha = req.params.commitSha || req.query.commitSha || 'a4f91c28f93e921d';
    let repository = req.query.repository;
    if (!repository && req.params.owner && req.params.repo) {
      repository = `${req.params.owner}/${req.params.repo}`;
    }
    const result = await TestSpecService.synthesizeMatrix(prNumber, commitSha, repository);
    const templates = result.templates || TemplateCompilerService.compileTemplates(result.matrix);

    res.json({
      matrix: result.matrix,
      testCases: result.testCases,
      rawJsonMatrix: result.rawJsonMatrix,
      templates,
    });
  }


  static async validateJson(req, res) {
    const { jsonString } = req.body;
    const result = TestSpecService.validateMatrix(jsonString);

    if (!result.success) {
      return res.status(422).json({
        status: 'invalid',
        error: result.error,
      });
    }

    res.json({
      status: 'valid',
      data: result.data,
    });
  }
}
