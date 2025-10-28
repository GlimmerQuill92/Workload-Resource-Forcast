export const StoreKey = 'resource-allocator-v1';
export function save(state){ localStorage.setItem(StoreKey, JSON.stringify(state)); }
export function load(){ try{ const s = localStorage.getItem(StoreKey); return s? JSON.parse(s):null; } catch { return null; } }
