import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileCode } from 'lucide-react';

const LAYER_LABELS = {
  routes: 'Route',
  middlewares: 'Middleware',
  controllers: 'Controller',
  services: 'Service',
  models: 'Model',
};

export const getLayerLabel = (layer) => LAYER_LABELS[layer] || layer || 'File';

export const AstCustomNode = ({ data, selected }) => {
  const node = data || {};

  const getBorderColor = () => {
    if (node.category === 'MODIFIED_IN_PR') return 'border-semantic-rose bg-zinc-900';
    if (node.category === 'IN_BLAST_RADIUS') return 'border-semantic-amber bg-zinc-900/90';
    return 'border-zinc-800 bg-zinc-950/80 opacity-60 hover:opacity-100';
  };

  const getBadge = () => {
    if (node.category === 'MODIFIED_IN_PR') {
      return (
        <span className="text-[10px] px-1.5 py-0.5 bg-semantic-rose/15 text-semantic-rose border border-semantic-rose/30 rounded font-medium">
          Changed
        </span>
      );
    }
    if (node.category === 'IN_BLAST_RADIUS') {
      return (
        <span className="text-[10px] px-1.5 py-0.5 bg-semantic-amber/15 text-semantic-amber border border-semantic-amber/30 rounded font-medium">
          Affected
        </span>
      );
    }
    return (
      <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700/60 rounded">
        Unchanged
      </span>
    );
  };

  return (
    <div
      className={`w-56 rounded-lg border p-3 transition-all select-none shadow-none text-left ${getBorderColor()} ${
        selected ? 'ring-1 ring-zinc-400' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-zinc-500 border border-zinc-950" />
      
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-zinc-400 font-medium">
          {getLayerLabel(node.layer)}
        </span>
        {getBadge()}
      </div>

      <div className="font-mono text-xs font-semibold text-zinc-100 truncate flex items-center space-x-1.5">
        <FileCode size={13} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
        <span className="truncate">{node.label}</span>
      </div>

      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{node.lineCount || 60} lines</span>
        {node.httpEndpoints && (
          <span className="text-zinc-300 font-medium">
            {node.httpEndpoints.length} {node.httpEndpoints.length === 1 ? 'Endpoint' : 'Endpoints'}
          </span>
        )}
        {node.mongooseSchema && (
          <span className="text-semantic-emerald font-medium">Database Model</span>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-zinc-500 border border-zinc-950" />
    </div>
  );
};
