export function fmt(d){ return new Date(d).toISOString().slice(0,10); }
export function startOfWednesdayWeek(d){
const x = new Date(d);
const day = x.getUTCDay(); // 0..6
const diffToWed = (3 - day + 7) % 7; // 3 = Wed
x.setUTCDate(x.getUTCDate() + diffToWed);
x.setUTCHours(0,0,0,0);
return x;
}
export function weeksRange(start, n){
const arr=[]; const s = new Date(start);
for(let i=0;i<n;i++){ const d=new Date(s); d.setUTCDate(d.getUTCDate()+7*i); arr.push(fmt(d)); }
return arr;
}
