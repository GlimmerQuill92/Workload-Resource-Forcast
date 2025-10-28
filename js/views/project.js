import { state, getAllocation, setAllocation, updateProject } from '../state.js';
import { weeksRange } from '../weeks.js';
import { chip } from '../ui.js';
import { refreshTotals } from '../totals.js';


export function renderProject(ctx){
const {content} = ctx;
const weeks = weeksRange(state.weeksStart, state.numWeeks);
const pr = state.projects.find(p=>p.id===ctx.activeProjectId) || state.projects[0];
if(!pr){ content.innerHTML='<p class="help">Add a project to begin.</p>'; return; }
ctx.activeProjectId = pr.id;


let rows='';
state.people.forEach(person=>{
rows += `<tr>
<td class="sticky-col">${person.name}</td>
<td class="sticky-col-2 muted">${person.specialty||''}</td>
${weeks.map(day=>{
const val = getAllocation(person.id, pr.id, day);
return `<td><input class=\"input num\" style=\"width:64px\" value=\"${val}\" data-alloc=\"${person.id}|${pr.id}|${day}\"></td>`;
}).join('')}
<td class="num total"></td>
</tr>`
});


const head = `<tr>
<th class="sticky-col" style="left:0; min-width:220px">Person</th>
<th class="sticky-col-2" style="left:220px; min-width:220px">Specialty</th>
${weeks.map(d=>`<th class="num">${new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'})}</th>`).join('')}
<th class="num">Row Total %</th>
</tr>`;


content.innerHTML = `
<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px">
<div style="font-weight:700; font-size:18px">${pr.opId} — ${pr.title}</div>
<select class="input" id="projectStatus">
${['Live','On Hold','Won not Booked','At Risk','Closed'].map(s=>`<option ${s===pr.status?'selected':''}>${s}</option>`).join('')}
</select>
<span class="help">${chip(pr.division)} ${chip(pr.country)}</span>
</div>
<div class="grid">
<table>
<thead>${head}</thead>
<tbody>${rows}</tbody>
<tfoot>
<tr>
<th class="sticky-col" style="left:0">Week Total %</th>
<th class="sticky-col-2" style="left:220px">(All people)</th>
${weeks.map(d=>`<th class="num" data-week-total-project="${d}"></th>`).join('')}
<th></th>
</tr>
</tfoot>
</table>
</div>
`;


// Events
content.addEventListener('change', e=>{
const el = e.target.closest('input[data-alloc]');
if(el){ const [pid, proj, day] = el.getAttribute('data-alloc').split('|'); setAllocation(pid, proj, day, el.value); refreshTotals(ctx); return; }
if(e.target.id==='projectStatus'){ updateProject(pr.id, {status: e.target.value}); }
});


refreshTotals(ctx);
}
