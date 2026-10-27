import mongoose from 'mongoose';

const { Schema } = mongoose;

const RepositorySchema = new Schema(
  {
    fullName: { type: String, required: true, unique: true, index: true },
    owner: { type: String, required: true },
    repoName: { type: String, required: true },
    installationId: { type: String, required: true },
    defaultBranch: { type: String, default: 'main' },
    conventions: {
      routesDir: { type: String, default: 'src/routes' },
      controllersDir: { type: String, default: 'src/controllers' },
      servicesDir: { type: String, default: 'src/services' },
      modelsDir: { type: String, default: 'src/models' },
    },
  },
  { timestamps: true }
);

export const Repository = mongoose.model('Repository', RepositorySchema);
