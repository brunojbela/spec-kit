import Ajv2020 from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = join(__dirname, '..', 'schemas');

const NAMES = ['prd', 'orchestration', 'security', 'doc-sync', 'project-context', 'agent', 'model-catalog'];

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validators = {};
for (const name of NAMES) {
  const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, `${name}.schema.json`), 'utf8'));
  validators[name] = ajv.compile(schema);
}

export function validate(name, data) {
  const v = validators[name];
  if (!v) throw new Error(`schema desconhecido: ${name} (disponíveis: ${NAMES.join(', ')})`);
  const valid = v(data);
  return { valid, errors: valid ? [] : v.errors.map((e) => `${e.instancePath || '/'} ${e.message}`) };
}

export function validateOrThrow(name, data) {
  const { valid, errors } = validate(name, data);
  if (!valid) throw new Error(`${name}.schema: ${errors.join('; ')}`);
  return data;
}

export const schemaNames = () => [...NAMES];
