// js/storage.js
import { state, notify, renderFooter } from './state.js';

const KEY = 'my_html_game_state_v1';

// Load saved state
try {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
  }
} catch(e) {
  console.warn('Save load failed', e);
}

// Autosave on changes you trigger via this helper
export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch(e) {
    console.warn('Save failed', e);
  }
  renderFooter();
  notify();
}

// Expose simple dev helpers
window.__GAME__ = { state, save };
