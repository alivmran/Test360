import React from 'react';
import { Lock } from 'lucide-react';

export const HardenedTelemetry = ({ telemetry }) => {
  const profile = telemetry?.securityProfile || {};
  const flags = telemetry?.dockerLaunchFlags || [];

  return (
    <div className="p-4 border-b border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wide flex items-center space-x-1.5">
          <Lock size={13} strokeWidth={1.5} className="text-semantic-emerald" />
          <span>Hardened Container Telemetry</span>
        </h2>
        <span className="text-[10px] font-mono text-semantic-emerald bg-semantic-emerald/10 border border-semantic-emerald/20 px-2 py-0.5 rounded font-semibold">
          SECURE SANDBOX
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
          <span className="text-zinc-500 block text-[10px] uppercase">Execution User</span>
          <span className="text-zinc-200 font-bold">{profile.user || 'USER node (1000:1000)'}</span>
          <span className="text-[10px] text-zinc-500 block">Unprivileged isolate</span>
        </div>

        <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
          <span className="text-zinc-500 block text-[10px] uppercase">Linux Capabilities</span>
          <span className="text-semantic-emerald font-bold">--cap-drop=ALL</span>
          <span className="text-[10px] text-zinc-500 block">Zero kernel escalation</span>
        </div>

        <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
          <span className="text-zinc-500 block text-[10px] uppercase">Resource Limits</span>
          <span className="text-zinc-200 font-bold">{profile.memoryLimit || '1.5GB'} RAM / {profile.cpuLimit || '1.0'} CPU</span>
          <span className="text-[10px] text-zinc-500 block">--disable-dev-shm-usage</span>
        </div>

        <div className="p-2 bg-zinc-950 border border-zinc-800 rounded">
          <span className="text-zinc-500 block text-[10px] uppercase">Network / Storage</span>
          <span className="text-zinc-200 font-bold">{profile.readOnlyRoot ? 'Read-Only Mount' : 'Ephemeral Layer'}</span>
          <span className="text-[10px] text-zinc-500 block">Egress Blocked ({profile.networkMode || 'Loopback'})</span>
        </div>
      </div>

      {/* Injected Ephemeral State */}
      <div className="mt-2.5 p-2 bg-zinc-950 border border-zinc-800 rounded text-[10px] font-mono space-y-1 text-zinc-400">
        <div className="flex items-center justify-between text-zinc-300 font-semibold">
          <span>mongodb-memory-server v7.0</span>
          <span className="text-semantic-emerald">127.0.0.1:44912</span>
        </div>
        <div className="text-zinc-500">
          Injected <code className="text-zinc-400">.env.test</code>: PORT=0, MONGO_URI=mongodb://127.0.0.1:44912/test360
        </div>
      </div>
    </div>
  );
};
