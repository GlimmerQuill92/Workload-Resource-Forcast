import { fmt, startOfWednesdayWeek } from './weeks.js';
import { load, save } from './store.js';


const today = new Date();
const defaultState = {
weeksStart: fmt(startOfWednesdayWeek(today)),
numWeeks: 16,
// freely editable grouping
peopleGroups: ['Team Alpha'],
projectGroups: [
{ name: 'Sub 1', subs: ['Sub 11'] },
{ name: 'Sub 2', subs: ['Sub 21'] },
],
people: [
{id: crypto.randomUUID(), name: 'Person #1', division:'GSI', specialty:'Tendering', leader:'Olivier Monteil', group:'Team Alpha'},
{id: crypto.randomUUID(), name: 'Person #2', division:'GSI', specialty:'Tendering', leader:'Olivier Monteil', group:'Team Alpha'},
],
projects: [
{id: crypto.randomUUID(), opId:'OP10000000', title:'Project 1', division:'GSI', country:'NL', status:'Live', group:'Sub 1', subgroup:'Sub 11', nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}},
],
allocations: [], // {personId, projectId, week(YYYY-MM-DD), pct}
adminRows: ['Holidays','People Leadership','Champions Roles','Misc1','Misc2'],
};


export let state = load() || defaultState;
export function persist(){ save(state); }
export function setState(patch){ state = {...state, ...patch}; persist(); }


export function setAllocation(personId, projectId, week, pct){
pct = Number(pct)||0; if(pct<0)pct=0; if(pct>100)pct=100;
const i = state.allocations.findIndex(a=>a.personId===personId && a.projectId===projectId && a.week===week);
if(i>-1) state.allocations[i].pct = pct; else state.allocations.push({personId, projectId, week, pct});
persist();
}
export function getAllocation(personId, projectId, week){
const a = state.allocations.find(a=>a.personId===personId && a.projectId===projectId && a.week===week);
return a? a.pct : 0;
}
export function deepMerge(a,b){
if(Array.isArray(a)||Array.isArray(b)||typeof a!=='object'||typeof b!=='object') return b;
const out={...a}; for(const k of Object.keys(b)){ out[k] = k in a ? deepMerge(a[k], b[k]) : b[k]; }
return out;
}
export function updateProject(id, patch){
const i = state.projects.findIndex(p=>p.id===id); if(i<0) return;
state.projects[i] = deepMerge(state.projects[i], patch); persist();
}
export function updatePerson(id, patch){
const i = state.people.findIndex(p=>p.id===id); if(i<0) return;
state.people[i] = deepMerge(state.people[i], patch); persist();
}
export function totalForPersonWeek(personId, week){
return state.allocations.filter(a=>a.personId===personId && a.week===week).reduce((s,a)=>s+a.pct,0);
}
export function totalForProjectWeek(projectId, week){
return state.allocations.filter(a=>a.projectId===projectId && a.week===week).reduce((s,a)=>s+a.pct,0);
}


// ---- group management ----
export function addPeopleGroup(name){ if(!name) return; if(!state.peopleGroups.includes(name)) state.peopleGroups.push(name); persist(); }
export function renamePeopleGroup(oldName, newName){ if(!newName) return; state.peopleGroups = state.peopleGroups.map(g=> g===oldName? newName:g); state.people.forEach(p=>{ if(p.group===oldName) p.group=newName; }); persist(); }


export function addProjectGroup(name){ if(!name) return; if(!state.projectGroups.some(g=>g.name===name)) state.projectGroups.push({name, subs:[]}); persist(); }
export function addProjectSub(groupName, subName){ const g = state.projectGroups.find(g=>g.name===groupName); if(!g||!subName) return; if(!g.subs.includes(subName)) g.subs.push(subName); persist(); }
export function renameProjectGroup(oldName, newName){ const g = state.projectGroups.find(g=>g.name===oldName); if(!g||!newName) return; g.name=newName; state.projects.forEach(p=>{ if(p.group===oldName) p.group=newName; }); persist(); }
export function renameProjectSub(groupName, oldSub, newSub){ const g = state.projectGroups.find(g=>g.name===groupName); if(!g||!newSub) return; g.subs = g.subs.map(s=> s===oldSub? newSub:s); state.projects.forEach(p=>{ if(p.group===groupName && p.subgroup===oldSub) p.subgroup=newSub; }); persist(); }
