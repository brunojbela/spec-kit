// Mapeia stack → skills especialistas + queries Context7 (docs oficiais por versão).
const STACK_MAP = {
  laravel: { skills: ['laravel', 'phpunit', 'api-contracts'], context7: ['/laravel/docs', '/laravel/framework'] },
  php: { skills: ['laravel', 'phpunit', 'secrets'], context7: ['/php/docs'] },
  react: { skills: ['react', 'ts', 'eslint', 'performance'], context7: ['/react.dev/react'] },
  vue: { skills: ['vue', 'ts', 'eslint', 'performance'], context7: ['/vuejs/vite', '/vuejs/vue'] },
  angular: { skills: ['angular', 'ts', 'eslint', 'design-system'], context7: ['/angular/angular'] },
  python: { skills: ['python', 'api-contracts'], context7: ['/python/docs'] },
  fastapi: { skills: ['python', 'api-contracts'], context7: ['/fastapi/docs'] },
  django: { skills: ['python'], context7: ['/django/django'] },
  tailwind: { skills: ['tailwind', 'design-system', 'ux-ui'], context7: ['/tailwindlabs/tailwindcss'] },
  bootstrap: { skills: ['bootstrap', 'design-system', 'ux-ui'], context7: ['/twbs/bootstrap'] },
  wordpress: { skills: ['wordpress', 'seo', 'performance'], context7: ['/wordpress/docs'] },
  typescript: { skills: ['ts', 'eslint'], context7: ['/microsoft/typescript'] },
};

const CROSS_CUTTING = ['clean-architecture', 'tdd', 'code-review', 'char-tests', 'reverse-pentest', 'pack-security', 'secrets', 'ci-cd', 'semantic-release', 'performance', 'i18n', 'seo', 'design-patterns', 'ux-ui', 'doc-gen', 'orchestration', 'ralph-loop', 'interview', 'requirements', 'strategy', 'media-buying'];

export function knownStacks() {
  return Object.keys(STACK_MAP);
}

export function resolveStack(stack) {
  const normalized = stack.map((s) => s.trim().toLowerCase().replace(/[^a-z]/g, '')).filter(Boolean);
  const skills = new Set(CROSS_CUTTING);
  const context7 = [];
  const matched = [];
  for (const s of normalized) {
    const hit = Object.keys(STACK_MAP).find((k) => s.startsWith(k) || k.startsWith(s));
    if (hit) {
      matched.push(hit);
      STACK_MAP[hit].skills.forEach((sk) => skills.add(sk));
      context7.push(...STACK_MAP[hit].context7);
    } else {
      matched.push(s);
      context7.push(`/${s}/docs`);
    }
  }
  return { stacks: matched, skills: [...skills], context7: [...new Set(context7)] };
}
