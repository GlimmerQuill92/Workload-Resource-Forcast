import { state, getAllocation, setAllocation, updateProject } from '../state.js';
<thead>${head}</thead>
<tbody>${rows}</tbody>
<tfoot>
<tr>
<th class="sticky-col" style="left:0">Week Total %</th>
<th class="sticky-col-2" style="left:180px">(All rows)</th>
${weeks.map(d=>`<th class="num" data-week-total="${d}"></th>`).join('')}
<th></th>
</tr>
</tfoot>
</table>
</div>
<div class="divider"></div>
<div class="cards">
${state.projects.map(pr=>projectCard(pr)).join('')}
</div>
`;


// Wire up events
content.addEventListener('click', e=>{
const btn = e.target.closest('[data-person-tab]');
if(btn){ ctx.activePersonId = btn.getAttribute('data-person-tab'); ctx.activateView('personal'); }
});
content.addEventListener('change', e=>{
const el = e.target.closest('input[data-alloc]');
if(el){ const [pid, proj, day] = el.getAttribute('data-alloc').split('|'); setAllocation(pid, proj, day, el.value); refreshTotals(ctx); }
});


refreshTotals(ctx);
}


function projectCard(pr){
const cls = pr.status==='Live'?'ok':(pr.status?.includes('Hold')?'hold':'risk');
return `<div class="card">
<div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
<div>
<div style="font-weight:600">${pr.opId} — ${pr.title}</div>
<div class="status ${cls}"><i></i><span class="muted">${pr.status||'-'}</span></div>
</div>
<button class="btn" data-edit-project="${pr.id}">Edit</button>
</div>
<div class="divider"></div>
<div class="help">Dates</div>
<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px">
<label>Next Submission <input class="input" value="${pr.dates?.nextSubmission||''}" data-prop="${pr.id}|dates.nextSubmission"></label>
<label>AWARD <input class="input" value="${pr.dates?.award||''}" data-prop="${pr.id}|dates.award"></label>
<label>Booking <input class="input" value="${pr.dates?.booking||''}" data-prop="${pr.id}|dates.booking"></label>
<label>Next Deadline Date <input class="input" value="${pr.nextDeadline||''}" data-prop="${pr.id}|nextDeadline"></label>
<label>What is the deadline for? <input class="input" value="${pr.deadlineFor||''}" data-prop="${pr.id}|deadlineFor"></label>
</div>
<div class="divider"></div>
<div class="help">Notes</div>
<textarea class="input" data-prop="${pr.id}|notes">${pr.notes||''}</textarea>
<div class="divider"></div>
<div class="help">Concerns to escalate to Olivier</div>
<textarea class="input" data-prop="${pr.id}|concerns">${pr.concerns||''}</textarea>
</div>`
}


// Handle inline edits for card fields
export function wirePersonalCards(content){
content.addEventListener('input', e=>{
const prop = e.target.getAttribute('data-prop'); if(!prop) return;
const [id, path] = prop.split('|');
const patch = path.split('.').reverse().reduce((acc,key,i,arr)=> i===0 ? {[key]:e.target.value} : {[key]:acc},{});
updateProject(id, patch);
});
content.addEventListener('click', e=>{
const btn = e.target.closest('[data-edit-project]');
if(!btn) return;
const id = btn.getAttribute('data-edit-project');
const pr = state.projects.find(p=>p.id===id); if(!pr) return;
const title = prompt('Project title', pr.title); if(title===null) return;
const opId = prompt('OpId', pr.opId) ?? pr.opId;
const division = prompt('Division', pr.division) ?? pr.division;
const country = prompt('Country', pr.country) ?? pr.country;
const status = prompt('Status (Live/On Hold/Won not Booked/At Risk/Closed)', pr.status) ?? pr.status;
updateProject(id,{title, opId, division, country, status});
});
}
