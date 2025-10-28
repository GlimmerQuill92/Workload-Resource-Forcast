export const qs = (sel, root=document)=>root.querySelector(sel);
export const qsa = (sel, root=document)=>Array.from(root.querySelectorAll(sel));
export function chip(s){ return `<span class="pill">${s||'-'}</span>` }
