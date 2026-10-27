import React from 'react';
import { 
  RotateCw, 
  Server, 
  Cpu, 
  Database, 
  Clock
} from 'lucide-react';

export const GlobalHeader = ({
  onRerunPipeline,
  isRerunning,
  webhookLatencyMs = 41,
  lastRunDuration = '52.4s',
}) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none overflow-x-auto">
      {/* Monospace Status Telemetry Pills */}
      <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">
        {/* Webhook ACK SLA */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-semantic-emerald"></span>
          <span className="text-zinc-500">Webhook ACK:</span>
          <span className="text-zinc-200 font-medium">{webhookLatencyMs}ms</span>
          <span className="text-[10px] text-zinc-500">(&lt;100ms SLA)</span>
        </div>

        {/* Redis BullMQ */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded">
          <Server size={12} strokeWidth={1.5} className="text-zinc-400" />
          <span className="text-zinc-500">Queue:</span>
          <span className="text-zinc-200">BullMQ (Resilient In-Process & Redis)</span>
          <span className="text-[10px] text-semantic-emerald font-semibold">(Active)</span>
        </div>

        {/* SLM Model */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded">
          <Cpu size={12} strokeWidth={1.5} className="text-zinc-400" />
          <span className="text-zinc-500">SLM:</span>
          <span className="text-zinc-200">Test360-Coder 1.5B</span>
          <span className="text-[10px] text-zinc-500">(QLoRA 4-bit • Ollama)</span>
        </div>

        {/* Docker Sandbox Hardened Status */}
        <div className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-semantic-emerald"></span>
          <span className="text-zinc-500">Sandbox:</span>
          <span className="text-zinc-200">Docker (USER node • --cap-drop=ALL • 1.5GB)</span>
        </div>

        {/* MongoDB Status */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded">
          <Database size={12} strokeWidth={1.5} className="text-zinc-400" />
          <span className="text-zinc-500">DB:</span>
          <span className="text-zinc-200">MongoDB MERN</span>
          <span className="text-[10px] text-semantic-emerald">(Connected)</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3 shrink-0 ml-4">
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 font-mono">
          <Clock size={13} strokeWidth={1.5} className="text-zinc-500" />
          <span>Last Run: {lastRunDuration}</span>
        </div>

        <button
          onClick={onRerunPipeline}
          disabled={isRerunning}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium border transition-colors ${
            isRerunning
              ? 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
              : 'bg-zinc-50 text-zinc-950 hover:bg-zinc-200 border-zinc-200 shadow-sm'
          }`}
        >
          <RotateCw size={13} strokeWidth={1.5} className={isRerunning ? 'animate-spin' : ''} />
          <span>{isRerunning ? 'Synthesizing...' : 'Re-Run Pipeline'}</span>
        </button>
      </div>
    </header>
  );
};
