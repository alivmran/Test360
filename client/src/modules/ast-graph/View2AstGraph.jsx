import React, { useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';
import { AstCustomNode } from './AstCustomNode';
import { AstNodeDrawer } from './AstNodeDrawer';

const nodeTypes = {
  astNode: AstCustomNode,
};

export const View2AstGraph = ({ nodesData = [] }) => {
  const [selectedNodeId, setSelectedNodeId] = useState('controllers-checkoutController');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const selectedNode = useMemo(() => {
    return (nodesData || []).find((n) => n.id === selectedNodeId) || nodesData?.[0] || null;
  }, [selectedNodeId, nodesData]);

  const modifiedCount = useMemo(() => {
    return (nodesData || []).filter((n) => n.category === 'MODIFIED_IN_PR').length;
  }, [nodesData]);

  const blastCount = useMemo(() => {
    return (nodesData || []).filter((n) => n.category === 'IN_BLAST_RADIUS').length;
  }, [nodesData]);

  // Define Flow Nodes dynamically based on layers
  const initialNodes = useMemo(() => {
    const layerPositions = {
      routes: { x: 40, yStart: 50, yStep: 140 },
      middlewares: { x: 300, yStart: 100, yStep: 140 },
      controllers: { x: 560, yStart: 50, yStep: 140 },
      services: { x: 820, yStart: 70, yStep: 140 },
      models: { x: 1080, yStart: 40, yStep: 130 },
    };

    const counters = {
      routes: 0,
      middlewares: 0,
      controllers: 0,
      services: 0,
      models: 0,
    };

    const filtered = (nodesData || []).filter((node) => {
      if (filterCategory === 'MODIFIED') return node.category === 'MODIFIED_IN_PR';
      if (filterCategory === 'BLAST') return node.category === 'IN_BLAST_RADIUS';
      return true;
    });

    return filtered.map((node) => {
      const posConfig = layerPositions[node.layer] || { x: 200, yStart: 50, yStep: 100 };
      const yIndex = counters[node.layer] || 0;
      counters[node.layer] = yIndex + 1;
      const y = posConfig.yStart + yIndex * posConfig.yStep;

      return {
        id: node.id,
        type: 'astNode',
        position: { x: posConfig.x, y },
        data: node,
        selected: node.id === selectedNodeId,
      };
    });
  }, [nodesData, selectedNodeId, filterCategory]);

  // Directed Dependency Call Edges
  const initialEdges = useMemo(() => {
    return [
      {
        id: 'e1',
        source: 'routes-orderRoutes',
        target: 'middlewares-validateOrder',
        animated: true,
        style: { stroke: '#F59E0B', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
      },
      {
        id: 'e2',
        source: 'middlewares-validateOrder',
        target: 'controllers-checkoutController',
        animated: true,
        style: { stroke: '#F43F5E', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F43F5E' },
      },
      {
        id: 'e3',
        source: 'controllers-checkoutController',
        target: 'services-inventoryService',
        animated: true,
        style: { stroke: '#F59E0B', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
      },
      {
        id: 'e4',
        source: 'controllers-checkoutController',
        target: 'models-Order',
        animated: true,
        style: { stroke: '#F59E0B', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
      },
      {
        id: 'e5',
        source: 'services-inventoryService',
        target: 'models-Product',
        animated: true,
        style: { stroke: '#F59E0B', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' },
      },
      {
        id: 'e6',
        source: 'routes-userRoutes',
        target: 'controllers-profileController',
        style: { stroke: '#3F3F46', strokeWidth: 1.2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3F3F46' },
      },
      {
        id: 'e7',
        source: 'controllers-profileController',
        target: 'models-User',
        style: { stroke: '#3F3F46', strokeWidth: 1.2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3F3F46' },
      },
    ];
  }, []);

  const onNodeClick = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Filter & Legend Bar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Network size={13} strokeWidth={1.5} className="text-zinc-400" />
            <span>AST Call Graph</span>
          </span>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                filterCategory === 'ALL'
                  ? 'bg-zinc-800 text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              All Nodes ({nodesData?.length || 0})
            </button>
            <button
              onClick={() => setFilterCategory('MODIFIED')}
              className={`px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 transition-colors ${
                filterCategory === 'MODIFIED'
                  ? 'bg-semantic-rose/20 text-semantic-rose font-semibold border border-semantic-rose/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-rose"></span>
              <span>Modified ({modifiedCount})</span>
            </button>
            <button
              onClick={() => setFilterCategory('BLAST')}
              className={`px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 transition-colors ${
                filterCategory === 'BLAST'
                  ? 'bg-semantic-amber/20 text-semantic-amber font-semibold border border-semantic-amber/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-semantic-amber"></span>
              <span>In Blast Radius ({blastCount})</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center space-x-4 text-[10px] font-mono text-zinc-500">
          <span className="text-zinc-400">Layer Flow:</span>
          <span>1. routes/</span>
          <span>&rarr;</span>
          <span>2. middlewares/</span>
          <span>&rarr;</span>
          <span>3. controllers/</span>
          <span>&rarr;</span>
          <span>4. services/</span>
          <span>&rarr;</span>
          <span>5. models/</span>
        </div>
      </div>

      {/* Main Workspace: Graph Canvas + AST Node Inspector Drawer */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative bg-zinc-950">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.5}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#27272A" gap={20} size={1} />
            <Controls showInteractive={false} position="bottom-left" />
          </ReactFlow>

          <div className="absolute top-3 left-3 bg-zinc-900/90 border border-zinc-800 p-2.5 rounded text-[11px] font-mono text-zinc-400 max-w-xs pointer-events-none select-none">
            <p className="font-semibold text-zinc-200 mb-1">AST Blast-Radius Propagation</p>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Nodes traversed using <code className="text-zinc-400">@babel/parser</code> &amp; <code className="text-zinc-400">@babel/traverse</code> across Express Router registrations and Mongoose models stored in MongoDB.
            </p>
          </div>
        </div>

        {/* AST Node Inspector Drawer */}
        {selectedNode && <AstNodeDrawer selectedNode={selectedNode} />}
      </div>
    </div>
  );
};
