import { AstService } from './ast.service.js';

export class AstController {
  static async getCallGraph(req, res) {
    const { repository, commitSha } = req.params;
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
