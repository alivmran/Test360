// Pipeline stages and actor roles for Test360 AI
export const PIPELINE_STAGES = [
  'overview',
  'ast-graph',
  'test-spec',
  'sandbox',
  'mutation-load',
  'diagnostics-fix',
];

export const ACTOR_ROLES = ['developer', 'reviewer', 'admin'];

export const BLAST_RADIUS_CATEGORIES = {
  MODIFIED_IN_PR: 'MODIFIED_IN_PR',
  IN_BLAST_RADIUS: 'IN_BLAST_RADIUS',
  SKIPPED: 'SKIPPED',
};
