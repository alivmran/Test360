import React from 'react';
import { 
  Code2, 
  Database, 
  Key 
} from 'lucide-react';

export const AstNodeDrawer = ({ selectedNode }) => {
  if (!selectedNode) return null;

  return (
    <aside className="w-96 border-l border-zinc-800 bg-zinc-925 flex flex-col h-full shrink-0 overflow-y-auto">
      {/* Inspector Header */}
      <div className="p-4 border-b border-zinc-800 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono uppercase text-zinc-500 mb-1">
            <span>Layer: {selectedNode.layer}</span>
            <span>•</span>
            <span>{selectedNode.lineCount || 60} lines</span>
          </div>
          <h3 className="font-mono text-sm font-bold text-zinc-100 break-all">
            {selectedNode.filePath}
          </h3>
        </div>
        <div className="shrink-0 ml-2">
          {selectedNode.category === 'MODIFIED_IN_PR' && (
            <span className="font-mono text-[10px] px-2 py-0.5 bg-semantic-rose/20 text-semantic-rose border border-semantic-rose/30 rounded font-semibold">
              MODIFIED
            </span>
          )}
          {selectedNode.category === 'IN_BLAST_RADIUS' && (
            <span className="font-mono text-[10px] px-2 py-0.5 bg-semantic-amber/20 text-semantic-amber border border-semantic-amber/30 rounded font-semibold">
              BLAST RADIUS
            </span>
          )}
          {selectedNode.category === 'SKIPPED' && (
            <span className="font-mono text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded">
              SKIPPED
            </span>
          )}
        </div>
      </div>

      {/* Inspector Body Details */}
      <div className="p-4 space-y-5 text-xs font-mono">
        {/* HTTP Verbs & Route Paths */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-200 uppercase text-[11px] flex items-center space-x-1.5">
              <Code2 size={13} strokeWidth={1.5} className="text-zinc-400" />
              <span>Extracted HTTP Routes</span>
            </span>
            <span className="text-[10px] text-zinc-500">
              {selectedNode.httpEndpoints?.length || 0} Endpoints
            </span>
          </div>
          {selectedNode.httpEndpoints && selectedNode.httpEndpoints.length > 0 ? (
            <div className="space-y-1.5">
              {selectedNode.httpEndpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-zinc-950 border border-zinc-800 rounded flex flex-col space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          ep.verb === 'POST'
                            ? 'bg-blue-950/40 text-blue-400 border-blue-900/60'
                            : ep.verb === 'GET'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                            : 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                        }`}
                      >
                        {ep.verb}
                      </span>
                      <span className="text-zinc-200 font-semibold text-[11px]">{ep.path}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                    <span>Handler: {ep.handlerName}()</span>
                    <span
                      className={`px-1 py-0.2 rounded text-[9px] border ${
                        ep.extractionMethod === 'Babel AST Visitor'
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                          : 'bg-amber-950/30 text-amber-400 border-amber-900/40'
                      }`}
                    >
                      {ep.extractionMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded text-[11px] text-zinc-500 italic">
              No direct HTTP route bindings in this module.
            </div>
          )}
        </div>

        {/* Mongoose Schema Fields */}
        {selectedNode.mongooseSchema && (
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="font-semibold text-zinc-200 uppercase text-[11px] flex items-center space-x-1.5">
                <Database size={13} strokeWidth={1.5} className="text-zinc-400" />
                <span>Mongoose Schema Contract</span>
              </span>
              <span className="text-[10px] text-semantic-emerald font-medium">
                Collection: {selectedNode.mongooseSchema.collection}
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded divide-y divide-zinc-800 text-[11px]">
              {selectedNode.mongooseSchema.fields?.map((f, idx) => (
                <div key={idx} className="p-2 flex items-center justify-between">
                  <span className="text-zinc-200">{f.name}</span>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="text-zinc-500">{f.type}</span>
                    {f.required && (
                      <span className="text-semantic-rose text-[9px] border border-semantic-rose/30 px-1 rounded">
                        required
                      </span>
                    )}
                    {f.ref && (
                      <span className="text-zinc-400 text-[9px] bg-zinc-800 px-1 rounded">
                        &rarr; {f.ref}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Used by Test360 to auto-seed <code className="text-zinc-400">mongodb-memory-server</code> fixtures.
            </p>
          </div>
        )}

        {/* Detected process.env Keys */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="font-semibold text-zinc-200 uppercase text-[11px] flex items-center space-x-1.5">
              <Key size={13} strokeWidth={1.5} className="text-zinc-400" />
              <span>Synthesized process.env Keys</span>
            </span>
          </div>
          {selectedNode.processEnvKeys && selectedNode.processEnvKeys.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.processEnvKeys.map((envKey, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded text-[10px]"
                >
                  {envKey}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-2 bg-zinc-950 border border-zinc-800/80 rounded text-[11px] text-zinc-500 italic">
              Zero environment variables referenced.
            </div>
          )}
          <p className="text-[10px] text-zinc-500 mt-1">
            Injected automatically into container <code className="text-zinc-400">.env.test</code> runtime.
          </p>
        </div>

        {/* Resolved Imports */}
        <div>
          <span className="font-semibold text-zinc-200 uppercase text-[11px] block mb-2">
            Multi-File Imports ({selectedNode.imports?.length || 0})
          </span>
          <div className="space-y-1">
            {selectedNode.imports?.map((imp, idx) => (
              <div
                key={idx}
                className="p-1.5 bg-zinc-950 border border-zinc-800/80 rounded text-[10px] flex items-center justify-between"
              >
                <span className="text-zinc-300">{imp.source}</span>
                <span className="text-zinc-500">[{imp.specifiers?.join(', ')}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
