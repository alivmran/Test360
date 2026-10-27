import mongoose from 'mongoose';

const { Schema } = mongoose;

const TestMatrixSchema = new Schema(
  {
    repository: { type: String, required: true },
    prNumber: { type: Number, required: true },
    testCases: [Schema.Types.Mixed],
    rawJsonMatrix: { type: String, required: true },
    compiledTemplates: {
      jestUnit: String,
      supertestApi: String,
      playwrightSmoke: String,
      autocannonLoad: String,
    },
  },
  { timestamps: true }
);

export const TestMatrix = mongoose.model('TestMatrix', TestMatrixSchema);
