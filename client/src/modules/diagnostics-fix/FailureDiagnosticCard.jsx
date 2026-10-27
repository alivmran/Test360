import React from 'react';

export const FailureDiagnosticCard = ({ defect }) => {
  return (
    <div className="p-4 bg-zinc-925 border-b border-zinc-800 shrink-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[10px] uppercase px-2 py-0.5 bg-semantic-rose/15 text-semantic-rose border border-semantic-rose/30 rounded font-semibold">
              Defect Confirmed
            </span>
            <span className="font-mono text-xs font-bold text-zinc-200">
              {defect?.file || 'src/controllers/checkoutController.ts'}:{defect?.line || 64}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-zinc-100">
            {defect?.errorType || 'Unhandled Negative Quantity Bounds & Inventory Inflation'}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
            <strong>Root Cause:</strong> {defect?.description || 'The checkout controller loop directly executes product.stockCount -= item.quantity without asserting that item.quantity > 0. When fuzzing with boundary value quantity: -1, the subtraction inflates stock count and produces an unhandled Mongoose CastError / 500 error instead of a graceful 400 Bad Request response.'}
          </p>
        </div>

        {/* Stderr Evidence Pill */}
        <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded font-mono text-[10px] text-zinc-400 max-w-sm shrink-0">
          <div className="text-semantic-rose font-semibold mb-1">Captured Stderr Trace:</div>
          <div className="text-zinc-500 truncate">
            AssertionError: expected 400 to equal 500
          </div>
          <div className="text-zinc-500 truncate">
            at checkoutController.ts:64:13
          </div>
        </div>
      </div>
    </div>
  );
};
