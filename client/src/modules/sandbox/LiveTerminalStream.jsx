import React, { useState } from 'react';
import { Terminal, Search } from 'lucide-react';

export const LiveTerminalStream = ({ logs = [] }) => {
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = (logs || []).filter((log) => {
    if (streamFilter === 'STDOUT' && log.stream !== 'STDOUT') return false;
    if (streamFilter === 'STDERR' && log.stream !== 'STDERR') return false;
    if (searchTerm && !log.message?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full lg:w-7/12 bg-zinc-950 flex flex-col h-full overflow-hidden">
      {/* Controls Bar */}
      <div className="p-2.5 border-b border-zinc-800 bg-zinc-925 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700"></div>
          </div>
          <span className="font-mono text-xs text-zinc-400 font-semibold flex items-center space-x-1.5">
            <Terminal size={13} strokeWidth={1.5} className="text-zinc-500" />
            <span>Docker Sandbox Stream: /dev/pts/0</span>
          </span>
        </div>

        {/* Search & Demux Filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search size={12} className="absolute left-2 top-2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono rounded pl-6 pr-2 py-1 w-36 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div className="flex items-center space-x-1 text-[10px] font-mono bg-zinc-900 border border-zinc-800 p-0.5 rounded">
            <button
              onClick={() => setStreamFilter('ALL')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamFilter === 'ALL' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStreamFilter('STDOUT')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamFilter === 'STDOUT' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-500'
              }`}
            >
              Stdout
            </button>
            <button
              onClick={() => setStreamFilter('STDERR')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                streamFilter === 'STDERR' ? 'bg-semantic-rose/20 text-semantic-rose font-semibold' : 'text-zinc-500'
              }`}
            >
              Stderr
            </button>
          </div>
        </div>
      </div>

      {/* Screen */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs bg-zinc-950 space-y-1 select-text">
        {filteredLogs.map((log) => {
          const isStderr = log.stream === 'STDERR';
          const isSystem = log.stream === 'SYSTEM';
          return (
            <div
              key={log.id}
              className={`flex items-start space-x-2.5 py-0.5 rounded px-1 transition-colors ${
                isStderr
                  ? 'bg-semantic-rose/10 text-semantic-rose'
                  : isSystem
                  ? 'text-zinc-500'
                  : 'text-zinc-300 hover:bg-zinc-900/40'
              }`}
            >
              <span className="text-zinc-600 select-none text-[10px] shrink-0 w-20">
                {log.timestamp}
              </span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded border shrink-0 select-none ${
                  isStderr
                    ? 'bg-semantic-rose/20 text-semantic-rose border-semantic-rose/30 font-bold'
                    : isSystem
                    ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
              >
                {log.stream}
              </span>
              <span className="break-all whitespace-pre-wrap leading-relaxed text-[11px]">
                {log.message}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-zinc-800 bg-zinc-925 flex items-center justify-between text-[10px] font-mono text-zinc-500 shrink-0">
        <span className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-semantic-emerald"></span>
          <span>Container Session Terminated with Exit Code 1</span>
        </span>
        <span>{filteredLogs.length} Telemetry Frames Streamed from MongoDB</span>
      </div>
    </div>
  );
};
