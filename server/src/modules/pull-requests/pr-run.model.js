import mongoose from 'mongoose';

const { Schema } = mongoose;

const PullRequestRunSchema = new Schema(
  {
    repository: { type: String, required: true, index: true },
    prNumber: { type: Number, required: true, index: true },
    prTitle: { type: String, required: true },
    branch: { type: String, required: true },
    baseBranch: { type: String, default: 'main' },
    commitSha: { type: String, required: true, index: true },
    author: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['queued', 'running', 'passed', 'failed'], 
      default: 'queued' 
    },
    totalDurationMs: { type: Number, default: 52400 },
    webhookLatencyMs: { type: Number, default: 41 },
    tiers: {
      unit: { passed: Number, total: Number, status: String, duration: String, details: String },
      api: { passed: Number, total: Number, status: String, duration: String, failureMessage: String, details: String },
      uiSmoke: { passed: Number, total: Number, status: String, duration: String, details: String },
      load: { status: String, duration: String, p90: Number, p95: Number, p99: Number, connections: Number, details: String },
    },
    blastRadius: {
      routesImpacted: { type: Number, default: 4 },
      filesTraversed: { type: Number, default: 14 },
      modifiedFiles: [String],
      affectedFiles: [String],
      skippedFiles: [String],
    },
    mutationScore: {
      score: { type: Number, default: 85.0 },
      killed: { type: Number, default: 17 },
      survived: { type: Number, default: 3 },
      sampled: { type: Number, default: 20 },
    },
    latency: {
      p90: { type: Number, default: 38 },
      p95: { type: Number, default: 61 },
      p99: { type: Number, default: 112 },
    },
    isolatedDefect: {
      file: String,
      line: Number,
      errorType: String,
      description: String,
      repairPatch: String,
    },
  },
  { timestamps: true }
);

export const PullRequestRun = mongoose.model('PullRequestRun', PullRequestRunSchema);
