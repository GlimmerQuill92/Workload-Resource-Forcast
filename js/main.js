import { state, setState, persist, updateProject, updatePerson } from './state.js';


// Top-level actions next to heading
on($('addPeopleGroup'),'click', ()=>{ const name = prompt('New people group name'); if(name) { addPeopleGroup(name); renderSide(); } });
on($('addPersonSidebar'),'click', ()=>{ const group = prompt('Assign to group (leave blank for Unassigned)')||''; const name = prompt('Person name'); if(!name) return; const division = prompt('Division','GSI')||''; const specialty = prompt('Specialty','Tendering')||''; const leader = prompt('People Leader','Olivier Monteil')||''; state.people.push({id:crypto.randomUUID(), name, division, specialty, leader, group: group||'Unassigned'}); persist(); render(); });
}


if(projectsTree){
projectsTree.innerHTML = '';
// Build groups/subs tree
const groups = state.projectGroups || [];
groups.forEach(g=>{
const gWrap = document.createElement('div');
gWrap.innerHTML = `
<div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px">
<strong contenteditable="true" spellcheck="false" data-project-group-name>${g.name}</strong>
<div style="display:flex; gap:6px">
<button class="btn" data-add-sub>＋ Sub</button>
</div>
</div>
<div class="list" data-subtree></div>`;
projectsTree.appendChild(gWrap);


// rename group
const gNameEl = gWrap.querySelector('[data-project-group-name]');
gNameEl.addEventListener('blur', ()=>{ const newName = gNameEl.textContent.trim()||g.name; if(newName!==g.name){ renameProjectGroup(g.name, newName); renderSide(); } });


// add sub
gWrap.querySelector('[data-add-sub]').addEventListener('click', ()=>{ const sub = prompt('New subgroup name'); if(sub){ addProjectSub(g.name, sub); renderSide(); } });


const subtree = gWrap.querySelector('[data-subtree]');
(g.subs||[]).forEach(sub=>{
const sWrap = document.createElement('div');
sWrap.style.marginLeft = '10px';
sWrap.innerHTML = `
<div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px">
<em contenteditable="true" spellcheck="false" data-project-sub-name>${sub}</em>
<div style="display:flex; gap:6px">
<button class="btn" data-add-project>＋ Project</button>
</div>
</div>
<div class="list" data-project-list></div>`;
subtree.appendChild(sWrap);


// rename sub
const sNameEl = sWrap.querySelector('[data-project-sub-name]');
sNameEl.addEventListener('blur', ()=>{ const newSub = sNameEl.textContent.trim()||sub; if(newSub!==sub){ renameProjectSub(g.name, sub, newSub); renderSide(); } });


// add project in this subgroup
sWrap.querySelector('[data-add-project]').addEventListener('click', ()=>{
const title = prompt('Project title'); if(!title) return;
const opId = prompt('OpId (e.g., OP10000000)','')||'';
const division = prompt('Division','GSI')||'';
const country = prompt('Country','UK')||'';
state.projects.push({id:crypto.randomUUID(), opId, title, division, country, status:'Live', group:g.name, subgroup:sub, nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}});
persist(); render();
});


// list projects matching group/sub
const list = sWrap.querySelector('[data-project-list]');
state.projects.filter(p=> (p.group||'')===g.name && (p.subgroup||'')===sub ).forEach(pr=>{
const btn = document.createElement('button'); btn.textContent = `${pr.opId} — ${pr.title}`; btn.onclick = ()=>{ ctx.activeProjectId = pr.id; ctx.activateView('projects'); };
if(pr.id===ctx.activeProjectId && ctx.activeView==='projects') btn.classList.add('active');
list.appendChild(btn);
});
});
});


// top level actions
on($('addProjectGroup'),'click', ()=>{ const name = prompt('New project group name'); if(name){ addProjectGroup(name); renderSide(); } });
on($('addProjectSub'),'click', ()=>{ const group = prompt('Add subgroup under which group?'); if(!group) return; const sub = prompt('Subgroup name'); if(!sub) return; addProjectSub(group, sub); renderSide(); });
on($('addProjectSidebar'),'click', ()=>{
const group = prompt('Assign to project group (leave blank to skip)')||'';
const subgroup = group? (prompt('Assign to subgroup (leave blank to skip)')||'') : '';
const title = prompt('Project title'); if(!title) return;
const opId = prompt('OpId (e.g., OP10000000)','')||'';
const division = prompt('Division','GSI')||'';
const country = prompt('Country','UK')||'';
state.projects.push({id:crypto.randomUUID(), opId, title, division, country, status:'Live', group: group||'', subgroup: subgroup||'', nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}});
persist(); render();
});
}
}


function render(){
renderSide();
if(!content) return;
if(ctx.activeView==='personal'){ renderPersonal(ctx); wirePersonalCards(content); }
else if(ctx.activeView==='projects'){ renderProject(ctx); }
else { renderReport(ctx); }
}


window.addEventListener('DOMContentLoaded', ()=>{ initHeaderBindings(); render(); console.log('[Allocator] Boot complete'); });
