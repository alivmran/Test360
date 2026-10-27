import { AstService } from './ast.service.js';

export class AstController {
  static async getCallGraph(req, res) {
    let repository = req.query.repository;
    if (!repository && req.params.owner && req.params.repo) {
      repository = `${req.params.owner}/${req.params.repo}`;
    } else if (!repository && req.params.repository) {
      repository = decodeURIComponent(req.params.repository);
    }
    const commitSha = req.params.commitSha || req.query.commitSha;
    const graph = await AstService.getCallGraph(repository, commitSha);
    res.json(graph);
  }


  static async analyzeSnippet(req, res) {
    const { filePath, code, isModified } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code snippet required for AST analysis.' });
    }

    const result = AstService.analyzeFile(filePath || 'snippet.js', code, isModified);
    res.json({ analysis: result });
  }
}
