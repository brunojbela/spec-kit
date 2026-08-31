import readline from 'node:readline';

export function ask(question, { input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY) return Promise.resolve('');
  const rl = readline.createInterface({ input, output });
  return new Promise((resolve) => rl.question(question, (a) => { rl.close(); resolve(a.trim()); }));
}
