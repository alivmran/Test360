import mongoose from 'mongoose';

const { Schema } = mongoose;

const RepositorySchema = new Schema(
  {
    fullName: { type: String, required: true, unique: true, index: true },
    owner: { type: String, required: true },
    repoName: { type: String, required: true },
    gitUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    language: { type: String, default: 'JavaScript / Node.js' },
    starsCount: { type: Number, default: 0 },
    openPrsCount: { type: Number, default: 1 },
    webhookSecret: {
      type: String,
      default: () => 'whsec_' + Math.random().toString(36).substring(2, 14),
    },
    installationId: { type: String, required: true },
    defaultBranch: { type: String, default: 'main' },
    status: {
      type: String,
      enum: ['connected', 'scanned', 'analyzing'],
      default: 'connected',
    },
    lastScannedAt: { type: Date, default: Date.now },
    conventions: {
      routesDir: { type: String, default: 'src/routes' },
      controllersDir: { type: String, default: 'src/controllers' },
      servicesDir: { type: String, default: 'src/services' },
      modelsDir: { type: String, default: 'src/models' },
    },
    summary: {
      routesCount: { type: Number, default: 4 },
      controllersCount: { type: Number, default: 2 },
      modelsCount: { type: Number, default: 2 },
      servicesCount: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

export const Repository = mongoose.model('Repository', RepositorySchema);

