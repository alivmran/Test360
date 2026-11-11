import React from 'react';
import {
  Code2,
  Database,
  Key,
} from 'lucide-react';
import { getLayerLabel } from './AstCustomNode';

export const AstNodeDrawer = ({ selectedNode }) => {
  if (!selectedNode) return null;

  const endpointCount = selectedNode.httpEndpoints?.length || 0;
  const importCount = selectedNode.imports?.length || 0;

  return (
    <aside className="w-96 border-l border-zinc-800 bg-zinc-925 flex flex-col h-full shrink-0 overflow-y-auto">
      {/* Inspector Header */}
      <div className="p-4 border-b border-zinc-800 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 text-[11px] text-zinc-400 mb-1">
            <span>{getLayerLabel(selectedNode.layer)}</span>
            <span>•</span>
            <span>{selectedNode.lineCount || 60} lines</span>
          </div>
          <h3 className="font-mono text-sm font-bold text-zinc-100 break-all">
            {selectedNode.filePath}
          </h3>
        </div>
        <div className="shrink-0 ml-2">
          {selectedNode.category === 'MODIFIED_IN_PR' && (
            <span className="text-[11px] px-2 py-0.5 bg-semantic-rose/20 text-semantic-rose border border-semantic-rose/30 rounded font-medium">
              Changed
            </span>
          )}
          {selectedNode.category === 'IN_BLAST_RADIUS' && (
            <span className="text-[11px] px-2 py-0.5 bg-semantic-amber/20 text-semantic-amber border border-semantic-amber/30 rounded font-medium">
              Affected
            </span>
          )}
          {selectedNode.category === 'SKIPPED' && (
            <span className="text-[11px] px-2 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded">
              Unchanged
            </span>
          )}
        </div>
      </div>

      {/* Inspector Body Details */}
      <div className="p-4 space-y-5 text-xs">
        {/* HTTP Verbs & Route Paths */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-200 text-xs flex items-center space-x-1.5">
              <Code2 size={14} strokeWidth={1.75} className="text-zinc-400" />
              <span>API Endpoints</span>
            </span>
            <span className="text-[11px] text-zinc-500">
              {endpointCount} {endpointCount === 1 ? 'endpoint' : 'endpoints'}
            </span>
          </div>
          {endpointCount > 0 ? (
            <div className="space-y-1.5">
              {selectedNode.httpEndpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        ep.verb === 'POST'
                          ? 'bg-blue-950/40 text-blue-400 border-blue-900/60'
                          : ep.verb === 'GET'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                          : 'bg-rose-950/40 text-rose-400 border-rose-900/60'
                      }`}
                    >
                      {ep.verb}
                    </span>
                    <span className="text-zinc-200 font-mono font-semibold text-[11px]">{ep.path}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pt-0.5">
                    <span>Runs: </span>
                    <span className="font-mono text-zinc-400">{ep.handlerName}()</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-500">
              No API endpoints in this file.
            </div>
          )}
        </div>

        {/* Database Schema Fields */}
        {selectedNode.mongooseSchema && (
          <div>
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="font-semibold text-zinc-200 text-xs flex items-center space-x-1.5">
                <Database size={14} strokeWidth={1.75} className="text-zinc-400" />
                <span>Database Fields</span>
              </span>
              <span className="text-[11px] text-semantic-emerald font-medium">
                Collection: {selectedNode.mongooseSchema.collection}
              </span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg divide-y divide-zinc-800 text-[11px] font-mono">
              {selectedNode.mongooseSchema.fields?.map((f, idx) => (
                <div key={idx} className="p-2 flex items-center justify-between">
                  <span className="text-zinc-200">{f.name}</span>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    <span className="text-zinc-500">{f.type}</span>
                    {f.required && (
                      <span className="text-semantic-rose text-[9px] font-sans border border-semantic-rose/30 px-1 rounded">
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
            <p className="text-[11px] text-zinc-500 mt-1.5">
              Used to create sample test data automatically.
            </p>
          </div>
        )}

        {/* Detected Environment Variables */}
        <div>
          <div className="flex items-center justify-between text-zinc-400 mb-1.5">
            <span className="font-semibold text-zinc-200 text-xs flex items-center space-x-1.5">
              <Key size={14} strokeWidth={1.75} className="text-zinc-400" />
              <span>Environment Variables</span>
            </span>
          </div>
          {selectedNode.processEnvKeys && selectedNode.processEnvKeys.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedNode.processEnvKeys.map((envKey, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded font-mono text-[11px]"
                >
                  {envKey}
                </span>
              ))}
            </div>
          ) : (
            <div className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-500">
              No environment variables needed.
            </div>
          )}
          <p className="text-[11px] text-zinc-500 mt-1.5">
            Added automatically when running tests.
          </p>
        </div>

        {/* Connected Files */}
        <div>
          <span className="font-semibold text-zinc-200 text-xs block mb-2">
            Connected Files ({importCount})
          </span>
          {importCount > 0 ? (
            <div className="space-y-1.5">
              {selectedNode.imports.map((imp, idx) => {
                const name = typeof imp === 'string' ? imp : imp?.source || 'Unknown file';
                const specifiers =
                  typeof imp === 'object' && Array.isArray(imp?.specifiers) && imp.specifiers.length > 0
                    ? imp.specifiers.join(', ')
                    : '';
                return (
                  <div
                    key={idx}
                    className="p-2 bg-zinc-950 border border-zinc-800/80 rounded-lg text-[11px] font-mono flex items-center justify-between gap-2"
                  >
                    <span className="text-zinc-300 truncate">{name}</span>
                    {specifiers && <span className="text-zinc-500 shrink-0">{specifiers}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-lg text-[11px] text-zinc-500">
              No connected files.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
