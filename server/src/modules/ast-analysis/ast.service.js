import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import * as t from '@babel/types';
import { AstCallGraph } from './ast.model.js';

const traverse = traverseModule.default || traverseModule;

export class AstService {
  static async getCallGraph(repository, commitSha) {
    const graph = await AstCallGraph.findOne({ repository });
    if (graph) return graph;

    // Fallback seed graph
    return {
      repository: repository || 'szabist-se/ecommerce-express-api',
      commitSha: commitSha || 'a4f91c28f93e921d',
      layers: ['routes', 'middlewares', 'controllers', 'services', 'models'],
      summary: {
        totalFilesTraversed: 14,
        routesImpacted: 4,
        modifiedFiles: [
          'src/controllers/checkoutController.ts',
          'src/middlewares/validateOrder.ts',
        ],
        blastRadiusFiles: [
          'src/routes/orderRoutes.ts',
          'src/services/inventoryService.ts',
          'src/models/Order.ts',
          'src/models/Product.ts',
        ],
      },
    };
  }

  static analyzeFile(filePath, code, isModified = false) {
    const layer = this.determineLayer(filePath);
    const exports = [];
    const imports = [];
    const httpEndpoints = [];
    const mongooseFields = [];
    const processEnvKeys = new Set();

    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          const specifiers = path.node.specifiers.map((spec) => {
            if (t.isImportDefaultSpecifier(spec)) return 'default';
            if (t.isImportSpecifier(spec)) return spec.imported.name || 'spec';
            return '*';
          });
          imports.push({ source, specifiers });
        },

        ExportNamedDeclaration(path) {
          if (path.node.declaration) {
            if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
              exports.push(path.node.declaration.id.name);
            } else if (t.isVariableDeclaration(path.node.declaration)) {
              path.node.declaration.declarations.forEach((decl) => {
                if (t.isIdentifier(decl.id)) exports.push(decl.id.name);
              });
            }
          }
        },

        CallExpression(path) {
          const callee = path.node.callee;
          if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
            const propName = callee.property.name.toLowerCase();
            const verbs = ['get', 'post', 'put', 'delete', 'patch'];
            if (verbs.includes(propName)) {
              const args = path.node.arguments;
              if (args.length >= 2 && t.isStringLiteral(args[0])) {
                const routePath = args[0].value;
                let handlerName = 'anonymousHandler';
                const lastArg = args[args.length - 1];
                if (t.isIdentifier(lastArg)) handlerName = lastArg.name;
                httpEndpoints.push({
                  verb: propName.toUpperCase(),
                  path: routePath,
                  handlerName,
                  extractionMethod: 'Babel AST Visitor',
                });
              }
            }
          }

          if (t.isNewExpression(path.node) && t.isIdentifier(path.node.callee, { name: 'Schema' })) {
            const firstArg = path.node.arguments[0];
            if (t.isObjectExpression(firstArg)) {
              firstArg.properties.forEach((prop) => {
                if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                  mongooseFields.push({ name: prop.key.name, type: 'String' });
                }
              });
            }
          }
        },

        MemberExpression(path) {
          if (
            t.isMemberExpression(path.node.object) &&
            t.isIdentifier(path.node.object.object, { name: 'process' }) &&
            t.isIdentifier(path.node.object.property, { name: 'env' }) &&
            t.isIdentifier(path.node.property)
          ) {
            processEnvKeys.add(path.node.property.name);
          }
        },
      });
    } catch {
      // Regex-Assisted Fallback Scanner
      const routeRegex = /(?:router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi;
      let match;
      while ((match = routeRegex.exec(code)) !== null) {
        httpEndpoints.push({
          verb: match[1].toUpperCase(),
          path: match[2],
          handlerName: 'regexFallbackHandler',
          extractionMethod: 'Regex-Assisted Fallback',
        });
      }
    }

    return {
      filePath,
      layer,
      category: isModified ? 'MODIFIED_IN_PR' : 'SKIPPED',
      exports,
      imports,
      httpEndpoints,
      mongooseFields,
      processEnvKeys: Array.from(processEnvKeys),
    };
  }

  static determineLayer(filePath) {
    if (filePath.includes('/routes/') || filePath.includes('Routes.')) return 'routes';
    if (filePath.includes('/middlewares/') || filePath.includes('Middleware.')) return 'middlewares';
    if (filePath.includes('/controllers/') || filePath.includes('Controller.')) return 'controllers';
    if (filePath.includes('/services/') || filePath.includes('Service.')) return 'services';
    return 'models';
  }
}
