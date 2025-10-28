 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/js/views/personal.js b/js/views/personal.js
index bea287ac02c0884f230680336ad326c7139be508..286df660fb7e09d766a3ab323ee35e5f7210804d 100644
--- a/js/views/personal.js
+++ b/js/views/personal.js
@@ -1,85 +1,203 @@
 import { state, getAllocation, setAllocation, updateProject } from '../state.js';
-<thead>${head}</thead>
-<tbody>${rows}</tbody>
-<tfoot>
-<tr>
-<th class="sticky-col" style="left:0">Week Total %</th>
-<th class="sticky-col-2" style="left:180px">(All rows)</th>
-${weeks.map(d=>`<th class="num" data-week-total="${d}"></th>`).join('')}
-<th></th>
-</tr>
-</tfoot>
-</table>
-</div>
-<div class="divider"></div>
-<div class="cards">
-${state.projects.map(pr=>projectCard(pr)).join('')}
-</div>
-`;
-
-
-// Wire up events
-content.addEventListener('click', e=>{
-const btn = e.target.closest('[data-person-tab]');
-if(btn){ ctx.activePersonId = btn.getAttribute('data-person-tab'); ctx.activateView('personal'); }
-});
-content.addEventListener('change', e=>{
-const el = e.target.closest('input[data-alloc]');
-if(el){ const [pid, proj, day] = el.getAttribute('data-alloc').split('|'); setAllocation(pid, proj, day, el.value); refreshTotals(ctx); }
-});
-
-
-refreshTotals(ctx);
-}
+import { weeksRange } from '../weeks.js';
+import { refreshTotals } from '../totals.js';
+import { chip } from '../ui.js';
+
+export function renderPersonal(ctx) {
+  const { content } = ctx;
+  if (!content) return;
+
+  if (!state.people.length) {
+    content.innerHTML = '<p class="help">Add a person to begin.</p>';
+    return;
+  }
+
+  const weeks = weeksRange(state.weeksStart, state.numWeeks);
+  let person = state.people.find((p) => p.id === ctx.activePersonId) || state.people[0];
+  if (!person) {
+    content.innerHTML = '<p class="help">Add a person to begin.</p>';
+    return;
+  }
+  ctx.activePersonId = person.id;
+
+  const tabs = state.people
+    .map(
+      (p) => `
+        <button class="tab ${p.id === person.id ? 'active' : ''}" data-person-tab="${p.id}">
+          ${p.name}
+        </button>
+      `,
+    )
+    .join('');
+
+  const adminRows = (state.adminRows || []).map((name) => ({
+    key: `admin:${name}`,
+    label: name,
+    subtitle: 'Admin',
+  }));
+
+  const projectRows = state.projects.map((project) => ({
+    key: project.id,
+    label: `${project.opId} — ${project.title}`,
+    subtitle: [project.group, project.subgroup].filter(Boolean).join(' / ') || project.division || '',
+  }));
+
+  const rows = [...adminRows, ...projectRows];
+
+  const bodyRows = rows
+    .map((row) => {
+      const inputs = weeks
+        .map((day) => {
+          const val = getAllocation(person.id, row.key, day);
+          return `<td><input class="input num" style="width:64px" value="${val}" data-alloc="${person.id}|${row.key}|${day}"></td>`;
+        })
+        .join('');
+      return `
+        <tr>
+          <td class="sticky-col">${row.label}</td>
+          <td class="sticky-col-2 muted">${row.subtitle || ''}</td>
+          ${inputs}
+          <td class="num total"></td>
+        </tr>
+      `;
+    })
+    .join('');
 
+  const head = `
+    <tr>
+      <th class="sticky-col" style="left:0; min-width:220px">Project / Row</th>
+      <th class="sticky-col-2" style="left:220px; min-width:180px">Details</th>
+      ${weeks
+        .map(
+          (day) =>
+            `<th class="num">${new Date(day).toLocaleDateString('en-GB', {
+              day: '2-digit',
+              month: 'short',
+              year: '2-digit',
+            })}</th>`,
+        )
+        .join('')}
+      <th class="num">Row Total %</th>
+    </tr>
+  `;
 
-function projectCard(pr){
-const cls = pr.status==='Live'?'ok':(pr.status?.includes('Hold')?'hold':'risk');
-return `<div class="card">
-<div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
-<div>
-<div style="font-weight:600">${pr.opId} — ${pr.title}</div>
-<div class="status ${cls}"><i></i><span class="muted">${pr.status||'-'}</span></div>
-</div>
-<button class="btn" data-edit-project="${pr.id}">Edit</button>
-</div>
-<div class="divider"></div>
-<div class="help">Dates</div>
-<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px">
-<label>Next Submission <input class="input" value="${pr.dates?.nextSubmission||''}" data-prop="${pr.id}|dates.nextSubmission"></label>
-<label>AWARD <input class="input" value="${pr.dates?.award||''}" data-prop="${pr.id}|dates.award"></label>
-<label>Booking <input class="input" value="${pr.dates?.booking||''}" data-prop="${pr.id}|dates.booking"></label>
-<label>Next Deadline Date <input class="input" value="${pr.nextDeadline||''}" data-prop="${pr.id}|nextDeadline"></label>
-<label>What is the deadline for? <input class="input" value="${pr.deadlineFor||''}" data-prop="${pr.id}|deadlineFor"></label>
-</div>
-<div class="divider"></div>
-<div class="help">Notes</div>
-<textarea class="input" data-prop="${pr.id}|notes">${pr.notes||''}</textarea>
-<div class="divider"></div>
-<div class="help">Concerns to escalate to Olivier</div>
-<textarea class="input" data-prop="${pr.id}|concerns">${pr.concerns||''}</textarea>
-</div>`
+  const personMeta = `
+    <div class="help" style="margin:6px 0">
+      ${chip(person.specialty || '—')} ${chip(person.division || '—')} Group: ${chip(person.group || 'Unassigned')} • Lead: ${
+    person.leader || '—'
+  }
+    </div>
+  `;
+
+  content.innerHTML = `
+    <div class="tabs">${tabs}</div>
+    ${personMeta}
+    <div class="grid">
+      <table>
+        <thead>${head}</thead>
+        <tbody>${bodyRows}</tbody>
+        <tfoot>
+          <tr>
+            <th class="sticky-col" style="left:0">Week Total %</th>
+            <th class="sticky-col-2" style="left:220px">(All rows)</th>
+            ${weeks.map((day) => `<th class="num" data-week-total="${day}"></th>`).join('')}
+            <th></th>
+          </tr>
+        </tfoot>
+      </table>
+    </div>
+    <div class="divider"></div>
+    <div class="cards">${state.projects.map((project) => projectCard(project)).join('')}</div>
+  `;
+
+  if (!content.__personalViewBound) {
+    content.addEventListener('click', (event) => {
+      const tab = event.target.closest('[data-person-tab]');
+      if (tab) {
+        const id = tab.getAttribute('data-person-tab');
+        const selected = state.people.find((p) => p.id === id);
+        if (selected) {
+          ctx.activePersonId = selected.id;
+          ctx.activePeopleGroup = selected.group || 'Unassigned';
+        }
+        ctx.activateView('personal');
+      }
+    });
+
+    content.addEventListener('change', (event) => {
+      const input = event.target.closest('input[data-alloc]');
+      if (input) {
+        const [personId, projectId, day] = input.getAttribute('data-alloc').split('|');
+        setAllocation(personId, projectId, day, input.value);
+        refreshTotals(ctx);
+      }
+    });
+
+    content.__personalViewBound = true;
+  }
+
+  refreshTotals(ctx);
+}
+
+function projectCard(project) {
+  const statusClass =
+    project.status === 'Live' ? 'ok' : project.status?.includes('Hold') ? 'hold' : 'risk';
+  return `
+    <div class="card">
+      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px">
+        <div>
+          <div style="font-weight:600">${project.opId} — ${project.title}</div>
+          <div class="status ${statusClass}"><i></i><span class="muted">${project.status || '-'}</span></div>
+        </div>
+        <button class="btn" data-edit-project="${project.id}">Edit</button>
+      </div>
+      <div class="divider"></div>
+      <div class="help">Dates</div>
+      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px">
+        <label>Next Submission <input class="input" value="${project.dates?.nextSubmission || ''}" data-prop="${project.id}|dates.nextSubmission"></label>
+        <label>AWARD <input class="input" value="${project.dates?.award || ''}" data-prop="${project.id}|dates.award"></label>
+        <label>Booking <input class="input" value="${project.dates?.booking || ''}" data-prop="${project.id}|dates.booking"></label>
+        <label>Next Deadline Date <input class="input" value="${project.nextDeadline || ''}" data-prop="${project.id}|nextDeadline"></label>
+        <label>What is the deadline for? <input class="input" value="${project.deadlineFor || ''}" data-prop="${project.id}|deadlineFor"></label>
+      </div>
+      <div class="divider"></div>
+      <div class="help">Notes</div>
+      <textarea class="input" data-prop="${project.id}|notes">${project.notes || ''}</textarea>
+      <div class="divider"></div>
+      <div class="help">Concerns to escalate to Olivier</div>
+      <textarea class="input" data-prop="${project.id}|concerns">${project.concerns || ''}</textarea>
+    </div>
+  `;
 }
 
+export function wirePersonalCards(content) {
+  if (!content.__personalCardsBound) {
+    content.addEventListener('input', (event) => {
+      const prop = event.target.getAttribute('data-prop');
+      if (!prop) return;
+      const [id, path] = prop.split('|');
+      const patch = path
+        .split('.')
+        .reverse()
+        .reduce((acc, key, index) => (index === 0 ? { [key]: event.target.value } : { [key]: acc }), {});
+      updateProject(id, patch);
+    });
+
+    content.addEventListener('click', (event) => {
+      const btn = event.target.closest('[data-edit-project]');
+      if (!btn) return;
+      const id = btn.getAttribute('data-edit-project');
+      const project = state.projects.find((p) => p.id === id);
+      if (!project) return;
+      const title = prompt('Project title', project.title);
+      if (title === null) return;
+      const opId = prompt('OpId', project.opId) ?? project.opId;
+      const division = prompt('Division', project.division) ?? project.division;
+      const country = prompt('Country', project.country) ?? project.country;
+      const status = prompt('Status (Live/On Hold/Won not Booked/At Risk/Closed)', project.status) ?? project.status;
+      updateProject(id, { title, opId, division, country, status });
+    });
 
-// Handle inline edits for card fields
-export function wirePersonalCards(content){
-content.addEventListener('input', e=>{
-const prop = e.target.getAttribute('data-prop'); if(!prop) return;
-const [id, path] = prop.split('|');
-const patch = path.split('.').reverse().reduce((acc,key,i,arr)=> i===0 ? {[key]:e.target.value} : {[key]:acc},{});
-updateProject(id, patch);
-});
-content.addEventListener('click', e=>{
-const btn = e.target.closest('[data-edit-project]');
-if(!btn) return;
-const id = btn.getAttribute('data-edit-project');
-const pr = state.projects.find(p=>p.id===id); if(!pr) return;
-const title = prompt('Project title', pr.title); if(title===null) return;
-const opId = prompt('OpId', pr.opId) ?? pr.opId;
-const division = prompt('Division', pr.division) ?? pr.division;
-const country = prompt('Country', pr.country) ?? pr.country;
-const status = prompt('Status (Live/On Hold/Won not Booked/At Risk/Closed)', pr.status) ?? pr.status;
-updateProject(id,{title, opId, division, country, status});
-});
+    content.__personalCardsBound = true;
+  }
 }
 
EOF
)
