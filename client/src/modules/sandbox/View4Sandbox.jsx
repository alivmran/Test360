import React from 'react';
import { Box, Download } from 'lucide-react';
import { HardenedTelemetry } from './HardenedTelemetry';
import { SelfHealingStepper } from './SelfHealingStepper';
import { LiveTerminalStream } from './LiveTerminalStream';

export const View4Sandbox = ({
  logs = [],
  selfHealingSteps = [],
  telemetry = {},
  onNavigateToStage,
}) => {
  const handleDownloadLogs = () => {
    const raw = (logs || []).map((l) => `[${l.timestamp}] [${l.stream}] ${l.message}`).join('\n');
    const blob = new Blob([raw], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test360-sandbox-audit-pr48.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Top Banner */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-wider flex items-center space-x-1.5">
            <Box size={13} strokeWidth={1.5} className="text-zinc-400" />
            <span>Stages 5 &amp; 6: Hardened Docker Sandbox &amp; Self-Healing Diagnostics</span>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">
            Unprivileged container &bull; Ephemeral MongoDB &bull; Closed-loop stderr feedback
          </span>
        </div>

        <button
          onClick={handleDownloadLogs}
          className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center space-x-1.5 transition-colors"
        >
          <Download size={13} strokeWidth={1.5} />
          <span>Download Audit Log</span>
        </button>
      </div>

      {/* Main Split: Left (Telemetry + Stepper) / Right (Terminal) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-5/12 border-r border-zinc-800 bg-zinc-925 flex flex-col h-full overflow-y-auto">
          <HardenedTelemetry telemetry={telemetry} />
          <SelfHealingStepper steps={selfHealingSteps} onNavigateToStage={onNavigateToStage} />
        </div>
        <LiveTerminalStream logs={logs} />
      </div>
    </div>
  );
};
