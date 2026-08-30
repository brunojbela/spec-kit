import { writeRegistry } from '../registry.js';

// T16/T28 — spec-kit init-projects
export async function run(opts) {
  return writeRegistry(opts.projectsDir, opts.out);
}
