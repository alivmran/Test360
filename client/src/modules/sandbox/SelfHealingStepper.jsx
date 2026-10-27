import React, { useState } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react';

export const SelfHealingStepper = ({ steps = [], onNavigateToStage }) => {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <div className="p-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono font-bold text-zinc-100 uppercase tracking-wide flex items-center space-x-1.5">
          <RotateCw size={13} strokeWidth={1.5} className="text-semantic-amber" />
          <span>Closed-Loop Self-Healing Stepper</span>
        </h3>
        <span className="text-[10px] font-mono text-zinc-400">
          2 Iterations Max
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {steps.map((step) => {
          const isSelected = activeStep === step.iteration;
          return (
            <div
              key={step.iteration}
              onClick={() => setActiveStep(step.iteration)}
              className={`p-3 rounded border cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-zinc-900 border-zinc-700'
                  : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  {step.status === 'passed' ? (
                    <CheckCircle2 size={14} className="text-semantic-emerald shrink-0" />
                  ) : step.status === 'repaired' ? (
                    <RotateCw size={14} className="text-semantic-amber shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-semantic-rose shrink-0" />
                  )}
                  <span className="font-bold text-zinc-200 text-xs">{step.title}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                    step.status === 'passed'
                      ? 'bg-semantic-emerald/15 text-semantic-emerald border-semantic-emerald/30'
                      : step.status === 'repaired'
                      ? 'bg-semantic-amber/15 text-semantic-amber border-semantic-amber/30'
                      : 'bg-semantic-rose/15 text-semantic-rose border-semantic-rose/30'
                  }`}
                >
                  {step.status.toUpperCase()}
                </span>
              </div>

              <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                {step.summary}
              </p>

              {step.healingActionTaken && (
                <div className="p-2 bg-zinc-950 rounded border border-zinc-800/80 text-[10px] text-zinc-400 mb-2">
                  <strong className="text-zinc-300">Action: </strong>
                  {step.healingActionTaken}
                </div>
              )}

              {step.isolatedDefect && (
                <div className="p-2.5 bg-semantic-rose/10 rounded border border-semantic-rose/25 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-semantic-rose font-bold">
                    <span>Application Defect Confirmed</span>
                    <span>Line {step.isolatedDefect.line}</span>
                  </div>
                  <p className="text-zinc-300 text-[10px] leading-relaxed">
                    {step.isolatedDefect.description}
                  </p>
                  <div className="pt-1.5 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToStage('diagnostics-fix');
                      }}
                      className="text-[10px] font-bold text-semantic-rose hover:underline flex items-center space-x-1"
                    >
                      <span>Open Monaco 1-Click Fix &rarr;</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
