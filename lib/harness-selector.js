import { HARNESS_IDS } from './harnesses/registry.js';

// UI de multi-seleção no terminal: ↑/↓ move, espaço alterna, 'a' todos, Enter confirma.
export function moveCursor(state, delta) {
  const n = state.items.length;
  return { ...state, cursor: (state.cursor + delta + n) % n };
}

export function toggleAt(state, idx = state.cursor) {
  const selected = new Set(state.selected);
  selected.has(idx) ? selected.delete(idx) : selected.add(idx);
  return { ...state, selected: [...selected] };
}

export function toggleAll(state) {
  const all = state.items.length === state.selected.length;
  return { ...state, selected: all ? [] : state.items.map((_, i) => i) };
}

export function render(state) {
  const lines = state.items.map((id, i) => {
    const mark = state.selected.includes(i) ? '[x]' : '[ ]';
    const cur = i === state.cursor ? ' \x1b[7m→\x1b[27m ' : '   ';
    return `${cur}${mark} ${id}`;
  });
  return [
    `${state.message} \x1b[2m(espaço alterna · a todos · enter confirma)\x1b[22m`,
    ...lines,
    state.selected.length ? '' : '\x1b[33mselecione ao menos 1 ou use "a" para todos\x1b[39m',
  ].join('\n');
}

export function selectHarnesses({ message = 'Em quais harnesses instalar o squad?', items = HARNESS_IDS, input = process.stdin, output = process.stdout } = {}) {
  if (!input.isTTY) return Promise.resolve([...items]); // não-interativo: todos (comportamento padrão)
  return new Promise((resolve) => {
    const state = { items, selected: items.map((_, i) => i), cursor: 0, message };
    input.setRawMode(true);
    input.resume();
    const draw = () => {
      output.write(`\x1b[${state.items.length + 2}A\x1b[0J`);
      output.write(render(state) + '\n');
    };
    output.write(render(state) + '\n');
    import('node:readline').then(({ default: readline }) => {
      readline.emitKeypressEvents(input);
      const onKey = (ch, key) => {
        if (key.name === 'up') { Object.assign(state, moveCursor(state, -1)); draw(); }
        else if (key.name === 'down') { Object.assign(state, moveCursor(state, +1)); draw(); }
        else if (key.name === 'space') { Object.assign(state, toggleAt(state)); draw(); }
        else if (ch === 'a' || ch === 'A') { Object.assign(state, toggleAll(state)); draw(); }
        else if (key.name === 'return' || key.name === 'enter') {
          if (!state.selected.length) return;
          input.setRawMode(false);
          input.pause();
          input.removeListener('keypress', onKey);
          resolve(state.selected.map((i) => state.items[i]));
        } else if (key.name === 'c' && key.ctrl) {
          input.setRawMode(false);
          input.removeListener('keypress', onKey);
          process.exit(130);
        }
      };
      input.on('keypress', onKey);
    });
  });
}
