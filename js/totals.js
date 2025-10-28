import { state, totalForPersonWeek, totalForProjectWeek } from './state.js';
import { weeksRange } from './weeks.js';


export function refreshTotals(ctx){
const {content, activePersonId, activeProjectId} = ctx;
const weeks = weeksRange(state.weeksStart, state.numWeeks);


// Person view footer
weeks.forEach(day=>{
const el = content.querySelector(`[data-week-total="${day}"]`);
if(el){ const t = totalForPersonWeek(activePersonId, day); el.textContent = t.toFixed(0)+'%'; el.style.color = t>100? '#ff7f88' : '#e7edf7'; }
});


// Project view footer
weeks.forEach(day=>{
const el = content.querySelector(`[data-week-total-project="${day}"]`);
if(el){ const t = totalForProjectWeek(activeProjectId, day); el.textContent = t.toFixed(0)+'%'; el.style.color = t>100? '#ff7f88' : '#e7edf7'; }
});


// Row totals in body
content.querySelectorAll('tr').forEach(tr=>{
const totalCell = tr.querySelector('.total'); if(!totalCell) return;
let sum = 0; tr.querySelectorAll('input').forEach(i=>{ sum += Number(i.value)||0; });
totalCell.textContent = sum.toFixed(0)+'%';
});
}
