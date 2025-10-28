import { state, setState, persist } from './state.js';
content,
activeView: 'personal',
activePersonId: state.people[0]?.id || null,
activeProjectId: state.projects[0]?.id || null,
activateView(v){ this.activeView=v; render(); }
};


startDateEl.value = state.weeksStart;
numWeeksEl.value = state.numWeeks;


numWeeksEl.addEventListener('change',()=>{ setState({numWeeks: Math.max(4, Math.min(52, Number(numWeeksEl.value)||16))}); render(); })
startDateEl.addEventListener('change',()=>{ setState({weeksStart: startDateEl.value || state.weeksStart}); render(); })


// Side lists
function renderSide(){
peopleList.innerHTML = '';
state.people.forEach(p=>{
const btn = document.createElement('button');
btn.textContent = p.name; btn.onclick = ()=>{ ctx.activePersonId = p.id; ctx.activateView('personal'); };
if(p.id===ctx.activePersonId && ctx.activeView==='personal') btn.classList.add('active');
peopleList.appendChild(btn);
});
projectsList.innerHTML = '';
state.projects.forEach(pr=>{
const btn = document.createElement('button');
btn.textContent = `${pr.opId} — ${pr.title}`; btn.onclick = ()=>{ ctx.activeProjectId = pr.id; ctx.activateView('projects'); };
if(pr.id===ctx.activeProjectId && ctx.activeView==='projects') btn.classList.add('active');
projectsList.appendChild(btn);
});
}


function render(){
renderSide();
if(ctx.activeView==='personal'){ renderPersonal(ctx); wirePersonalCards(content); }
else if(ctx.activeView==='projects'){ renderProject(ctx); }
else { renderReport(ctx); }
}


// Header actions
const addPersonBtn = document.getElementById('addPerson');
const addProjectBtn = document.getElementById('addProject');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');


document.getElementById('view-personal').onclick = ()=>ctx.activateView('personal');
document.getElementById('view-projects').onclick = ()=>ctx.activateView('projects');
document.getElementById('view-report').onclick = ()=>ctx.activateView('report');


addPersonBtn.onclick = ()=>{
const name = prompt('Person name'); if(!name) return;
const division = prompt('Division','GSI')||'';
const specialty = prompt('Specialty','Tendering')||'';
const leader = prompt('People Leader','Olivier Monteil')||'';
state.people.push({id:crypto.randomUUID(), name, division, specialty, leader});
persist(); render();
}


addProjectBtn.onclick = ()=>{
const title = prompt('Project title'); if(!title) return;
const opId = prompt('OpId (e.g., OP10000000)','')||'';
const division = prompt('Division','GSI')||'';
const country = prompt('Country','UK')||'';
state.projects.push({id:crypto.randomUUID(), opId, title, division, country, status:'Live', nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}});
persist(); render();
}


exportBtn.onclick = ()=>{
const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resource-allocator.json'; a.click();
}


importFile.addEventListener('change', (e)=>{
const file = e.target.files?.[0]; if(!file) return;
const reader = new FileReader();
reader.onload = ()=>{ try{ const incoming = JSON.parse(reader.result); save(incoming); location.reload(); }catch(err){ alert('Invalid JSON'); } };
reader.readAsText(file);
e.target.value='';
});


resetBtn.onclick = ()=>{
if(confirm('Clear all data?')){ localStorage.clear(); location.reload(); }
}


// Initial render
render();
