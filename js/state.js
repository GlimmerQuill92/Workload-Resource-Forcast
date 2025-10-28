// js/state.js
export const state = {
  player: {
    name: '',
    hp: 10,
    inventory: []
  },
  flags: {}
};

// Tiny render hook for footer in index.html
export function renderFooter() {
  const $name = document.getElementById('playerName');
  const $hp = document.getElementById('playerHP');
  if ($name) $name.textContent = `Name: ${state.player.name || '—'}`;
  if ($hp) $hp.textContent = `HP: ${state.player.hp}`;
}

// Simple event helper to notify screens when state changes (optional)
const listeners = new Set();
export function subscribe(fn){ listeners.add(fn); return () => listeners.delete(fn); }
export function notify(){ for (const fn of listeners) fn(state); }
