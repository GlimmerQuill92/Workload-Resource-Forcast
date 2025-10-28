import { state, setState, persist } from './state.js';
import { load, save } from './store.js';
import { fmt } from './weeks.js';
import { renderPersonal, wirePersonalCards } from './views/personal.js';
import { renderProject } from './views/project.js';
import { renderReport } from './views/report.js';


// Safe query helpers
const $ = (id)=>document.getElementById(id);
const on = (el, evt, fn)=> el && el.addEventListener(evt, fn);


const content = $('content');
const peopleList = $('peopleList');
const projectsList = $('projectsList');
const numWeeksEl = $('numWeeks');
const startDateEl = $('startDate');


let ctx = {
content,
activeView: 'personal',
activePersonId: state.people[0]?.id || null,
activeProjectId: state.projects[0]?.id || null,
activateView(v){ this.activeView=v; render(); }
};


function initHeaderBindings(){
if(startDateEl) startDateEl.value = state.weeksStart;
if(numWeeksEl) numWeeksEl.value = state.numWeeks;


on(numWeeksEl, 'change', ()=>{ setState({numWeeks: Math.max(4, Math.min(52, Number(numWeeksEl.value)||16))}); render(); });
on(startDateEl, 'change', ()=>{ setState({weeksStart: startDateEl.value || state.weeksStart}); render(); });


on($('view-personal'), 'click', ()=>ctx.activateView('personal'));
on($('view-projects'), 'click', ()=>ctx.activateView('projects'));
on($('view-report'), 'click', ()=>ctx.activateView('report'));


on($('addPerson'), 'click', ()=>{
const name = prompt('Person name'); if(!name) return;
const division = prompt('Division','GSI')||'';
const specialty = prompt('Specialty','Tendering')||'';
const leader = prompt('People Leader','Olivier Monteil')||'';
state.people.push({id:crypto.randomUUID(), name, division, specialty, leader});
persist(); render();
});


on($('addProject'), 'click', ()=>{
const title = prompt('Project title'); if(!title) return;
const opId = prompt('OpId (e.g., OP10000000)','')||'';
const division = prompt('Division','GSI')||'';
const country = prompt('Country','UK')||'';
state.projects.push({id:crypto.randomUUID(), opId, title, division, country, status:'Live', nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}});
persist(); render();
});


on($('exportBtn'), 'click', ()=>{
const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'resource-allocator.json'; a.click();
});


on($('importFile'), 'change', (e)=>{
const file = e.target.files?.[0]; if(!file) return;
const reader = new FileReader();
reader.onload = ()=>{ try{ const incoming = JSON.parse(reader.result); save(incoming); location.reload(); }catch(err){ alert('Invalid JSON'); } };
reader.readAsText(file);
e.target.value='';
});


on($('resetBtn'), 'click', ()=>{
if(confirm('Clear all data?')){ localStorage.clear(); location.reload(); }
});
}


// Side lists
function renderSide(){
});
