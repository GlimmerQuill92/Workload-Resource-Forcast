import { state, totalForPersonWeek } from '../state.js';
import { weeksRange } from '../weeks.js';


export function renderReport(ctx){
const {content} = ctx;
const weeks = weeksRange(state.weeksStart, state.numWeeks);
const totals = state.people.map(p=>({
person:p,
weekly: weeks.map(day=>({day, pct: totalForPersonWeek(p.id, day)}))
}));
const cards = totals.map(t=>{
const over = t.weekly.some(x=>x.pct>100);
return `<div class="card">
<div style="display:flex; justify-content:space-between; align-items:center">
<div>
<div style="font-weight:700">${t.person.name}</div>
<div class="help">${t.person.specialty||''} • ${t.person.division||''} • Lead: ${t.person.leader||''}</div>
</div>
${over?'<span class="pill" style="border-color:#ee5253; color:#ffbaba">Overbooked</span>':''}
</div>
<div class="divider"></div>
<div class="help">Weekly Load %</div>
<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px">
${t.weekly.map(x=>`<div class="pill num" title="${x.day}">${new Date(x.day).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}: ${x.pct}%</div>`).join('')}
</div>
</div>`
}).join('');
content.innerHTML = `<div class="cards">${cards}</div>`;
}
