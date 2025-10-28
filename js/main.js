 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/js/main.js b/js/main.js
index 81cf096278176877fb42d8f1685d9c69741ca504..952aa13945a4ea44c84c2b81ddfc2f5feb5f9e80 100644
--- a/js/main.js
+++ b/js/main.js
@@ -1,104 +1,499 @@
-import { state, setState, persist, updateProject, updatePerson } from './state.js';
+import {
+  state,
+  setState,
+  persist,
+  addPeopleGroup,
+  renamePeopleGroup,
+  addProjectGroup,
+  addProjectSub,
+  renameProjectGroup,
+  renameProjectSub,
+} from './state.js';
+import { StoreKey } from './store.js';
+import { renderPersonal, wirePersonalCards } from './views/personal.js';
+import { renderProject } from './views/project.js';
+import { renderReport } from './views/report.js';
 
+const $ = (id) => document.getElementById(id);
+const on = (el, evt, handler) => el && el.addEventListener(evt, handler);
 
-// Top-level actions next to heading
-on($('addPeopleGroup'),'click', ()=>{ const name = prompt('New people group name'); if(name) { addPeopleGroup(name); renderSide(); } });
-on($('addPersonSidebar'),'click', ()=>{ const group = prompt('Assign to group (leave blank for Unassigned)')||''; const name = prompt('Person name'); if(!name) return; const division = prompt('Division','GSI')||''; const specialty = prompt('Specialty','Tendering')||''; const leader = prompt('People Leader','Olivier Monteil')||''; state.people.push({id:crypto.randomUUID(), name, division, specialty, leader, group: group||'Unassigned'}); persist(); render(); });
+const content = $('content');
+const peopleTree = $('peopleTree');
+const projectsTree = $('projectsTree');
+
+const ctx = {
+  content,
+  activeView: 'personal',
+  activePersonId: state.people[0]?.id ?? null,
+  activeProjectId: state.projects[0]?.id ?? null,
+  activePeopleGroup: initialPeopleGroup(),
+  activateView(view) {
+    this.activeView = view;
+    render();
+  },
+};
+
+function initialPeopleGroup() {
+  const firstPersonGroup = state.people[0]?.group;
+  if (firstPersonGroup) return firstPersonGroup;
+  if (state.peopleGroups.length) return state.peopleGroups[0];
+  return 'Unassigned';
+}
+
+function ensureSelections() {
+  if (!state.people.some((p) => p.id === ctx.activePersonId)) {
+    ctx.activePersonId = state.people[0]?.id ?? null;
+  }
+  if (!state.projects.some((p) => p.id === ctx.activeProjectId)) {
+    ctx.activeProjectId = state.projects[0]?.id ?? null;
+  }
+  const groups = collectPeopleGroups();
+  if (!groups.includes(ctx.activePeopleGroup)) {
+    ctx.activePeopleGroup = groups[0] ?? 'Unassigned';
+  }
 }
 
+function collectPeopleGroups() {
+  const groups = [...state.peopleGroups];
+  const extras = new Set();
+  state.people.forEach((person) => {
+    const g = person.group?.trim();
+    extras.add(g && g.length ? g : 'Unassigned');
+  });
+  extras.forEach((g) => {
+    if (g === 'Unassigned') return;
+    if (!groups.includes(g)) groups.push(g);
+  });
+  if (!groups.includes('Unassigned')) groups.push('Unassigned');
+  return groups;
+}
 
-if(projectsTree){
-projectsTree.innerHTML = '';
-// Build groups/subs tree
-const groups = state.projectGroups || [];
-groups.forEach(g=>{
-const gWrap = document.createElement('div');
-gWrap.innerHTML = `
-<div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px">
-<strong contenteditable="true" spellcheck="false" data-project-group-name>${g.name}</strong>
-<div style="display:flex; gap:6px">
-<button class="btn" data-add-sub>＋ Sub</button>
-</div>
-</div>
-<div class="list" data-subtree></div>`;
-projectsTree.appendChild(gWrap);
-
-
-// rename group
-const gNameEl = gWrap.querySelector('[data-project-group-name]');
-gNameEl.addEventListener('blur', ()=>{ const newName = gNameEl.textContent.trim()||g.name; if(newName!==g.name){ renameProjectGroup(g.name, newName); renderSide(); } });
-
-
-// add sub
-gWrap.querySelector('[data-add-sub]').addEventListener('click', ()=>{ const sub = prompt('New subgroup name'); if(sub){ addProjectSub(g.name, sub); renderSide(); } });
-
-
-const subtree = gWrap.querySelector('[data-subtree]');
-(g.subs||[]).forEach(sub=>{
-const sWrap = document.createElement('div');
-sWrap.style.marginLeft = '10px';
-sWrap.innerHTML = `
-<div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px">
-<em contenteditable="true" spellcheck="false" data-project-sub-name>${sub}</em>
-<div style="display:flex; gap:6px">
-<button class="btn" data-add-project>＋ Project</button>
-</div>
-</div>
-<div class="list" data-project-list></div>`;
-subtree.appendChild(sWrap);
-
-
-// rename sub
-const sNameEl = sWrap.querySelector('[data-project-sub-name]');
-sNameEl.addEventListener('blur', ()=>{ const newSub = sNameEl.textContent.trim()||sub; if(newSub!==sub){ renameProjectSub(g.name, sub, newSub); renderSide(); } });
-
-
-// add project in this subgroup
-sWrap.querySelector('[data-add-project]').addEventListener('click', ()=>{
-const title = prompt('Project title'); if(!title) return;
-const opId = prompt('OpId (e.g., OP10000000)','')||'';
-const division = prompt('Division','GSI')||'';
-const country = prompt('Country','UK')||'';
-state.projects.push({id:crypto.randomUUID(), opId, title, division, country, status:'Live', group:g.name, subgroup:sub, nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}});
-persist(); render();
-});
+function setActivePeopleGroup(groupName, opts = { focusPerson: false }) {
+  ctx.activePeopleGroup = groupName;
+  if (opts.focusPerson) {
+    const personInGroup = state.people.find(
+      (p) => (p.group || 'Unassigned') === groupName,
+    );
+    if (personInGroup) ctx.activePersonId = personInGroup.id;
+  }
+  render();
+}
 
+function renderSide() {
+  renderPeopleSidebar();
+  renderProjectsSidebar();
+}
 
-// list projects matching group/sub
-const list = sWrap.querySelector('[data-project-list]');
-state.projects.filter(p=> (p.group||'')===g.name && (p.subgroup||'')===sub ).forEach(pr=>{
-const btn = document.createElement('button'); btn.textContent = `${pr.opId} — ${pr.title}`; btn.onclick = ()=>{ ctx.activeProjectId = pr.id; ctx.activateView('projects'); };
-if(pr.id===ctx.activeProjectId && ctx.activeView==='projects') btn.classList.add('active');
-list.appendChild(btn);
-});
-});
-});
+function renderPeopleSidebar() {
+  if (!peopleTree) return;
+  peopleTree.innerHTML = '';
+  const groups = collectPeopleGroups();
+  if (!groups.length) groups.push('Unassigned');
+  if (!groups.includes(ctx.activePeopleGroup)) {
+    ctx.activePeopleGroup = groups[0];
+  }
 
+  groups.forEach((groupName) => {
+    const wrapper = document.createElement('div');
+    wrapper.className = 'people-group';
+    if (groupName === ctx.activePeopleGroup) wrapper.classList.add('active');
 
-// top level actions
-on($('addProjectGroup'),'click', ()=>{ const name = prompt('New project group name'); if(name){ addProjectGroup(name); renderSide(); } });
-on($('addProjectSub'),'click', ()=>{ const group = prompt('Add subgroup under which group?'); if(!group) return; const sub = prompt('Subgroup name'); if(!sub) return; addProjectSub(group, sub); renderSide(); });
-on($('addProjectSidebar'),'click', ()=>{
-const group = prompt('Assign to project group (leave blank to skip)')||'';
-const subgroup = group? (prompt('Assign to subgroup (leave blank to skip)')||'') : '';
-const title = prompt('Project title'); if(!title) return;
-const opId = prompt('OpId (e.g., OP10000000)','')||'';
-const division = prompt('Division','GSI')||'';
-const country = prompt('Country','UK')||'';
-state.projects.push({id:crypto.randomUUID(), opId, title, division, country, status:'Live', group: group||'', subgroup: subgroup||'', nextDeadline:'', deadlineFor:'', notes:'', concerns:'', dates:{nextSubmission:'', award:'', booking:''}});
-persist(); render();
-});
+    const header = document.createElement('div');
+    header.style.display = 'flex';
+    header.style.alignItems = 'center';
+    header.style.justifyContent = 'space-between';
+    header.style.marginTop = '6px';
+
+    const title = document.createElement('strong');
+    title.textContent = groupName;
+    title.setAttribute('spellcheck', 'false');
+    title.dataset.peopleGroupName = groupName;
+    if (groupName !== 'Unassigned') title.contentEditable = 'true';
+
+    const actions = document.createElement('div');
+    actions.style.display = 'flex';
+    actions.style.gap = '6px';
+
+    const addPersonBtn = document.createElement('button');
+    addPersonBtn.className = 'btn';
+    addPersonBtn.textContent = '＋ Person';
+    addPersonBtn.addEventListener('click', (e) => {
+      e.stopPropagation();
+      ctx.activePeopleGroup = groupName;
+      promptAddPerson(groupName);
+    });
+    actions.appendChild(addPersonBtn);
+
+    header.appendChild(title);
+    header.appendChild(actions);
+    header.addEventListener('click', (e) => {
+      if (e.target.closest('button')) return;
+      setActivePeopleGroup(groupName, { focusPerson: true });
+    });
+
+    if (groupName !== 'Unassigned') {
+      let initialText = groupName;
+      title.addEventListener('focus', () => {
+        initialText = title.textContent.trim();
+        ctx.activePeopleGroup = groupName;
+      });
+      title.addEventListener('keydown', (e) => {
+        if (e.key === 'Enter') {
+          e.preventDefault();
+          title.blur();
+        }
+      });
+      title.addEventListener('blur', () => {
+        const newName = title.textContent.trim() || initialText;
+        title.textContent = newName;
+        if (newName !== initialText) {
+          renamePeopleGroup(initialText, newName);
+          ctx.activePeopleGroup = newName;
+          render();
+        } else {
+          renderSide();
+        }
+      });
+    }
+
+    const list = document.createElement('div');
+    list.className = 'list';
+    list.dataset.personList = groupName;
+
+    const people = state.people
+      .filter((person) => (person.group || 'Unassigned') === groupName)
+      .sort((a, b) => a.name.localeCompare(b.name));
+
+    if (!people.length) {
+      const empty = document.createElement('div');
+      empty.className = 'help';
+      empty.style.padding = '4px 0 0 4px';
+      empty.textContent = 'No people';
+      list.appendChild(empty);
+    } else {
+      people.forEach((person) => {
+        const btn = document.createElement('button');
+        btn.textContent = person.name;
+        btn.dataset.personId = person.id;
+        if (person.id === ctx.activePersonId && ctx.activeView === 'personal') {
+          btn.classList.add('active');
+        }
+        btn.addEventListener('click', () => {
+          ctx.activePeopleGroup = groupName;
+          ctx.activePersonId = person.id;
+          ctx.activateView('personal');
+        });
+        list.appendChild(btn);
+      });
+    }
+
+    wrapper.appendChild(header);
+    wrapper.appendChild(list);
+    peopleTree.appendChild(wrapper);
+  });
+}
+
+function renderProjectsSidebar() {
+  if (!projectsTree) return;
+  projectsTree.innerHTML = '';
+  const groups = state.projectGroups || [];
+
+  groups.forEach((group) => {
+    const groupWrapper = document.createElement('div');
+    groupWrapper.innerHTML = `
+      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:6px">
+        <strong contenteditable="true" spellcheck="false" data-project-group-name>${group.name}</strong>
+        <div style="display:flex; gap:6px">
+          <button class="btn" data-add-sub>＋ Sub</button>
+        </div>
+      </div>
+      <div class="list" data-subtree></div>
+    `;
+    projectsTree.appendChild(groupWrapper);
+
+    const groupTitle = groupWrapper.querySelector('[data-project-group-name]');
+    groupTitle.addEventListener('focus', () => {
+      groupWrapper.dataset.initialName = group.name;
+    });
+    groupTitle.addEventListener('keydown', (e) => {
+      if (e.key === 'Enter') {
+        e.preventDefault();
+        groupTitle.blur();
+      }
+    });
+    groupTitle.addEventListener('blur', () => {
+      const original = groupWrapper.dataset.initialName || group.name;
+      const nextName = groupTitle.textContent.trim() || original;
+      groupTitle.textContent = nextName;
+      if (nextName !== original) {
+        renameProjectGroup(original, nextName);
+        render();
+      } else {
+        renderSide();
+      }
+    });
+
+    groupWrapper
+      .querySelector('[data-add-sub]')
+      .addEventListener('click', () => {
+        const subName = prompt('New subgroup name');
+        if (!subName) return;
+        addProjectSub(group.name, subName);
+        renderSide();
+      });
+
+    const subtree = groupWrapper.querySelector('[data-subtree]');
+    (group.subs || []).forEach((sub) => {
+      const subWrapper = document.createElement('div');
+      subWrapper.style.marginLeft = '10px';
+      subWrapper.innerHTML = `
+        <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px">
+          <em contenteditable="true" spellcheck="false" data-project-sub-name>${sub}</em>
+          <div style="display:flex; gap:6px">
+            <button class="btn" data-add-project>＋ Project</button>
+          </div>
+        </div>
+        <div class="list" data-project-list></div>
+      `;
+      subtree.appendChild(subWrapper);
+
+      const subTitle = subWrapper.querySelector('[data-project-sub-name]');
+      subTitle.addEventListener('keydown', (e) => {
+        if (e.key === 'Enter') {
+          e.preventDefault();
+          subTitle.blur();
+        }
+      });
+      subTitle.addEventListener('blur', () => {
+        const next = subTitle.textContent.trim() || sub;
+        subTitle.textContent = next;
+        if (next !== sub) {
+          renameProjectSub(group.name, sub, next);
+          render();
+        } else {
+          renderSide();
+        }
+      });
+
+      subWrapper
+        .querySelector('[data-add-project]')
+        .addEventListener('click', () => {
+          promptAddProject({ group: group.name, subgroup: sub });
+        });
+
+      const list = subWrapper.querySelector('[data-project-list]');
+      state.projects
+        .filter((project) => (project.group || '') === group.name && (project.subgroup || '') === sub)
+        .forEach((project) => {
+          const btn = document.createElement('button');
+          btn.textContent = `${project.opId} — ${project.title}`;
+          btn.onclick = () => {
+            ctx.activeProjectId = project.id;
+            ctx.activateView('projects');
+          };
+          if (project.id === ctx.activeProjectId && ctx.activeView === 'projects') {
+            btn.classList.add('active');
+          }
+          list.appendChild(btn);
+        });
+    });
+  });
+}
+
+function promptAddPerson(defaultGroup) {
+  const name = prompt('Person name');
+  if (!name) return;
+  const division = prompt('Division', 'GSI') ?? 'GSI';
+  const specialty = prompt('Specialty', 'Tendering') ?? 'Tendering';
+  const leader = prompt('People Leader', 'Olivier Monteil') ?? 'Olivier Monteil';
+  const groupInput = prompt(
+    'Assign to group (leave blank for Unassigned)',
+    defaultGroup && defaultGroup !== 'Unassigned' ? defaultGroup : '',
+  );
+  const group = (groupInput && groupInput.trim()) || (defaultGroup && defaultGroup !== 'Unassigned' ? defaultGroup : 'Unassigned');
+  if (group && group !== 'Unassigned' && !state.peopleGroups.includes(group)) {
+    addPeopleGroup(group);
+  }
+  const person = {
+    id: crypto.randomUUID(),
+    name,
+    division: division || '',
+    specialty: specialty || '',
+    leader: leader || '',
+    group: group || 'Unassigned',
+  };
+  state.people.push(person);
+  ctx.activePeopleGroup = person.group || 'Unassigned';
+  ctx.activePersonId = person.id;
+  persist();
+  render();
 }
+
+function promptAddProject({ group = '', subgroup = '' } = {}) {
+  const projectGroup = prompt('Assign to project group (leave blank to skip)', group) || '';
+  const projectSubgroup = projectGroup
+    ? prompt('Assign to subgroup (leave blank to skip)', subgroup)
+    : '';
+  const title = prompt('Project title');
+  if (!title) return;
+  const opId = prompt('OpId (e.g., OP10000000)', '') || '';
+  const division = prompt('Division', 'GSI') || '';
+  const country = prompt('Country', 'UK') || '';
+  if (projectGroup) {
+    if (!state.projectGroups.some((g) => g.name === projectGroup)) {
+      addProjectGroup(projectGroup);
+    }
+    if (projectSubgroup) {
+      addProjectSub(projectGroup, projectSubgroup);
+    }
+  }
+  const project = {
+    id: crypto.randomUUID(),
+    opId,
+    title,
+    division,
+    country,
+    status: 'Live',
+    group: projectGroup || '',
+    subgroup: projectSubgroup || '',
+    nextDeadline: '',
+    deadlineFor: '',
+    notes: '',
+    concerns: '',
+    dates: { nextSubmission: '', award: '', booking: '' },
+  };
+  state.projects.push(project);
+  ctx.activeProjectId = project.id;
+  persist();
+  render();
 }
 
+function initHeaderBindings() {
+  const addPersonBtn = $('addPerson');
+  const addProjectBtn = $('addProject');
+  const addPersonSidebar = $('addPersonSidebar');
+  const addPeopleGroupBtn = $('addPeopleGroup');
+  const addProjectGroupBtn = $('addProjectGroup');
+  const addProjectSubBtn = $('addProjectSub');
+  const addProjectSidebar = $('addProjectSidebar');
+  const exportBtn = $('exportBtn');
+  const importFile = $('importFile');
+  const resetBtn = $('resetBtn');
+  const numWeeksInput = $('numWeeks');
+  const startDateInput = $('startDate');
+
+  if (numWeeksInput) {
+    numWeeksInput.value = state.numWeeks;
+    numWeeksInput.addEventListener('change', () => {
+      const value = Number(numWeeksInput.value);
+      const clamped = Math.min(Math.max(value, 4), 52);
+      numWeeksInput.value = String(clamped);
+      setState({ numWeeks: clamped });
+      render();
+    });
+  }
+
+  if (startDateInput) {
+    startDateInput.value = state.weeksStart;
+    startDateInput.addEventListener('change', () => {
+      if (!startDateInput.value) return;
+      setState({ weeksStart: startDateInput.value });
+      render();
+    });
+  }
 
-function render(){
-renderSide();
-if(!content) return;
-if(ctx.activeView==='personal'){ renderPersonal(ctx); wirePersonalCards(content); }
-else if(ctx.activeView==='projects'){ renderProject(ctx); }
-else { renderReport(ctx); }
+  on(addPersonBtn, 'click', () => {
+    promptAddPerson(ctx.activePeopleGroup);
+  });
+
+  on(addProjectBtn, 'click', () => {
+    promptAddProject();
+  });
+
+  on(addPersonSidebar, 'click', () => {
+    promptAddPerson(ctx.activePeopleGroup);
+  });
+
+  on(addPeopleGroupBtn, 'click', () => {
+    const name = prompt('New people group name');
+    if (!name) return;
+    if (!state.peopleGroups.includes(name)) addPeopleGroup(name);
+    ctx.activePeopleGroup = name;
+    render();
+  });
+
+  on(addProjectGroupBtn, 'click', () => {
+    const name = prompt('New project group name');
+    if (!name) return;
+    addProjectGroup(name);
+    render();
+  });
+
+  on(addProjectSubBtn, 'click', () => {
+    const groupName = prompt('Add subgroup under which group?');
+    if (!groupName) return;
+    const subName = prompt('Subgroup name');
+    if (!subName) return;
+    addProjectSub(groupName, subName);
+    render();
+  });
+
+  on(addProjectSidebar, 'click', () => {
+    promptAddProject();
+  });
+
+  on(exportBtn, 'click', () => {
+    const payload = JSON.stringify(state, null, 2);
+    const blob = new Blob([payload], { type: 'application/json' });
+    const url = URL.createObjectURL(blob);
+    const anchor = document.createElement('a');
+    anchor.href = url;
+    anchor.download = `resource-allocator-${new Date().toISOString().slice(0, 10)}.json`;
+    anchor.click();
+    URL.revokeObjectURL(url);
+  });
+
+  on(importFile, 'change', async () => {
+    const file = importFile.files?.[0];
+    if (!file) return;
+    try {
+      const text = await file.text();
+      const data = JSON.parse(text);
+      setState(data);
+      ctx.activePersonId = state.people[0]?.id ?? null;
+      ctx.activeProjectId = state.projects[0]?.id ?? null;
+      ctx.activePeopleGroup = initialPeopleGroup();
+      render();
+    } catch (err) {
+      console.error('Failed to import JSON', err);
+      alert('Failed to import file. Please ensure it is a valid export.');
+    } finally {
+      importFile.value = '';
+    }
+  });
+
+  on(resetBtn, 'click', () => {
+    localStorage.removeItem(StoreKey);
+    location.reload();
+  });
 }
 
+function render() {
+  ensureSelections();
+  renderSide();
+  if (!content) return;
+  if (ctx.activeView === 'personal') {
+    renderPersonal(ctx);
+    wirePersonalCards(content);
+  } else if (ctx.activeView === 'projects') {
+    renderProject(ctx);
+  } else {
+    renderReport(ctx);
+  }
+}
 
-window.addEventListener('DOMContentLoaded', ()=>{ initHeaderBindings(); render(); console.log('[Allocator] Boot complete'); });
+window.addEventListener('DOMContentLoaded', () => {
+  initHeaderBindings();
+  render();
+  console.log('[Allocator] Boot complete');
+});
 
EOF
)
