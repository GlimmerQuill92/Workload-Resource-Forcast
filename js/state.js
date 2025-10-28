import { fmt, startOfWednesdayWeek } from './weeks.js';
import { load, save } from './store.js';


const today = new Date();
const defaultState = {
weeksStart: fmt(startOfWednesdayWeek(today)),
numWeeks: 16,
people: [
{id: crypto.randomUUID(), name: 'Person #1', division:'GSI', specialty:'Tendering', leader:'Olivier Monteil'},
{id: crypto.randomUUID(), name: 'Person #2', division:'GSI', specialty:'Tendering', leader:'Olivier Monteil'},
],
projects: [
{id: crypto.randomUUID(), opId:'OP10000000', title:'Project 1', division:'GSI', country:'NL', status:'Live', nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}},
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
export function totalForPersonWeek(personId, week){
return state.allocations.filter(a=>a.personId===personId && a.week===week).reduce((s,a)=>s+a.pct,0);
}
export function totalForProjectWeek(projectId, week){
return state.allocations.filter(a=>a.projectId===projectId && a.week===week).reduce((s,a)=>s+a.pct,0);
}
