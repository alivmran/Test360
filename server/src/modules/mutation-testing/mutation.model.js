import mongoose from 'mongoose';

const { Schema } = mongoose;

const MutationReportSchema = new Schema(
  {
    repository: { type: String, required: true },
    prNumber: { type: Number, required: true },
    mutantsSampled: { type: Number, default: 20 },
    mutantsKilled: { type: Number, default: 17 },
    mutantsSurvived: { type: Number, default: 3 },
    killScorePercentage: { type: Number, default: 85.0 },
    mutants: [Schema.Types.Mixed],
    autocannonMetrics: [Schema.Types.Mixed],
  },
  { timestamps: true }
);

export const MutationReport = mongoose.model('MutationReport', MutationReportSchema);
