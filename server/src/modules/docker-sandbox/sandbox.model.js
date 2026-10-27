import mongoose from 'mongoose';

const { Schema } = mongoose;

const SandboxRunSchema = new Schema(
  {
    repository: { type: String, required: true },
    prNumber: { type: Number, required: true },
    containerId: { type: String, default: 'test360-sandbox-pr48-run' },
    exitCode: { type: Number, default: 1 },
    dockerFlags: [String],
    securityProfile: Schema.Types.Mixed,
    selfHealingIterations: [Schema.Types.Mixed],
    logs: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export const SandboxRun = mongoose.model('SandboxRun', SandboxRunSchema);
