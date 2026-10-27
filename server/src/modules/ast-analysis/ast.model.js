import mongoose from 'mongoose';

const { Schema } = mongoose;

const AstCallGraphSchema = new Schema(
  {
    repository: { type: String, required: true, index: true },
    commitSha: { type: String, required: true },
    nodes: [Schema.Types.Mixed],
    edges: [Schema.Types.Mixed],
    layers: [String],
    summary: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const AstCallGraph = mongoose.model('AstCallGraph', AstCallGraphSchema);
