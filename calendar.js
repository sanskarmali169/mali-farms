/* =============================================================
   Mali Farm Manager — calendar.js
   Complete Farm Calendar Module
   ============================================================= */

'use strict';

/* ── State ─────────────────────────────────────────────────── */
let calView        = 'month';        // 'month' | 'week' | 'agenda'
let calCursor      = new Date();     // currently displayed month/week
let calEditId      = null;           // id of task being edited
let calSelectedDate= null;           // date clicked to open panel

/* ── Category config ────────────────────────────────────────── */
const CAL_CATS = {
  fertilizer: { label:'Fertilizer',  labelMr:'खते',      icon:'🌿', color:'#4caf50' },
  irrigation:  { label:'Irrigation', labelMr:'सिंचन',    icon:'💧', color:'#2196f3' },
  spraying:    { label:'Spraying',   labelMr:'फवारणी',   icon:'🪣', color:'#9c27b0' },
  harvesting:  { label:'Harvesting', labelMr:'कापणी',    icon:'🌾', color:'#ff9800' },
  labour:      { label:'Labour',     labelMr:'मजुरी',    icon:'👷', color:'#795548' },
  machinery:   { label:'Machinery',  labelMr:'यंत्र',    icon:'🚜', color:'#607d8b' },
  other:       { label:'Other',      labelMr:'इतर',      icon:'📌', color:'#e91e63' },
};

/* ── Day/Month names ─────────────────────────────────────────── */
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAYS_MR = ['रवि','सोम','मंगळ','बुध','गुरु','शुक्र','शनि'];
const MONTHS_FULL_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_FULL_MR = ['जानेवारी','फेब्रुवारी','मार्च','एप्रिल','मे','जून','जुलै','ऑगस्ट','सप्टेंबर','ऑक्टोबर','नोव्हेंबर','डिसेंबर'];

/* ── Helpers ─────────────────────────────────────────────────── */
function calToday()  { return new Date().toISOString().split('T')[0]; }
function calDateKey(d) {
  const dt = (d instanceof Date) ? d : new Date(d);
  return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
}
function calFmt(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr+'T00:00:00');
  return d.toLocaleDateString(lang==='mr'?'mr-IN':'en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function calLang() { return typeof lang !== 'undefined' ? lang : 'en'; }
function ct(key)   { return typeof t === 'function' ? t(key) : key; }
function calUID()  { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function catInfo(cat) { return CAL_CATS[cat] || CAL_CATS.other; }
function catLabel(cat) {
  const c = catInfo(cat);
  return calLang()==='mr' ? c.icon+' '+c.labelMr : c.icon+' '+c.label;
}

/* ── Get all effective dates for a task (handles recurring) ──── */
function getTaskDates(task, from, to) {
  const dates = [];
  const base  = task.date;
  if (!base) return dates;

  const fromD = from ? new Date(from) : new Date('2000-01-01');
  const toD   = to   ? new Date(to)   : new Date(new Date().getFullYear()+2, 11, 31);
  const baseD = new Date(base+'T00:00:00');

  if (task.recurring === 'none' || !task.recurring) {
    if (baseD >= fromD && baseD <= toD) dates.push(base);
    return dates;
  }

  const endD = task.recurringEnd ? new Date(task.recurringEnd+'T00:00:00') : toD;
  const actualEnd = endD < toD ? endD : toD;

  let step = 1;
  if (task.recurring === 'daily')   step = 1;
  if (task.recurring === 'weekly')  step = 7;
  if (task.recurring === 'monthly') step = 30; // approximate
  if (task.recurring === 'custom')  step = parseInt(task.recurringInterval) || 7;

  let cur = new Date(baseD);
  while (cur <= actualEnd) {
    if (cur >= fromD) dates.push(calDateKey(cur));
    if (task.recurring === 'monthly') {
      cur = new Date(cur.getFullYear(), cur.getMonth()+1, cur.getDate());
    } else {
      cur.setDate(cur.getDate() + step);
    }
  }
  return dates;
}

/* ── Build a map: dateKey → [tasks] for the visible range ───── */
function buildDateTaskMap(from, to) {
  const map = {};
  (db.calTasks || []).forEach(task => {
    getTaskDates(task, from, to).forEach(d => {
      if (!map[d]) map[d] = [];
      map[d].push(task);
    });
  });
  return map;
}

/* ── Task status for a given date ────────────────────────────── */
function taskDateStatus(task, dateStr) {
  const td = calToday();
  if (task.status === 'done')       return 'done';
  if (task.status === 'cancelled')  return 'cancelled';
  if (dateStr < td)                 return 'overdue';
  if (dateStr === td)               return 'today';
  return 'upcoming';
}

/* ============================================================
   RENDER CALENDAR  (dispatches to month/week/agenda)
   ============================================================ */
function renderCalendar() {
  updateCalNav();
  if (calView === 'month')  renderMonthView();
  else if (calView === 'week') renderWeekView();
  else renderAgendaView();
}

/* ── Navigation title ─────────────────────────────────────── */
function updateCalNav() {
  const el = document.getElementById('calNavTitle');
  if (!el) return;
  const ml = calLang()==='mr' ? MONTHS_FULL_MR : MONTHS_FULL_EN;
  if (calView === 'week') {
    const { start, end } = getWeekRange(calCursor);
    el.textContent = calFmt(calDateKey(start)) + ' – ' + calFmt(calDateKey(end));
  } else {
    el.textContent = ml[calCursor.getMonth()] + ' ' + calCursor.getFullYear();
  }
  // Weekday labels
  const wdEl = document.getElementById('calWeekdays');
  if (wdEl) {
    const days = calLang()==='mr' ? DAYS_MR : DAYS_EN;
    wdEl.innerHTML = days.map(d=>`<div class="cal-weekday">${d}</div>`).join('');
  }
}

/* ============================================================
   MONTH VIEW
   ============================================================ */
function renderMonthView() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;

  const year  = calCursor.getFullYear();
  const month = calCursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const td = calToday();

  // Build date range for map
  const from = calDateKey(new Date(year, month, 1));
  const to   = calDateKey(new Date(year, month, daysInMonth));
  const map  = buildDateTaskMap(from, to);

  let html = '';

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-cell cal-cell-empty"></div>`;
  }

  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = calDateKey(new Date(year, month, d));
    const isToday  = dateStr === td;
    const tasks    = map[dateStr] || [];
    const hasNote  = (db.diaryNotes||[]).some(n=>n.date===dateStr);
    const statuses = [...new Set(tasks.map(tk => taskDateStatus(tk, dateStr)))];

    const dotHtml = statuses.map(s => `<span class="cal-dot cal-dot-${s}"></span>`).join('') +
      (hasNote ? `<span class="cal-dot" style="background:#ff9800" title="Has diary note"></span>` : '');
    const taskCount = tasks.length > 0 ? `<span class="cal-task-count">${tasks.length}</span>` : '';
    const noteIcon  = hasNote ? `<span class="cal-note-icon">📝</span>` : '';
    const preview = tasks.slice(0,2).map(tk => {
      const ci = catInfo(tk.category);
      return `<div class="cal-task-chip" style="border-left:3px solid ${ci.color}">${ci.icon} ${tk.name||'Task'}</div>`;
    }).join('');
    const more = tasks.length > 2 ? `<div class="cal-task-more">+${tasks.length-2} more</div>` : '';

    html += `<div class="cal-cell ${isToday?'cal-cell-today':''} ${(tasks.length||hasNote)?'cal-cell-has-tasks':''}"
                  onclick="openDayPanel('${dateStr}')">
      <div class="cal-cell-top">
        <span class="cal-cell-num ${isToday?'cal-num-today':''}">${d}</span>
        <div class="cal-cell-dots">${dotHtml}</div>
        ${taskCount}${noteIcon}
      </div>
      <div class="cal-cell-tasks">${preview}${more}</div>
    </div>`;
  }

  grid.innerHTML = html;
}

/* ============================================================
   WEEK VIEW
   ============================================================ */
function getWeekRange(date) {
  const d     = new Date(date);
  const day   = d.getDay();
  const start = new Date(d); start.setDate(d.getDate() - day);
  const end   = new Date(start); end.setDate(start.getDate() + 6);
  return { start, end };
}

function renderWeekView() {
  const wrap = document.getElementById('calWeekWrap');
  if (!wrap) return;
  const { start, end } = getWeekRange(calCursor);
  const from = calDateKey(start), to = calDateKey(end);
  const map  = buildDateTaskMap(from, to);
  const td   = calToday();
  const days = calLang()==='mr' ? DAYS_EN : DAYS_EN; // keep short

  let html = '<div class="cal-week-grid">';
  for (let i = 0; i < 7; i++) {
    const cur = new Date(start); cur.setDate(start.getDate() + i);
    const ds  = calDateKey(cur);
    const tasks = map[ds] || [];
    const isToday = ds === td;
    html += `<div class="cal-week-col ${isToday?'cal-week-today':''}">
      <div class="cal-week-col-hdr" onclick="openDayPanel('${ds}')">
        <span class="cal-week-day-name">${days[cur.getDay()]}</span>
        <span class="cal-week-day-num ${isToday?'cal-num-today':''}">${cur.getDate()}</span>
      </div>
      <div class="cal-week-tasks">
        ${tasks.length === 0
          ? `<div class="cal-week-empty">—</div>`
          : tasks.map(tk => {
              const ci = catInfo(tk.category);
              const st = taskDateStatus(tk, ds);
              return `<div class="cal-week-task cal-wt-${st}" style="border-left:3px solid ${ci.color}"
                           onclick="event.stopPropagation();openCalTaskModal('${tk.id}')">
                <span>${ci.icon} ${tk.name||'Task'}</span>
                ${tk.time?`<small>${tk.time}</small>`:''}
              </div>`;
            }).join('')}
      </div>
    </div>`;
  }
  html += '</div>';
  wrap.innerHTML = html;
}

/* ============================================================
   AGENDA VIEW
   ============================================================ */
function renderAgendaView() {
  const list = document.getElementById('calAgendaList');
  if (!list) return;
  const td   = calToday();
  // Show next 60 days
  const from = td;
  const toD  = new Date(); toD.setDate(toD.getDate()+60);
  const to   = calDateKey(toD);
  const map  = buildDateTaskMap(from, to);

  const sortedDates = Object.keys(map).sort();
  if (sortedDates.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div>
      <h3>${ct('noCalTasks')||'No upcoming tasks'}</h3></div>`;
    return;
  }

  list.innerHTML = sortedDates.map(ds => {
    const tasks = map[ds];
    return `<div class="cal-agenda-day">
      <div class="cal-agenda-date ${ds===td?'cal-agenda-today':''}">
        <span class="cal-agenda-d">${new Date(ds+'T00:00:00').getDate()}</span>
        <span class="cal-agenda-m">${(calLang()==='mr'?MONTHS_FULL_MR:MONTHS_FULL_EN)[new Date(ds+'T00:00:00').getMonth()].slice(0,3)}</span>
      </div>
      <div class="cal-agenda-tasks">
        ${tasks.map(tk => {
          const ci = catInfo(tk.category);
          const st = taskDateStatus(tk, ds);
          const farm = db.farms.find(f=>f.id===tk.farmId);
          const crop = db.crops.find(c=>c.id===tk.cropId);
          return `<div class="cal-agenda-task cal-at-${st}" style="border-left:4px solid ${ci.color}">
            <div class="cal-at-top">
              <strong>${ci.icon} ${tk.name||'Task'}</strong>
              <div style="display:flex;gap:6px">
                <button class="act-btn act-edit" onclick="openCalTaskModal('${tk.id}')">✏️</button>
                <button class="act-btn act-del" onclick="deleteCalTask('${tk.id}')">🗑</button>
              </div>
            </div>
            <div class="cal-at-meta">
              ${tk.time?`<span>🕐 ${tk.time}</span>`:''}
              ${farm?`<span>🏡 ${farm.name}</span>`:''}
              ${crop?`<span>🌾 ${crop.name}</span>`:''}
              <span class="badge cal-badge-${st}">${st}</span>
              ${tk.recurring&&tk.recurring!=='none'?`<span class="badge badge-purple">🔁 ${tk.recurring}</span>`:''}
            </div>
            ${tk.notes?`<div class="cal-at-notes">${tk.notes}</div>`:''}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

/* ============================================================
   DAY PANEL  (slide-in from right showing tasks for one date)
   ============================================================ */
function openDayPanel(dateStr) {
  calSelectedDate = dateStr;
  const panel = document.getElementById('calDayPanel');
  const ovl   = document.getElementById('calDayPanelOverlay');
  const title = document.getElementById('calDayPanelTitle');
  if (!panel) return;
  title.textContent = calFmt(dateStr);
  renderDayPanelList(dateStr);
  panel.classList.add('open');
  if (ovl) ovl.style.display = 'block';
}
function closeDayPanel() {
  const panel = document.getElementById('calDayPanel');
  const ovl   = document.getElementById('calDayPanelOverlay');
  if (panel) panel.classList.remove('open');
  if (ovl)   ovl.style.display = 'none';
}
function renderDayPanelList(dateStr) {
  const list = document.getElementById('calDayPanelList');
  if (!list) return;
  const td = calToday();
  const map = buildDateTaskMap(dateStr, dateStr);
  const tasks = map[dateStr] || [];
  if (tasks.length === 0) {
    list.innerHTML = `<div class="cal-panel-empty">${ct('noCalTasks')||'No tasks for this date.'}<br>
      <button class="btn btn-primary btn-sm" style="margin-top:12px" onclick="openCalTaskFromPanel()">＋ Add Task</button>
    </div>`;
    return;
  }
  list.innerHTML = tasks.map(tk => {
    const ci   = catInfo(tk.category);
    const st   = taskDateStatus(tk, dateStr);
    const farm = db.farms.find(f=>f.id===tk.farmId);
    const crop = db.crops.find(c=>c.id===tk.cropId);
    return `<div class="cal-panel-task cal-pt-${st}" style="border-left:4px solid ${ci.color}">
      <div class="cal-pt-top">
        <strong>${ci.icon} ${tk.name||'Task'}</strong>
        <div style="display:flex;gap:6px;align-items:center">
          ${tk.status!=='done'
            ? `<button class="cal-done-btn" onclick="markCalTaskDone('${tk.id}')" title="Mark done">✅</button>`
            : `<span style="color:var(--g2);font-size:.8rem">✅ Done</span>`}
          <button class="act-btn act-edit" onclick="openCalTaskModal('${tk.id}')">✏️</button>
          <button class="act-btn act-del" onclick="deleteCalTask('${tk.id}')">🗑</button>
        </div>
      </div>
      <div class="cal-pt-meta">
        ${tk.time?`<span>🕐 ${tk.time}</span>`:''}
        <span class="badge cal-badge-${st}">${st}</span>
        ${catLabel(tk.category)}
        ${farm?`<span>🏡 ${farm.name}</span>`:''}
        ${crop?`<span>🌾 ${crop.name}</span>`:''}
        ${tk.recurring&&tk.recurring!=='none'?`<span>🔁 ${tk.recurring}</span>`:''}
      </div>
      ${tk.notes?`<div class="cal-pt-notes">${tk.notes}</div>`:''}
    </div>`;
  }).join('');
}
function openCalTaskFromPanel() {
  closeDayPanel();
  openCalTaskModal(null, calSelectedDate);
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function calNavigate(dir) {
  if (calView === 'month') {
    calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + dir, 1);
  } else if (calView === 'week') {
    calCursor.setDate(calCursor.getDate() + dir * 7);
    calCursor = new Date(calCursor);
  } else {
    calCursor.setDate(calCursor.getDate() + dir * 30);
    calCursor = new Date(calCursor);
  }
  renderCalendar();
}
function calGoToday() {
  calCursor = new Date();
  renderCalendar();
}
function switchCalView(view, btn) {
  calView = view;
  document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('calMonthView').style.display  = view==='month'  ? 'block' : 'none';
  document.getElementById('calWeekView').style.display   = view==='week'   ? 'block' : 'none';
  document.getElementById('calAgendaView').style.display = view==='agenda' ? 'block' : 'none';
  renderCalendar();
}

/* ============================================================
   TASK MODAL  (Add / Edit)
   ============================================================ */
function openCalTaskModal(id, prefillDate) {
  calEditId = id || null;
  const task = id ? (db.calTasks||[]).find(x=>x.id===id) : null;
  document.getElementById('calTaskModalTitle').textContent =
    task ? '✏️ Edit Task' : '📅 Add Calendar Task';
  document.getElementById('ctId').value = task ? task.id : '';

  // Populate farm dropdown
  const farmSel = document.getElementById('ctFarm');
  if (farmSel) {
    farmSel.innerHTML = `<option value="">General</option>` +
      (db.farms||[]).map(f=>`<option value="${f.id}">${f.name}</option>`).join('');
  }

  if (task) {
    document.getElementById('ctName').value      = task.name      || '';
    document.getElementById('ctFarm').value      = task.farmId    || '';
    calPopulateCrops();
    document.getElementById('ctCrop').value      = task.cropId    || '';
    document.getElementById('ctCat').value       = task.category  || 'other';
    document.getElementById('ctDate').value      = task.date      || calToday();
    document.getElementById('ctTime').value      = task.time      || '';
    document.getElementById('ctPriority').value  = task.priority  || 'medium';
    document.getElementById('ctStatus').value    = task.status    || 'pending';
    document.getElementById('ctRecurring').value = task.recurring || 'none';
    document.getElementById('ctRecurringEnd').value      = task.recurringEnd      || '';
    document.getElementById('ctRecurringInterval').value = task.recurringInterval || '7';
    document.getElementById('ctNotif').value     = task.notif     || 'none';
    document.getElementById('ctNotes').value     = task.notes     || '';
  } else {
    document.getElementById('ctName').value      = '';
    document.getElementById('ctFarm').value      = db.farms&&db.farms.length===1?db.farms[0].id:'';
    calPopulateCrops();
    document.getElementById('ctCrop').value      = '';
    document.getElementById('ctCat').value       = 'other';
    document.getElementById('ctDate').value      = prefillDate || calSelectedDate || calToday();
    document.getElementById('ctTime').value      = '08:00';
    document.getElementById('ctPriority').value  = 'medium';
    document.getElementById('ctStatus').value    = 'pending';
    document.getElementById('ctRecurring').value = 'none';
    document.getElementById('ctRecurringEnd').value      = '';
    document.getElementById('ctRecurringInterval').value = '7';
    document.getElementById('ctNotif').value     = 'onday';
    document.getElementById('ctNotes').value     = '';
  }
  toggleRecurringFields();
  openModal('calTaskModal');
}

function calPopulateCrops() {
  const farmId  = document.getElementById('ctFarm')?.value || '';
  const cropSel = document.getElementById('ctCrop');
  if (!cropSel) return;
  const crops = farmId ? (db.crops||[]).filter(c=>c.farmId===farmId) : (db.crops||[]);
  cropSel.innerHTML = `<option value="">General</option>` +
    crops.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

function toggleRecurringFields() {
  const val = document.getElementById('ctRecurring')?.value || 'none';
  const endWrap = document.getElementById('ctRecurringEndWrap');
  const intWrap = document.getElementById('ctRecurringIntervalWrap');
  if (endWrap) endWrap.style.display  = val !== 'none' ? 'flex' : 'none';
  if (intWrap) intWrap.style.display  = val === 'custom' ? 'flex' : 'none';
}

function saveCalTask() {
  const name = document.getElementById('ctName').value.trim();
  const date = document.getElementById('ctDate').value;
  if (!name) { showToast('Task name required','error'); return; }
  if (!date) { showToast('Date required','error'); return; }

  if (!db.calTasks) db.calTasks = [];

  const task = {
    id:                calEditId || calUID(),
    name,
    farmId:            document.getElementById('ctFarm').value      || '',
    cropId:            document.getElementById('ctCrop').value      || '',
    category:          document.getElementById('ctCat').value       || 'other',
    date,
    time:              document.getElementById('ctTime').value      || '',
    priority:          document.getElementById('ctPriority').value  || 'medium',
    status:            document.getElementById('ctStatus').value    || 'pending',
    recurring:         document.getElementById('ctRecurring').value || 'none',
    recurringEnd:      document.getElementById('ctRecurringEnd').value      || '',
    recurringInterval: document.getElementById('ctRecurringInterval').value || '7',
    notif:             document.getElementById('ctNotif').value     || 'none',
    notes:             document.getElementById('ctNotes').value.trim(),
    notified:          false,
    createdAt:         calEditId ? (db.calTasks.find(x=>x.id===calEditId)?.createdAt||new Date().toISOString()) : new Date().toISOString(),
    updatedAt:         new Date().toISOString()
  };

  if (calEditId) {
    const idx = db.calTasks.findIndex(x=>x.id===calEditId);
    if (idx > -1) db.calTasks[idx] = task; else db.calTasks.push(task);
  } else {
    db.calTasks.push(task);
  }

  saveDB();
  closeModal('calTaskModal');
  renderCalendar();
  if (calSelectedDate) renderDayPanelList(calSelectedDate);
  scheduleCalNotifications();
  showToast(name + ' saved ✅');
}

function deleteCalTask(id) {
  const task = (db.calTasks||[]).find(x=>x.id===id);
  if (!task) return;
  confirmAction(`Delete task "${task.name}"?`, async () => {
    db.calTasks = db.calTasks.filter(x=>x.id!==id);
    saveDB();
    if (typeof deleteFromFirestore === 'function') await deleteFromFirestore('calTasks', id);
    renderCalendar();
    if (calSelectedDate) renderDayPanelList(calSelectedDate);
    showToast('Task deleted');
  });
}

function markCalTaskDone(id) {
  const task = (db.calTasks||[]).find(x=>x.id===id);
  if (!task) return;
  task.status = 'done';
  saveDB();
  if (calSelectedDate) renderDayPanelList(calSelectedDate);
  renderCalendar();
  showToast('✅ Marked as done!');
}

/* ============================================================
   CROP SCHEDULE TEMPLATE GENERATOR
   Auto-creates calendar tasks when a new crop is added
   ============================================================ */
function generateCropScheduleTemplate(crop) {
  if (!crop || !crop.plantDate) return;
  if (!db.calTasks) db.calTasks = [];

  const plant   = new Date(crop.plantDate+'T00:00:00');
  const harvest = crop.harvestDate ? new Date(crop.harvestDate+'T00:00:00') : null;
  const tasks   = [];

  function addDays(base, days) {
    const d = new Date(base); d.setDate(d.getDate()+days); return calDateKey(d);
  }

  // 1. Fertilizer — 3 times during growing season
  tasks.push({ name:'First Fertilizer Application', category:'fertilizer', date: addDays(plant, 7),  recurring:'none' });
  tasks.push({ name:'Second Fertilizer Application', category:'fertilizer', date: addDays(plant, 35), recurring:'none' });
  tasks.push({ name:'Third Fertilizer Application',  category:'fertilizer', date: addDays(plant, 70), recurring:'none' });

  // 2. Irrigation — weekly recurring until harvest
  tasks.push({
    name: 'Weekly Irrigation',
    category: 'irrigation',
    date: addDays(plant, 3),
    recurring: 'weekly',
    recurringEnd: harvest ? calDateKey(harvest) : addDays(plant, 120),
    recurringInterval: '7'
  });

  // 3. Spraying — bi-weekly
  tasks.push({
    name: 'Pesticide / Fungicide Spray',
    category: 'spraying',
    date: addDays(plant, 14),
    recurring: 'custom',
    recurringEnd: harvest ? calDateKey(new Date(harvest.getTime()-7*86400000)) : addDays(plant, 100),
    recurringInterval: '14'
  });

  // 4. Harvesting reminder
  if (harvest) {
    tasks.push({ name: 'Harvest Preparation', category:'harvesting', date: addDays(harvest, -7), recurring:'none' });
    tasks.push({ name: 'Harvest Day',          category:'harvesting', date: calDateKey(harvest),  recurring:'none' });
  }

  // Save all template tasks
  tasks.forEach(t => {
    db.calTasks.push({
      id:                calUID(),
      name:              t.name,
      farmId:            crop.farmId  || '',
      cropId:            crop.id      || '',
      category:          t.category,
      date:              t.date,
      time:              '07:00',
      priority:          'medium',
      status:            'pending',
      recurring:         t.recurring         || 'none',
      recurringEnd:      t.recurringEnd      || '',
      recurringInterval: t.recurringInterval || '7',
      notif:             'onday',
      notes:             `Auto-generated for ${crop.name}`,
      notified:          false,
      isTemplate:        true,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString()
    });
  });

  saveDB();
  showToast(ct('calTemplateAdded') || 'Crop schedule template added to calendar ✅', 'info');
}

/* ============================================================
   NOTIFICATIONS  (browser push for calendar tasks)
   ============================================================ */
function scheduleCalNotifications() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const td       = calToday();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  const tomStr   = calDateKey(tomorrow);
  const d2       = new Date(); d2.setDate(d2.getDate()+2);
  const d2Str    = calDateKey(d2);
  const d7       = new Date(); d7.setDate(d7.getDate()+7);
  const d7Str    = calDateKey(d7);

  (db.calTasks||[]).forEach(task => {
    if (task.status === 'done' || task.notified) return;
    const dates = getTaskDates(task, td, d7Str);
    let shouldNotify = false;

    dates.forEach(ds => {
      if (task.notif === 'onday'  && ds === td)     shouldNotify = true;
      if (task.notif === '1day'   && ds === tomStr) shouldNotify = true;
      if (task.notif === '2day'   && ds === d2Str)  shouldNotify = true;
      if (task.notif === '1week'  && ds === d7Str)  shouldNotify = true;
    });

    if (shouldNotify) {
      const farm = db.farms.find(f=>f.id===task.farmId);
      const cat  = catInfo(task.category);
      try {
        new Notification(`${cat.icon} Mali Farm — ${task.name}`, {
          body: [
            farm ? `Farm: ${farm.name}` : '',
            `Date: ${calFmt(task.date)}`,
            task.time ? `Time: ${task.time}` : '',
            task.notes || ''
          ].filter(Boolean).join('\n'),
          icon: './public/favicon.svg'
        });
      } catch(e) { /* notifications blocked */ }
      task.notified = true;
      saveDB();
    }
  });
}

// Run notification check every minute
setInterval(scheduleCalNotifications, 60000);

/* ============================================================
   INIT — called after Firebase loads data
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize when user lands on calendar page
  const origShowPage = window.showPage;
  if (origShowPage) {
    // already hooked in app.js via the switch/case
  }
  // Initial calendar render happens via initApp → showPage('dashboard') chain
  // The calendar renders when user clicks the calendar nav item
});

/* ============================================================
   FARM DIARY — complete upgrade
   Every date is a diary page with timeline, notes, photos,
   expenses, revenue, tasks, weather and worker/crop activities.
   ============================================================ */

/* ── Diary state ─────────────────────────────────────────── */
let diaryDate      = null;   // currently open diary date
let diaryEditNoteId= null;   // note being edited
let diarySearchQ   = '';     // search query

/* ============================================================
   OPEN DIARY PAGE  (replaces old openDayPanel)
   ============================================================ */
function openDayPanel(dateStr) {
  calSelectedDate = dateStr;
  diaryDate       = dateStr;
  openDiaryPage(dateStr);
}

function openDiaryPage(dateStr) {
  const panel = document.getElementById('calDayPanel');
  const ovl   = document.getElementById('calDayPanelOverlay');
  if (!panel) return;

  diaryDate = dateStr;
  calSelectedDate = dateStr;

  // Build full diary content
  renderDiaryPage(dateStr);

  panel.classList.add('open');
  if (ovl) ovl.style.display = 'block';
}

function closeDayPanel() {
  const panel = document.getElementById('calDayPanel');
  const ovl   = document.getElementById('calDayPanelOverlay');
  if (panel) panel.classList.remove('open');
  if (ovl)   ovl.style.display = 'none';
}

/* ============================================================
   RENDER FULL DIARY PAGE
   ============================================================ */
function renderDiaryPage(dateStr) {
  const panel = document.getElementById('calDayPanel');
  if (!panel) return;

  const td      = calToday();
  const isToday = dateStr === td;
  const isPast  = dateStr < td;
  const dayName = new Date(dateStr+'T00:00:00').toLocaleDateString(
    calLang()==='mr'?'mr-IN':'en-IN', {weekday:'long'});
  const fullDate = calFmt(dateStr);

  // Gather all data for this date
  const tasks    = getDiaryTasks(dateStr);
  const expenses = getDiaryExpenses(dateStr);
  const revenue  = getDiaryRevenue(dateStr);
  const notes    = getDiaryNotes(dateStr);
  const photos   = getDiaryPhotos(dateStr);
  const weather  = getDiaryWeather(dateStr);

  const totalExp = expenses.reduce((s,e)=>s+Number(e.amount),0);
  const totalRev = revenue.reduce((s,r)=>s+Number(r.amount),0);
  const doneTasks   = tasks.filter(t=>t.status==='done').length;
  const pendTasks   = tasks.filter(t=>t.status!=='done').length;

  panel.innerHTML = `
    <!-- DIARY HEADER -->
    <div class="diary-hdr">
      <div class="diary-hdr-left">
        <div class="diary-date-badge ${isToday?'diary-today-badge':''}">
          <span class="diary-day-num">${new Date(dateStr+'T00:00:00').getDate()}</span>
          <span class="diary-day-month">${(calLang()==='mr'?MONTHS_FULL_MR:MONTHS_FULL_EN)[new Date(dateStr+'T00:00:00').getMonth()].slice(0,3).toUpperCase()}</span>
        </div>
        <div>
          <div class="diary-full-date">${fullDate}</div>
          <div class="diary-day-name">${dayName}${isToday?' 📍 Today':''}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <button class="btn btn-primary btn-sm" onclick="openCalTaskFromPanel()">＋ ${calLang()==='mr'?'काम':'Task'}</button>
        <button class="btn btn-outline btn-sm" onclick="openDiaryNoteModal()">📝 ${calLang()==='mr'?'नोंद':'Note'}</button>
        <button class="modal-x" onclick="closeDayPanel()">✕</button>
      </div>
    </div>

    <!-- DIARY SUMMARY STRIP -->
    <div class="diary-summary">
      <div class="diary-sum-item">
        <span class="diary-sum-icon">📋</span>
        <div><div class="diary-sum-val">${tasks.length}</div><div class="diary-sum-label">${calLang()==='mr'?'कामे':'Tasks'}</div></div>
      </div>
      <div class="diary-sum-item">
        <span class="diary-sum-icon">✅</span>
        <div><div class="diary-sum-val">${doneTasks}</div><div class="diary-sum-label">${calLang()==='mr'?'पूर्ण':'Done'}</div></div>
      </div>
      <div class="diary-sum-item" style="color:var(--red)">
        <span class="diary-sum-icon">💸</span>
        <div><div class="diary-sum-val">${rupee(totalExp)}</div><div class="diary-sum-label">${calLang()==='mr'?'खर्च':'Expenses'}</div></div>
      </div>
      <div class="diary-sum-item" style="color:var(--g2)">
        <span class="diary-sum-icon">💰</span>
        <div><div class="diary-sum-val">${rupee(totalRev)}</div><div class="diary-sum-label">${calLang()==='mr'?'उत्पन्न':'Revenue'}</div></div>
      </div>
      <div class="diary-sum-item">
        <span class="diary-sum-icon">📝</span>
        <div><div class="diary-sum-val">${notes.length}</div><div class="diary-sum-label">${calLang()==='mr'?'नोंदी':'Notes'}</div></div>
      </div>
      ${weather ? `<div class="diary-sum-item">
        <span class="diary-sum-icon">${weather.icon||'🌤️'}</span>
        <div><div class="diary-sum-val">${weather.temp||'—'}</div><div class="diary-sum-label">${weather.desc||'Weather'}</div></div>
      </div>` : ''}
    </div>

    <!-- TABS -->
    <div class="diary-tabs" id="diaryTabs">
      <button class="diary-tab active" onclick="switchDiaryTab('timeline',this)">📜 ${calLang()==='mr'?'टाइमलाइन':'Timeline'}</button>
      <button class="diary-tab" onclick="switchDiaryTab('tasks',this)">📋 ${calLang()==='mr'?'कामे':'Tasks'}</button>
      <button class="diary-tab" onclick="switchDiaryTab('notes',this)">📝 ${calLang()==='mr'?'नोंदी':'Notes'}</button>
      <button class="diary-tab" onclick="switchDiaryTab('finance',this)">💰 ${calLang()==='mr'?'वित्त':'Finance'}</button>
      <button class="diary-tab" onclick="switchDiaryTab('photos',this)">📷 ${calLang()==='mr'?'फोटो':'Photos'}</button>
    </div>

    <!-- TAB PANES -->
    <div id="diaryTabContent">
      <!-- Timeline tab (default) -->
      <div id="dtTimeline" class="diary-tab-pane active">
        ${renderTimelineHTML(dateStr, tasks, expenses, revenue, notes, photos)}
      </div>

      <!-- Tasks tab -->
      <div id="dtTasks" class="diary-tab-pane" style="display:none">
        ${renderDiaryTasksHTML(dateStr, tasks)}
      </div>

      <!-- Notes tab -->
      <div id="dtNotes" class="diary-tab-pane" style="display:none">
        ${renderDiaryNotesHTML(dateStr, notes)}
      </div>

      <!-- Finance tab -->
      <div id="dtFinance" class="diary-tab-pane" style="display:none">
        ${renderDiaryFinanceHTML(expenses, revenue)}
      </div>

      <!-- Photos tab -->
      <div id="dtPhotos" class="diary-tab-pane" style="display:none">
        ${renderDiaryPhotosHTML(dateStr, photos)}
      </div>
    </div>
  `;
}

/* ── Tab switcher inside diary ───────────────────────────── */
function switchDiaryTab(tab, btn) {
  document.querySelectorAll('#diaryTabs .diary-tab').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.diary-tab-pane').forEach(p=>p.style.display='none');
  if (btn) btn.classList.add('active');
  const pane = document.getElementById('dt'+tab.charAt(0).toUpperCase()+tab.slice(1));
  if (pane) pane.style.display = 'block';
}

/* ============================================================
   DATA GETTERS for diary
   ============================================================ */
function getDiaryTasks(dateStr) {
  const map = buildDateTaskMap(dateStr, dateStr);
  return (map[dateStr] || []).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
}
function getDiaryExpenses(dateStr) {
  return (db.expenses||[]).filter(e=>e.date===dateStr)
    .sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
}
function getDiaryRevenue(dateStr) {
  return (db.revenue||[]).filter(r=>r.date===dateStr)
    .sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
}
function getDiaryNotes(dateStr) {
  return (db.diaryNotes||[]).filter(n=>n.date===dateStr)
    .sort((a,b)=>(a.createdAt||'').localeCompare(b.createdAt||''));
}
function getDiaryPhotos(dateStr) {
  return (db.diaryNotes||[]).filter(n=>n.date===dateStr && n.photoData)
    .flatMap(n=>n.photoData ? [{id:n.id, data:n.photoData, caption:n.text, time:n.createdAt}] : []);
}
function getDiaryWeather(dateStr) {
  return (db.diaryWeather||{})[dateStr] || null;
}

/* ============================================================
   TIMELINE HTML  — chronological view of everything
   ============================================================ */
function renderTimelineHTML(dateStr, tasks, expenses, revenue, notes, photos) {
  // Merge all items into one timeline
  const items = [];

  tasks.forEach(t => items.push({
    time: t.time || '00:00', type: 'task', data: t,
    sort: (t.time||'00:00')
  }));
  expenses.forEach(e => items.push({
    time: e.createdAt ? new Date(e.createdAt).toTimeString().slice(0,5) : '00:01',
    type: 'expense', data: e,
    sort: e.createdAt||'00:01'
  }));
  revenue.forEach(r => items.push({
    time: r.createdAt ? new Date(r.createdAt).toTimeString().slice(0,5) : '00:02',
    type: 'revenue', data: r,
    sort: r.createdAt||'00:02'
  }));
  notes.forEach(n => items.push({
    time: n.createdAt ? new Date(n.createdAt).toTimeString().slice(0,5) : '00:03',
    type: 'note', data: n,
    sort: n.createdAt||'00:03'
  }));

  if (items.length === 0) return `<div class="diary-empty">
    <div style="font-size:2.5rem">📖</div>
    <p>${calLang()==='mr'?'या तारखेला कोणतीही नोंद नाही.':'Nothing recorded for this date yet.'}</p>
    <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
      <button class="btn btn-primary btn-sm" onclick="openCalTaskFromPanel()">＋ ${calLang()==='mr'?'काम':'Task'}</button>
      <button class="btn btn-outline btn-sm" onclick="openDiaryNoteModal()">📝 ${calLang()==='mr'?'नोंद':'Note'}</button>
    </div>
  </div>`;

  items.sort((a,b)=>a.sort.localeCompare(b.sort));

  return `<div class="diary-timeline">` + items.map(item => {
    if (item.type === 'task') {
      const t  = item.data;
      const ci = catInfo(t.category);
      const st = taskDateStatus(t, dateStr);
      const farm = db.farms.find(f=>f.id===t.farmId);
      const crop = db.crops.find(c=>c.id===t.cropId);
      return `<div class="tl-item tl-task">
        <div class="tl-dot" style="background:${ci.color}">${ci.icon}</div>
        <div class="tl-content">
          <div class="tl-top">
            <strong>${t.name}</strong>
            <div style="display:flex;gap:5px;align-items:center">
              ${t.time?`<span class="tl-time">${t.time}</span>`:''}
              <span class="cal-badge-${st} tl-badge">${st}</span>
              ${t.status!=='done'
                ?`<button class="cal-done-btn" onclick="markCalTaskDone('${t.id}');renderDiaryPage('${dateStr}')">✅</button>`:''}
              <button class="act-btn act-edit" onclick="openCalTaskModal('${t.id}')">✏️</button>
              <button class="act-btn act-del" onclick="deleteCalTask('${t.id}')">🗑</button>
            </div>
          </div>
          <div class="tl-meta">
            ${farm?`🏡 ${farm.name}`:''} ${crop?`🌾 ${crop.name}`:''}
            ${t.priority?`<span class="tl-priority tl-p-${t.priority}">${t.priority}</span>`:''}
          </div>
          ${t.notes?`<div class="tl-note-text">${t.notes}</div>`:''}
        </div>
      </div>`;
    }
    if (item.type === 'expense') {
      const e = item.data;
      const farm = db.farms.find(f=>f.id===e.farmId);
      const crop = db.crops.find(c=>c.id===e.cropId);
      return `<div class="tl-item tl-expense">
        <div class="tl-dot" style="background:#f44336">💸</div>
        <div class="tl-content">
          <div class="tl-top">
            <strong>${e.category||'Expense'}</strong>
            <div style="display:flex;gap:5px;align-items:center">
              <span class="tl-amount tl-exp">${rupee(e.amount)}</span>
              <button class="act-btn act-edit" onclick="closeDayPanel();openExpModal('${e.id}')">✏️</button>
            </div>
          </div>
          <div class="tl-meta">
            ${e.description||''} ${farm?`· 🏡 ${farm.name}`:''} ${crop?`· 🌾 ${crop.name}`:''}
            ${e.payment?`· ${e.payment}`:''}
          </div>
        </div>
      </div>`;
    }
    if (item.type === 'revenue') {
      const r = item.data;
      const farm = db.farms.find(f=>f.id===r.farmId);
      const crop = db.crops.find(c=>c.id===r.cropId);
      return `<div class="tl-item tl-revenue">
        <div class="tl-dot" style="background:#4caf50">💰</div>
        <div class="tl-content">
          <div class="tl-top">
            <strong>${crop?crop.name:calLang()==='mr'?'विक्री':'Sale'}</strong>
            <div style="display:flex;gap:5px;align-items:center">
              <span class="tl-amount tl-rev">${rupee(r.amount)}</span>
              <button class="act-btn act-edit" onclick="closeDayPanel();openRevModal('${r.id}')">✏️</button>
            </div>
          </div>
          <div class="tl-meta">
            ${r.qty?r.qty+' '+r.unit:''} ${r.buyer?`· ${r.buyer}`:''} ${farm?`· 🏡 ${farm.name}`:''}
          </div>
        </div>
      </div>`;
    }
    if (item.type === 'note') {
      const n = item.data;
      return `<div class="tl-item tl-note">
        <div class="tl-dot" style="background:#ff9800">📝</div>
        <div class="tl-content">
          <div class="tl-top">
            <strong>${n.title||calLang()==='mr'?'नोंद':'Note'}</strong>
            <div style="display:flex;gap:5px">
              <button class="act-btn act-edit" onclick="openDiaryNoteModal('${n.id}')">✏️</button>
              <button class="act-btn act-del" onclick="deleteDiaryNote('${n.id}','${dateStr}')">🗑</button>
            </div>
          </div>
          ${n.photoData?`<img src="${n.photoData}" class="tl-photo" onclick="openPhotoViewer('${n.id}')" />`:''}
          <div class="tl-note-body">${formatNoteText(n.text)}</div>
          ${n.checklist&&n.checklist.length?renderChecklistHTML(n.checklist, n.id):''}
          ${n.tags&&n.tags.length?`<div class="tl-tags">${n.tags.map(g=>`<span class="tl-tag">#${g}</span>`).join('')}</div>`:''}
        </div>
      </div>`;
    }
    return '';
  }).join('') + `</div>`;
}

/* ── Format note text (supports **bold**, *italic*, checklists) */
function formatNoteText(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

/* ── Render checklist ─────────────────────────────────────── */
function renderChecklistHTML(checklist, noteId) {
  return `<div class="tl-checklist">` +
    checklist.map((item, i) =>
      `<label class="tl-check-item">
        <input type="checkbox" ${item.done?'checked':''} onchange="toggleCheckItem('${noteId}',${i},this.checked)"/>
        <span ${item.done?'style="text-decoration:line-through;opacity:.6"':''}>${item.text}</span>
      </label>`
    ).join('') + `</div>`;
}

function toggleCheckItem(noteId, idx, done) {
  const note = (db.diaryNotes||[]).find(n=>n.id===noteId);
  if (!note || !note.checklist) return;
  note.checklist[idx].done = done;
  saveDB();
}

/* ============================================================
   DIARY TASKS TAB HTML
   ============================================================ */
function renderDiaryTasksHTML(dateStr, tasks) {
  if (tasks.length === 0) return `<div class="diary-empty">
    <div style="font-size:2rem">📋</div>
    <p>${calLang()==='mr'?'या तारखेला कोणतेही काम नाही.':'No tasks for this date.'}</p>
    <button class="btn btn-primary btn-sm" style="margin-top:10px" onclick="openCalTaskFromPanel()">＋ Add Task</button>
  </div>`;

  const done = tasks.filter(t=>t.status==='done');
  const pend = tasks.filter(t=>t.status!=='done');

  const renderGroup = (list, label) => list.length === 0 ? '' : `
    <div class="diary-section-label">${label}</div>
    ${list.map(t => {
      const ci   = catInfo(t.category);
      const farm = db.farms.find(f=>f.id===t.farmId);
      const crop = db.crops.find(c=>c.id===t.cropId);
      const st   = taskDateStatus(t, dateStr);
      return `<div class="diary-task-row cal-pt-${st}" style="border-left:4px solid ${ci.color}">
        <div class="diary-task-check">
          ${t.status==='done'
            ?`<span class="diary-done-mark">✅</span>`
            :`<button class="cal-done-btn" onclick="markCalTaskDone('${t.id}');renderDiaryPage('${dateStr}')">○</button>`}
        </div>
        <div style="flex:1">
          <div class="diary-task-name ${t.status==='done'?'diary-task-done':''}">${ci.icon} ${t.name}</div>
          <div class="tl-meta">
            ${t.time?`🕐 ${t.time}`:''} ${farm?`🏡 ${farm.name}`:''} ${crop?`🌾 ${crop.name}`:''}
            <span class="tl-priority tl-p-${t.priority}">${t.priority||''}</span>
          </div>
          ${t.notes?`<div class="tl-note-text">${t.notes}</div>`:''}
        </div>
        <div style="display:flex;gap:4px">
          <button class="act-btn act-edit" onclick="openCalTaskModal('${t.id}')">✏️</button>
          <button class="act-btn act-del"  onclick="deleteCalTask('${t.id}')">🗑</button>
        </div>
      </div>`;
    }).join('')}`;

  return `<div style="padding:4px 0">
    ${renderGroup(pend, calLang()==='mr'?'⏳ प्रलंबित':'⏳ Pending')}
    ${renderGroup(done, calLang()==='mr'?'✅ पूर्ण':'✅ Completed')}
    <div style="text-align:center;padding:14px 0">
      <button class="btn btn-outline btn-sm" onclick="openCalTaskFromPanel()">＋ Add Task</button>
    </div>
  </div>`;
}

/* ============================================================
   DIARY FINANCE TAB HTML
   ============================================================ */
function renderDiaryFinanceHTML(expenses, revenue) {
  const totalExp = expenses.reduce((s,e)=>s+Number(e.amount),0);
  const totalRev = revenue.reduce((s,r)=>s+Number(r.amount),0);
  const profit   = totalRev - totalExp;

  return `<div style="padding:4px 0">
    <div class="diary-fin-summary">
      <div class="diary-fin-card" style="border-top:3px solid var(--red)">
        <div class="diary-fin-label">💸 ${calLang()==='mr'?'एकूण खर्च':'Total Expenses'}</div>
        <div class="diary-fin-val" style="color:var(--red)">${rupee(totalExp)}</div>
      </div>
      <div class="diary-fin-card" style="border-top:3px solid var(--g4)">
        <div class="diary-fin-label">💰 ${calLang()==='mr'?'एकूण उत्पन्न':'Total Revenue'}</div>
        <div class="diary-fin-val" style="color:var(--g2)">${rupee(totalRev)}</div>
      </div>
      <div class="diary-fin-card" style="border-top:3px solid ${profit>=0?'var(--g4)':'var(--red)'}">
        <div class="diary-fin-label">📊 ${calLang()==='mr'?'नफा/तोटा':'Profit / Loss'}</div>
        <div class="diary-fin-val ${profit>=0?'profit-pos':'profit-neg'}">${rupee(profit)}</div>
      </div>
    </div>

    ${expenses.length > 0 ? `
    <div class="diary-section-label">💸 ${calLang()==='mr'?'खर्च':'Expenses'}</div>
    ${expenses.map(e=>{
      const farm = db.farms.find(f=>f.id===e.farmId);
      const crop = db.crops.find(c=>c.id===e.cropId);
      return `<div class="diary-fin-row">
        <div>
          <strong>${e.category}</strong>
          <div class="tl-meta">${e.description||''} ${farm?`🏡 ${farm.name}`:''} ${crop?`🌾 ${crop.name}`:''} · ${e.payment||''}</div>
        </div>
        <span style="color:var(--red);font-weight:700">${rupee(e.amount)}</span>
      </div>`;
    }).join('')}` : ''}

    ${revenue.length > 0 ? `
    <div class="diary-section-label">💰 ${calLang()==='mr'?'उत्पन्न':'Revenue'}</div>
    ${revenue.map(r=>{
      const farm = db.farms.find(f=>f.id===r.farmId);
      const crop = db.crops.find(c=>c.id===r.cropId);
      return `<div class="diary-fin-row">
        <div>
          <strong>${crop?crop.name:calLang()==='mr'?'विक्री':'Sale'}</strong>
          <div class="tl-meta">${r.qty?r.qty+' '+r.unit:''} ${r.buyer?`· ${r.buyer}`:''} ${farm?`· 🏡 ${farm.name}`:''}</div>
        </div>
        <span style="color:var(--g2);font-weight:700">${rupee(r.amount)}</span>
      </div>`;
    }).join('')}` : ''}

    ${expenses.length===0&&revenue.length===0?`<div class="diary-empty">
      <p>${calLang()==='mr'?'या तारखेला कोणतेही आर्थिक व्यवहार नाही.':'No financial records for this date.'}</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:10px">
        <button class="btn btn-outline btn-sm" onclick="closeDayPanel();openExpModal()">+ Expense</button>
        <button class="btn btn-outline btn-sm" onclick="closeDayPanel();openRevModal()">+ Revenue</button>
      </div>
    </div>`:''}
  </div>`;
}

/* ============================================================
   DIARY NOTES TAB HTML
   ============================================================ */
function renderDiaryNotesHTML(dateStr, notes) {
  return `<div style="padding:4px 0">
    <div style="text-align:right;margin-bottom:12px">
      <button class="btn btn-primary btn-sm" onclick="openDiaryNoteModal()">＋ ${calLang()==='mr'?'नोंद जोडा':'Add Note'}</button>
    </div>
    ${notes.length === 0 ? `<div class="diary-empty">
      <div style="font-size:2rem">📝</div>
      <p>${calLang()==='mr'?'कोणत्याही नोंदी नाहीत.':'No notes yet.'}</p>
    </div>` :
    notes.map(n => `<div class="diary-note-card">
      <div class="diary-note-hdr">
        <strong>${n.title||calLang()==='mr'?'नोंद':'Note'}</strong>
        <div style="display:flex;gap:5px;align-items:center">
          <span class="diary-note-time">${n.createdAt?new Date(n.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''}</span>
          <button class="act-btn act-edit" onclick="openDiaryNoteModal('${n.id}')">✏️</button>
          <button class="act-btn act-del"  onclick="deleteDiaryNote('${n.id}','${dateStr}')">🗑</button>
        </div>
      </div>
      ${n.photoData?`<img src="${n.photoData}" class="diary-note-photo" onclick="openPhotoViewer('${n.id}')" />`:''}
      <div class="diary-note-text">${formatNoteText(n.text)}</div>
      ${n.checklist&&n.checklist.length?renderChecklistHTML(n.checklist,n.id):''}
      ${n.tags&&n.tags.length?`<div class="tl-tags">${n.tags.map(g=>`<span class="tl-tag">#${g}</span>`).join('')}</div>`:''}
    </div>`).join('')}
  </div>`;
}

/* ============================================================
   DIARY PHOTOS TAB HTML
   ============================================================ */
function renderDiaryPhotosHTML(dateStr, photos) {
  return `<div style="padding:4px 0">
    <div style="text-align:right;margin-bottom:12px">
      <button class="btn btn-primary btn-sm" onclick="openDiaryNoteModal(null,true)">📷 ${calLang()==='mr'?'फोटो जोडा':'Add Photo'}</button>
    </div>
    ${photos.length === 0
      ? `<div class="diary-empty"><div style="font-size:2rem">📷</div>
         <p>${calLang()==='mr'?'कोणतेही फोटो नाहीत.':'No photos yet.'}</p></div>`
      : `<div class="diary-photo-grid">
          ${photos.map(p=>`
            <div class="diary-photo-item" onclick="openPhotoViewer('${p.id}')">
              <img src="${p.data}" alt="Farm photo"/>
              ${p.caption?`<div class="diary-photo-cap">${p.caption.slice(0,40)}</div>`:''}
            </div>`).join('')}
         </div>`}
  </div>`;
}

/* ============================================================
   DIARY NOTE MODAL  (Add / Edit note with photo + checklist)
   ============================================================ */
function openDiaryNoteModal(id, photoMode) {
  diaryEditNoteId = id || null;
  const note = id ? (db.diaryNotes||[]).find(n=>n.id===id) : null;

  // Build modal dynamically
  let modal = document.getElementById('diaryNoteModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'diaryNoteModal';
    modal.className = 'modal-back';
    document.body.appendChild(modal);
  }

  const checklistHtml = note && note.checklist ? note.checklist.map((item,i)=>
    `<div class="dnc-row" id="dnc-${i}">
      <input type="checkbox" ${item.done?'checked':''} class="dnc-check" onchange="dnCheckChange(${i},this.checked)"/>
      <input type="text" class="fi dnc-text" value="${item.text||''}" placeholder="Checklist item…" oninput="dnCheckTextChange(${i},this.value)"/>
      <button onclick="removeDnCheckItem(${i})" class="act-btn act-del" style="flex-shrink:0">✕</button>
    </div>`
  ).join('') : '';

  modal.innerHTML = `<div class="modal" style="max-width:540px">
    <div class="modal-hdr">
      <h3>${note?'✏️ Edit Note':'📝 Add Note'}</h3>
      <button class="modal-x" onclick="closeModal('diaryNoteModal')">✕</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="fg">
        <label>Title / शीर्षक</label>
        <input class="fi" id="dnTitle" value="${note?note.title||'':''}" placeholder="Note title (optional)"/>
      </div>
      <div class="fg">
        <label>Note / नोंद</label>
        <textarea class="fi" id="dnText" rows="5" placeholder="Write your note here… Supports **bold**, *italic*">${note?note.text||'':''}</textarea>
      </div>

      <!-- Checklist -->
      <div class="fg">
        <label>☑️ Checklist</label>
        <div id="dnChecklist">${checklistHtml}</div>
        <button class="btn btn-outline btn-sm" style="margin-top:6px;align-self:flex-start" onclick="addDnCheckItem()">＋ Add Item</button>
      </div>

      <!-- Tags -->
      <div class="fg">
        <label>🏷 Tags (comma separated)</label>
        <input class="fi" id="dnTags" value="${note&&note.tags?note.tags.join(', '):''}" placeholder="e.g. fertilizer, tomato, irrigation"/>
      </div>

      <!-- Photo -->
      <div class="fg">
        <label>📷 Photo (optional)</label>
        ${note&&note.photoData?`<img src="${note.photoData}" style="width:100%;max-height:180px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>`:'' }
        <input type="file" class="fi" id="dnPhoto" accept="image/*" onchange="previewDnPhoto(this)"/>
        <div id="dnPhotoPreview" style="margin-top:6px"></div>
      </div>

      <!-- Farm/Crop link -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="fg">
          <label>Farm</label>
          <select class="fi" id="dnFarm" onchange="dnPopulateCrops()">
            <option value="">General</option>
            ${(db.farms||[]).map(f=>`<option value="${f.id}" ${note&&note.farmId===f.id?'selected':''}>${f.name}</option>`).join('')}
          </select>
        </div>
        <div class="fg">
          <label>Crop</label>
          <select class="fi" id="dnCrop">
            <option value="">General</option>
            ${(db.crops||[]).filter(c=>!note||!note.farmId||c.farmId===note.farmId).map(c=>`<option value="${c.id}" ${note&&note.cropId===c.id?'selected':''}>${c.name}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-outline" onclick="closeModal('diaryNoteModal')">Cancel</button>
      <button class="btn btn-primary" onclick="saveDiaryNote()">💾 Save</button>
    </div>
  </div>`;

  modal.classList.add('show');
  window._dnChecklist = note && note.checklist ? [...note.checklist] : [];
  window._dnPhotoData = note ? (note.photoData || null) : null;
}

/* ── Checklist helpers inside note modal ─────────────────── */
function addDnCheckItem() {
  if (!window._dnChecklist) window._dnChecklist = [];
  window._dnChecklist.push({ text:'', done:false });
  refreshDnChecklist();
}
function removeDnCheckItem(idx) {
  window._dnChecklist.splice(idx, 1);
  refreshDnChecklist();
}
function dnCheckChange(idx, done) {
  if (window._dnChecklist[idx]) window._dnChecklist[idx].done = done;
}
function dnCheckTextChange(idx, text) {
  if (window._dnChecklist[idx]) window._dnChecklist[idx].text = text;
}
function refreshDnChecklist() {
  const container = document.getElementById('dnChecklist');
  if (!container) return;
  container.innerHTML = (window._dnChecklist||[]).map((item,i)=>
    `<div class="dnc-row">
      <input type="checkbox" ${item.done?'checked':''} class="dnc-check" onchange="dnCheckChange(${i},this.checked)"/>
      <input type="text" class="fi dnc-text" value="${item.text||''}" placeholder="Checklist item…" oninput="dnCheckTextChange(${i},this.value)"/>
      <button onclick="removeDnCheckItem(${i})" class="act-btn act-del" style="flex-shrink:0">✕</button>
    </div>`
  ).join('');
}
function dnPopulateCrops() {
  const farmId = document.getElementById('dnFarm')?.value||'';
  const sel    = document.getElementById('dnCrop');
  if (!sel) return;
  sel.innerHTML = `<option value="">General</option>` +
    (farmId ? (db.crops||[]).filter(c=>c.farmId===farmId) : (db.crops||[]))
    .map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

/* ── Photo preview ───────────────────────────────────────── */
function previewDnPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    window._dnPhotoData = e.target.result;
    const prev = document.getElementById('dnPhotoPreview');
    if (prev) prev.innerHTML = `<img src="${e.target.result}" style="max-height:120px;border-radius:8px;object-fit:cover"/>`;
  };
  reader.readAsDataURL(file);
}

/* ── Save diary note ─────────────────────────────────────── */
function saveDiaryNote() {
  const title = document.getElementById('dnTitle')?.value.trim()||'';
  const text  = document.getElementById('dnText')?.value.trim()||'';
  const tags  = (document.getElementById('dnTags')?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
  const farmId= document.getElementById('dnFarm')?.value||'';
  const cropId= document.getElementById('dnCrop')?.value||'';

  if (!text && !window._dnPhotoData && !(window._dnChecklist||[]).length) {
    showToast(calLang()==='mr'?'नोंद रिकामी आहे':'Note is empty','error');
    return;
  }

  if (!db.diaryNotes) db.diaryNotes = [];

  // Sync checklist text from DOM before saving
  document.querySelectorAll('#dnChecklist .dnc-text').forEach((inp,i)=>{
    if (window._dnChecklist[i]) window._dnChecklist[i].text = inp.value;
  });
  document.querySelectorAll('#dnChecklist .dnc-check').forEach((chk,i)=>{
    if (window._dnChecklist[i]) window._dnChecklist[i].done = chk.checked;
  });

  const note = {
    id:        diaryEditNoteId || calUID(),
    date:      diaryDate || calToday(),
    title,
    text,
    checklist: window._dnChecklist || [],
    tags,
    farmId,
    cropId,
    photoData: window._dnPhotoData || null,
    createdAt: diaryEditNoteId
      ? ((db.diaryNotes.find(n=>n.id===diaryEditNoteId))||{}).createdAt || new Date().toISOString()
      : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (diaryEditNoteId) {
    const idx = db.diaryNotes.findIndex(n=>n.id===diaryEditNoteId);
    if (idx > -1) db.diaryNotes[idx] = note; else db.diaryNotes.push(note);
  } else {
    db.diaryNotes.push(note);
  }

  saveDB();
  closeModal('diaryNoteModal');
  renderDiaryPage(diaryDate);
  // Update calendar grid dots
  renderCalendar();
  showToast(calLang()==='mr'?'नोंद जतन झाली ✅':'Note saved ✅');
}

function deleteDiaryNote(id, dateStr) {
  confirmAction(calLang()==='mr'?'ही नोंद हटवायची?':'Delete this note?', () => {
    db.diaryNotes = (db.diaryNotes||[]).filter(n=>n.id!==id);
    saveDB();
    renderDiaryPage(dateStr||diaryDate);
    showToast('Note deleted');
  });
}

/* ── Photo full-screen viewer ────────────────────────────── */
function openPhotoViewer(noteId) {
  const note = (db.diaryNotes||[]).find(n=>n.id===noteId);
  if (!note || !note.photoData) return;
  let viewer = document.getElementById('photoViewer');
  if (!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'photoViewer';
    viewer.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;cursor:pointer';
    viewer.onclick = ()=>viewer.remove();
    document.body.appendChild(viewer);
  }
  viewer.innerHTML = `<img src="${note.photoData}" style="max-width:92vw;max-height:80vh;object-fit:contain;border-radius:12px"/>
    ${note.text?`<p style="color:#fff;font-size:.9rem;max-width:500px;text-align:center">${note.text.slice(0,120)}</p>`:''}
    <p style="color:rgba(255,255,255,.4);font-size:.75rem">Tap anywhere to close</p>`;
  viewer.style.display = 'flex';
}

/* ============================================================
   DIARY SEARCH
   ============================================================ */
function searchDiary(query) {
  diarySearchQ = (query||'').toLowerCase().trim();
  renderDiarySearchResults();
}

function renderDiarySearchResults() {
  const q = diarySearchQ;
  if (!q) return;

  const results = [];

  // Search notes
  (db.diaryNotes||[]).forEach(n => {
    const haystack = [n.title,n.text,(n.tags||[]).join(' ')].join(' ').toLowerCase();
    const farm = db.farms.find(f=>f.id===n.farmId);
    const crop = db.crops.find(c=>c.id===n.cropId);
    if ([haystack, farm?.name||'', crop?.name||''].some(h=>h.toLowerCase().includes(q))) {
      results.push({ type:'note', date:n.date, data:n, farm, crop });
    }
  });

  // Search tasks
  (db.calTasks||[]).forEach(t => {
    const haystack = [t.name, t.notes, t.category].join(' ').toLowerCase();
    const farm = db.farms.find(f=>f.id===t.farmId);
    const crop = db.crops.find(c=>c.id===t.cropId);
    if ([haystack, farm?.name||'', crop?.name||''].some(h=>h.toLowerCase().includes(q))) {
      results.push({ type:'task', date:t.date, data:t, farm, crop });
    }
  });

  results.sort((a,b)=>b.date.localeCompare(a.date));

  const container = document.getElementById('diarySearchResults');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `<div class="diary-empty"><p>${calLang()==='mr'?'कोणताही परिणाम नाही.':'No results found.'}</p></div>`;
    return;
  }

  container.innerHTML = results.map(r => `
    <div class="diary-search-result" onclick="openDiaryPage('${r.date}')">
      <div class="dsr-date">${calFmt(r.date)}</div>
      <div class="dsr-type">${r.type==='note'?'📝 Note':'📋 Task'}</div>
      <div class="dsr-text">${r.type==='note'?(r.data.title||r.data.text||'').slice(0,80):r.data.name||''}</div>
      ${r.farm?`<span class="tl-tag">🏡 ${r.farm.name}</span>`:''}
      ${r.crop?`<span class="tl-tag">🌾 ${r.crop.name}</span>`:''}
    </div>`).join('');
}
