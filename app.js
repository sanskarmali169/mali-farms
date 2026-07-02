/* =============================================================
   Mali Farm Manager  -  app.js  (v2.0)
   Complete Farm Accounting & Management System
   ============================================================= */

'use strict';

/* ---- CONSTANTS ---- */
const STORAGE_KEY = 'maliFarmData';
const EXPENSE_CATEGORIES = [
  'Fertilizers / खते','Seeds / बियाणे','Workers / मजुरी','Tractor / ट्रॅक्टर',
  'Fuel / इंधन','Irrigation / सिंचन','Electricity / वीज','Pesticides / कीटकनाशके',
  'Herbicides / तणनाशके','Transport / वाहतूक','Machinery Repair / यंत्र दुरुस्ती',
  'Equipment / उपकरणे','Packaging / पॅकेजिंग','Miscellaneous / इतर'
];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_MR = ['जाने','फेब्रु','मार्च','एप्रिल','मे','जून','जुलै','ऑग','सप्टे','ऑक्टो','नोव्हे','डिसे'];

/* ---- i18n STRINGS ---- */
const i18n = {
  en: {
    appName:'Mali Farm Manager', tagline:'Farm Accounting & Management', darkMode:'Dark Mode',
    mainMenu:'Main Menu', planningMenu:'Planning & Tasks', analyticsMenu:'Analytics', systemMenu:'System',
    nav_dashboard:'Dashboard', nav_farms:'My Farms', nav_crops:'Crops', nav_expenses:'Expenses',
    nav_revenue:'Revenue / Sales', nav_tasks:'Task Planner', nav_analytics:'Profit & Analytics',
    nav_reports:'Reports', nav_settings:'Settings',
    allFarms:'All Farms', allCrops:'All Crops', allCats:'All Categories', allMonths:'All Months',
    currentFarm:'Active Farm', addFarm:'Add Farm', addCrop:'Add Crop', addExpense:'Add Expense',
    addSale:'Add Sale', addTask:'Add Task',
    farmsSubtitle:'Manage all your farms', cropsSubtitle:'Manage crops per farm',
    expSubtitle:'Track all farm expenditures', revSubtitle:'Track crop sales and income',
    tasksSubtitle:'Schedule and manage farm activities', analyticsSubtitle:'Detailed financial insights',
    reportsSubtitle:'Generate and export reports', settingsSubtitle:'App preferences and data management',
    totalSpent:'Total Spent', totalRevenue:'Total Revenue', totalProfit:'Total Profit/Loss',
    farms:'Farms', crops:'Crops', pendingTasks:'Pending Tasks',
    monthlyExpChart:'Monthly Expenses', expCatChart:'Expense Categories',
    revVsExpChart:'Revenue vs Expenses', profitTrend:'Profit Trend',
    todayTasks:"Today's Tasks", upcomingTasks:'Upcoming Tasks', recentTx:'Recent Transactions',
    date:'Date', farm:'Farm', crop:'Crop', category:'Category', description:'Description',
    amount:'Amount', payment:'Payment', actions:'Actions', quantity:'Quantity', rate:'Rate/Unit',
    buyer:'Buyer', notes:'Notes', farmName:'Farm Name', village:'Village / Location',
    area:'Area', ownerName:'Owner Name', cropName:'Crop Name', plantingDate:'Planting Date',
    harvestDate:'Expected Harvest', status:'Status', growing:'Growing', harvested:'Harvested',
    planned:'Planned', failed:'Failed',
    allExpenses:'All Expenses', allSales:'All Sales', expReport:'Expense Report',
    revReport:'Revenue Report', plReport:'P&L Report', cropReport:'Crop Report',
    fromDate:'From Date', toDate:'To Date', generate:'Generate',
    month:'Month', revenue:'Revenue', expenses:'Expenses', profit:'Net Profit/Loss',
    monthBreakdown:'Month-wise Breakdown', monthlyPLChart:'Monthly Profit / Loss',
    cropProfitChart:'Crop-wise Profit', farmCompChart:'Farm Comparison', yearlyChart:'Yearly Comparison',
    year:'Year', unit:'Unit', farmInfo:'Farm Information', phone:'Phone', address:'Address',
    dataManagement:'Data Management', dataDesc:'Export and import all your farm data.',
    exportData:'Export Data (JSON)', importData:'Import Data (JSON)',
    clearExpenses:'Clear All Expenses', clearRevenue:'Clear All Revenue', clearAll:'Clear All Data',
    notifications:'Notifications', notifDesc:'Enable browser notifications for task reminders.',
    enableNotif:'Enable Notifications', appInfo:'App Info', storage:'Storage',
    localStorage:'Browser LocalStorage', offline:'Offline', yes:'✅ Yes', language:'Language',
    infoNote:'All data stored locally. Export regularly.',
    cancel:'Cancel', save:'Save', delete:'Delete', confirmAction:'Confirm Action',
    edit:'Edit', general:'General', selectCat:'Select Category', selectFarm:'Select Farm',
    tomorrowTasks:"Tomorrow's Tasks", overdueTasks:'Overdue Tasks', doneTasks:'Completed',
    allTasks:'All Tasks', taskDesc:'Task Description', time:'Time', priority:'Priority',
    high:'High', medium:'Medium', low:'Low', pending:'Pending', done:'Done', cancelled:'Cancelled',
    reminder:'Reminder', noReminder:'No Reminder', onDayOf:'On the day',
    oneDayBefore:'1 day before', twoDaysBefore:'2 days before',
    undo:'Undo', undoHint:'This can be undone for a few seconds.',
    noProfitData:'No data yet.', noFarms:'No farms added yet. Click Add Farm to start.',
    noCrops:'No crops found.', noExpenses:'No expenses found.', noRevenue:'No revenue records.',
    noTasks:'No tasks found.', noReport:'Generate a report above.',
    profitLabel:'Profit', lossLabel:'Loss',
    dashGreetMorning:'Good Morning 🌅', dashGreetAfternoon:'Good Afternoon ☀️',
    dashGreetEvening:'Good Evening 🌙',
    loadDemo:'Load Demo Data',
    nav_calendar:'Farm Calendar', calSubtitle:'Schedule and track all farm activities',
    addCalTask:'Add Task', monthView:'Month', weekView:'Week', agendaView:'Agenda',
    today:'Today', recurring:'Recurring', taskName:'Task Name',
    recurringEnd:'Repeat Until', recurringInterval:'Every N Days',
    notification:'Notification', noCalTasks:'No tasks for this date.',
    calTemplateAdded:'Crop schedule template added to calendar ✅',
  },
  mr: {
    appName:'माली फार्म मॅनेजर', tagline:'शेत हिशेब आणि व्यवस्थापन', darkMode:'डार्क मोड',
    mainMenu:'मुख्य मेनू', planningMenu:'नियोजन आणि कामे', analyticsMenu:'विश्लेषण', systemMenu:'सिस्टम',
    nav_dashboard:'डॅशबोर्ड', nav_farms:'माझी शेते', nav_crops:'पिके', nav_expenses:'खर्च',
    nav_revenue:'उत्पन्न / विक्री', nav_tasks:'कामाचे नियोजन', nav_analytics:'नफा-तोटा',
    nav_reports:'अहवाल', nav_settings:'सेटिंग्ज',
    allFarms:'सर्व शेते', allCrops:'सर्व पिके', allCats:'सर्व प्रकार', allMonths:'सर्व महिने',
    currentFarm:'सक्रिय शेत', addFarm:'शेत जोडा', addCrop:'पीक जोडा', addExpense:'खर्च जोडा',
    addSale:'विक्री जोडा', addTask:'काम जोडा',
    farmsSubtitle:'सर्व शेतांचे व्यवस्थापन', cropsSubtitle:'प्रत्येक शेतातील पिके',
    expSubtitle:'सर्व शेत खर्चाची नोंद', revSubtitle:'पिक विक्री आणि उत्पन्न',
    tasksSubtitle:'शेत कामांचे वेळापत्रक', analyticsSubtitle:'तपशीलवार आर्थिक माहिती',
    reportsSubtitle:'अहवाल तयार करा आणि डाउनलोड करा', settingsSubtitle:'ॲप सेटिंग्ज',
    totalSpent:'एकूण खर्च', totalRevenue:'एकूण उत्पन्न', totalProfit:'एकूण नफा/तोटा',
    farms:'शेते', crops:'पिके', pendingTasks:'बाकी कामे',
    monthlyExpChart:'मासिक खर्च', expCatChart:'खर्चाचे प्रकार',
    revVsExpChart:'उत्पन्न विरुद्ध खर्च', profitTrend:'नफा ट्रेंड',
    todayTasks:'आजची कामे', upcomingTasks:'येणारी कामे', recentTx:'अलीकडील व्यवहार',
    date:'तारीख', farm:'शेत', crop:'पीक', category:'प्रकार', description:'वर्णन',
    amount:'रक्कम', payment:'पेमेंट', actions:'क्रिया', quantity:'प्रमाण', rate:'दर/युनिट',
    buyer:'खरेदीदार', notes:'नोंदी', farmName:'शेताचे नाव', village:'गाव / ठिकाण',
    area:'क्षेत्र', ownerName:'मालकाचे नाव', cropName:'पिकाचे नाव', plantingDate:'लागवड तारीख',
    harvestDate:'अपेक्षित कापणी', status:'स्थिती', growing:'वाढत आहे', harvested:'कापणी झाली',
    planned:'नियोजित', failed:'अयशस्वी',
    allExpenses:'सर्व खर्च', allSales:'सर्व विक्री', expReport:'खर्च अहवाल',
    revReport:'उत्पन्न अहवाल', plReport:'नफा-तोटा अहवाल', cropReport:'पीक अहवाल',
    fromDate:'पासून', toDate:'पर्यंत', generate:'तयार करा',
    month:'महिना', revenue:'उत्पन्न', expenses:'खर्च', profit:'निव्वळ नफा/तोटा',
    monthBreakdown:'महिना-निहाय तपशील', monthlyPLChart:'मासिक नफा / तोटा',
    cropProfitChart:'पीक-निहाय नफा', farmCompChart:'शेत तुलना', yearlyChart:'वार्षिक तुलना',
    year:'वर्ष', unit:'युनिट', farmInfo:'शेत माहिती', phone:'फोन', address:'पत्ता',
    dataManagement:'डेटा व्यवस्थापन', dataDesc:'सर्व डेटा निर्यात आणि आयात करा.',
    exportData:'डेटा निर्यात करा (JSON)', importData:'डेटा आयात करा (JSON)',
    clearExpenses:'सर्व खर्च हटवा', clearRevenue:'सर्व उत्पन्न हटवा', clearAll:'सर्व डेटा हटवा',
    notifications:'सूचना', notifDesc:'कामाच्या स्मरणपत्रासाठी ब्राउझर सूचना.',
    enableNotif:'सूचना सक्षम करा', appInfo:'ॲप माहिती', storage:'स्टोरेज',
    localStorage:'ब्राउझर LocalStorage', offline:'ऑफलाइन', yes:'✅ होय', language:'भाषा',
    infoNote:'सर्व डेटा स्थानिक आहे. नियमित निर्यात करा.',
    cancel:'रद्द करा', save:'जतन करा', delete:'हटवा', confirmAction:'खात्री करा',
    edit:'संपादित करा', general:'सामान्य', selectCat:'प्रकार निवडा', selectFarm:'शेत निवडा',
    tomorrowTasks:'उद्याची कामे', overdueTasks:'वेळ उलटलेली कामे', doneTasks:'पूर्ण झालेली',
    allTasks:'सर्व कामे', taskDesc:'कामाचे वर्णन', time:'वेळ', priority:'प्राधान्य',
    high:'उच्च', medium:'मध्यम', low:'कमी', pending:'प्रलंबित', done:'पूर्ण', cancelled:'रद्द',
    reminder:'स्मरणपत्र', noReminder:'स्मरणपत्र नाही', onDayOf:'त्या दिवशी',
    oneDayBefore:'१ दिवस आधी', twoDaysBefore:'२ दिवस आधी',
    undo:'पूर्ववत', undoHint:'हे काही सेकंदात पूर्ववत होऊ शकते.',
    noProfitData:'अजून डेटा नाही.', noFarms:'अजून शेत नाही. शेत जोडा.',
    noCrops:'पिके आढळली नाहीत.', noExpenses:'खर्च आढळला नाही.', noRevenue:'उत्पन्न नाही.',
    noTasks:'कामे आढळली नाहीत.', noReport:'वरती अहवाल तयार करा.',
    profitLabel:'नफा', lossLabel:'तोटा',
    dashGreetMorning:'सुप्रभात 🌅', dashGreetAfternoon:'शुभ दुपार ☀️', dashGreetEvening:'शुभ संध्याकाळ 🌙',
    loadDemo:'डेमो डेटा लोड करा',
    nav_calendar:'शेत दिनदर्शिका', calSubtitle:'सर्व शेत कामांचे वेळापत्रक',
    addCalTask:'काम जोडा', monthView:'महिना', weekView:'आठवडा', agendaView:'अजेंडा',
    today:'आज', recurring:'पुनरावृत्ती', taskName:'कामाचे नाव',
    recurringEnd:'पर्यंत पुनरावृत्ती', recurringInterval:'प्रत्येक N दिवस',
    notification:'सूचना', noCalTasks:'या तारखेला कोणतेही काम नाही.',
    calTemplateAdded:'पीक वेळापत्रक टेम्पलेट दिनदर्शिकेत जोडले ✅',
  }
};

/* ---- STATE ---- */
let db = { farms:[], crops:[], expenses:[], revenue:[], tasks:[], settings:{} };
let lang = localStorage.getItem('mfm_lang') || 'en';
let theme = localStorage.getItem('mfm_theme') || 'light';
let activeFarmId = 'all';
let currentEditId = null;
let undoStack = null;
let chartInstances = {};

/* ---- INIT FLAG KEY: tracks whether the app has ever been opened ---- */
const INIT_FLAG_KEY = STORAGE_KEY + '_initialized';

/* ===================== INIT =====================
   initApp() is called by firebase.js AFTER auth + Firestore data
   is loaded. DOMContentLoaded only sets up UI that doesn't need data.
================================================== */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(theme);
  applyLang(lang);
  // Set today's date on date inputs right away
  initDateInputs();
  // Mark init flag
  if (!localStorage.getItem(INIT_FLAG_KEY)) {
    localStorage.setItem(INIT_FLAG_KEY, '1');
  }
});

// Called by firebase.js once auth + Firestore data is ready
window.initApp = function() {
  initSettings();
  populateYearDropdowns();
  populateFilterDropdowns();
  renderDashboard();
  initDateInputs();
  scheduleNotificationCheck();
  setInterval(scheduleNotificationCheck, 60000);
  const dashDateEl = document.getElementById('dashDate');
  if (dashDateEl) dashDateEl.textContent = new Date().toLocaleDateString(
    lang === 'mr' ? 'mr-IN' : 'en-IN',
    { weekday:'long', year:'numeric', month:'long', day:'numeric' }
  );
  // i18n refresh after data load
  applyLang(lang);
};

/* ===================== DB (LocalStorage) ===================== */
function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) db = JSON.parse(raw);
    db.farms    = db.farms    || [];
    db.crops    = db.crops    || [];
    db.expenses = db.expenses || [];
    db.revenue  = db.revenue  || [];
    db.tasks    = db.tasks    || [];
    db.calTasks   = db.calTasks   || [];
    db.diaryNotes = db.diaryNotes || [];
    db.diaryWeather = db.diaryWeather || {};
    db.settings   = db.settings   || {};
  } catch(e) { console.warn('DB load error', e); }
}
function saveDB() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
  catch(e) { showToast('Storage error: ' + e.message, 'error'); }
}

/* ===================== ID GENERATOR ===================== */
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

/* ===================== THEME ===================== */
function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('mfm_theme', theme);
  applyTheme(theme);
}
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const isDark = t === 'dark';
  const btn1 = document.getElementById('themeToggle');
  const btn2 = document.getElementById('sideThemeBtn');
  const icon = isDark ? '☀️' : '🌙';
  if (btn1) btn1.textContent = icon;
  if (btn2) btn2.innerHTML = icon + ' <span data-i18n="darkMode">' + t_(lang,'darkMode') + '</span>';
  // Recreate charts for new theme colors
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e){} });
  chartInstances = {};
}

/* ===================== LANGUAGE ===================== */
function toggleLang() {
  lang = lang === 'en' ? 'mr' : 'en';
  localStorage.setItem('mfm_lang', lang);
  applyLang(lang);
}
function applyLang(l) {
  document.documentElement.setAttribute('data-lang', l);
  const t = i18n[l];
  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  const langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = l === 'en' ? 'English' : 'मराठी';
  const langToggle = document.getElementById('langToggle');
  if (langToggle) langToggle.textContent = l === 'en' ? 'MR' : 'EN';
  // Refresh rendered content
  renderDashboard();
}
function t_(l, key) { return (i18n[l] || i18n.en)[key] || key; }
function t(key) { return t_(lang, key); }

/* ===================== SETTINGS ===================== */
function initSettings() {
  const s = db.settings;
  if (s.owner) document.getElementById('sOwner').value = s.owner;
  if (s.phone) document.getElementById('sPhone').value = s.phone;
  if (s.address) document.getElementById('sAddress').value = s.address;
  const notifStatus = document.getElementById('notifStatus');
  if (notifStatus) {
    if (Notification.permission === 'granted') notifStatus.textContent = '✅ Notifications enabled';
    else if (Notification.permission === 'denied') notifStatus.textContent = '❌ Notifications blocked';
    else notifStatus.textContent = '⚠️ Notifications not yet enabled';
  }
}
function saveSettings() {
  db.settings.owner   = document.getElementById('sOwner').value.trim();
  db.settings.phone   = document.getElementById('sPhone').value.trim();
  db.settings.address = document.getElementById('sAddress').value.trim();
  saveDB(); // firebase.js overrides this to write to Firestore
  showToast('Settings saved ✅');
}

/* ===================== NAVIGATION ===================== */
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  if (btn) btn.classList.add('active');
  closeSidebar();
  // Refresh on navigate
  switch(id) {
    case 'dashboard': renderDashboard(); break;
    case 'farms':     renderFarmsPage(); break;
    case 'crops':     renderCropsPage(); break;
    case 'expenses':  renderExpTable(); renderExpKPI(); renderExpChart(); break;
    case 'revenue':   renderRevTable(); renderRevKPI(); break;
    case 'tasks':     renderTasks('all'); break;
    case 'calendar':  if(typeof renderCalendar==='function') renderCalendar(); break;
    case 'analytics': renderAnalytics(); break;
    case 'reports':   populateReportDropdowns(); break;
    case 'settings':  initSettings(); break;
  }
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}
function switchTab(section, tabId, btn) {
  const parent = btn.closest('section') || document;
  parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  parent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById('tab-' + tabId);
  if (pane) pane.classList.add('active');
}

/* ===================== DATE HELPERS ===================== */
function today() { return new Date().toISOString().split('T')[0]; }
function fmt(date) {
  if (!date) return '-';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', {day:'2-digit', month:'short', year:'numeric'});
}
function getMonthKey(dateStr) { const d = new Date(dateStr); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function getYear(dateStr) { return new Date(dateStr).getFullYear(); }
function initDateInputs() {
  const t = today();
  ['emDate','rmDate','tmDate','saleDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = t;
  });
}

/* ===================== CURRENCY HELPER ===================== */
function rupee(n) {
  const num = Number(n) || 0;
  return '₹' + num.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
}

/* ===================== POPULATE DROPDOWNS ===================== */
function populateYearDropdowns() {
  const years = getYearsInData();
  const cy = new Date().getFullYear();
  if (!years.includes(cy)) years.push(cy);
  years.sort((a,b) => b-a);
  ['analyticsYear','rPLYear'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = years.map(y => `<option value="${y}"${y===cy?' selected':''}>${y}</option>`).join('');
  });
}
function getYearsInData() {
  const years = new Set();
  [...db.expenses, ...db.revenue].forEach(r => { if (r.date) years.add(getYear(r.date)); });
  return Array.from(years);
}
function populateFilterDropdowns() {
  populateFarmDropdowns();
  populateExpCatFilter();
  populateMonthFilters();
}
function populateFarmDropdowns() {
  const farmOpts = db.farms.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  const allOpt = `<option value="">${t('allFarms')}</option>`;
  const allOptVal = `<option value="all">${t('allFarms')}</option>`;
  // Global sidebar
  const gff = document.getElementById('globalFarmFilter');
  if (gff) gff.innerHTML = allOptVal + farmOpts.replace(/value="([^"]+)"/g, 'value="$1"');
  // Filter dropdowns
  ['expFarmFilter','revFarmFilter','analyticsFarm','rExpFarm','rRevFarm','rPLFarm','rCropFarm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = allOpt + farmOpts;
  });
  // Modal farm selects
  ['emFarm','rmFarm','tmFarm','cmFarm'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const reqOpt = id === 'cmFarm' ? `<option value="">${t('selectFarm')}</option>` : '';
    el.innerHTML = reqOpt + farmOpts;
  });
  // Crop page filter
  const cpf = document.getElementById('cropFarmFilter');
  if (cpf) cpf.innerHTML = allOptVal + farmOpts;
}
function populateExpCatFilter() {
  const cats = EXPENSE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  ['expCatFilter','rExpCat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">${t('allCats')}</option>` + cats;
    if (el && id==='rExpCat') el.innerHTML = `<option value="">${t('allCats')}</option>` + cats;
  });
  // Modal cat
  const emCat = document.getElementById('emCat');
  if (emCat) emCat.innerHTML = `<option value="">${t('selectCat')}</option>` + cats;
}
function populateMonthFilters() {
  const months = getMonthsInData();
  months.sort().reverse();
  const opts = months.map(m => {
    const [y,mo] = m.split('-');
    const label = MONTHS_EN[parseInt(mo)-1] + ' ' + y;
    return `<option value="${m}">${label}</option>`;
  }).join('');
  ['expMonthFilter','revMonthFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">${t('allMonths')}</option>` + opts;
  });
}
function getMonthsInData() {
  const m = new Set();
  [...db.expenses, ...db.revenue].forEach(r => { if (r.date) m.add(getMonthKey(r.date)); });
  return Array.from(m);
}
function populateCropDropdown(cropId, farmId) {
  const farmSel = document.getElementById(farmId);
  const cropSel = document.getElementById(cropId);
  if (!cropSel) return;
  const fid = farmSel ? farmSel.value : '';
  const crops = fid ? db.crops.filter(c => c.farmId === fid) : db.crops;
  cropSel.innerHTML = `<option value="">${t('general')}</option>` + crops.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}
function populateReportDropdowns() {
  populateFarmDropdowns();
  populateExpCatFilter();
  const crops = db.crops;
  const cropOpts = crops.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  ['rRevCrop','rCropCrop'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<option value="">${t('allCrops')}</option>` + cropOpts;
  });
  populateYearDropdowns();
}
function setActiveFarm(val) {
  activeFarmId = val;
}

/* ===================== TOAST ===================== */
function showToast(msg, type='success') {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = (type==='success'?'✅':type==='error'?'❌':type==='warning'?'⚠️':'ℹ️') + ' ' + msg;
  c.appendChild(el);
  setTimeout(() => { el.style.animation='slideIn .3s ease reverse'; setTimeout(()=>el.remove(), 300); }, 3200);
}

/* ===================== CONFIRM DIALOG ===================== */
let _confirmCb = null;
function confirmAction(msg, cb, withUndo=true) {
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('undoHint').style.display = withUndo ? 'block' : 'none';
  document.getElementById('confirmModal').classList.add('show');
  const btn = document.getElementById('confirmOkBtn');
  btn.textContent = t('delete');
  _confirmCb = cb;
  btn.onclick = () => { closeModal('confirmModal'); if (_confirmCb) _confirmCb(); };
}

/* ===================== MODAL HELPERS ===================== */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

/* ===================== UNDO ===================== */
function pushUndo(section, item) {
  undoStack = { section, item };
  const bar = document.getElementById('undoBar');
  bar.style.display = 'flex';
  document.getElementById('undoMsg').textContent = (lang==='mr'?'नोंद हटवली':'Item deleted');
  clearTimeout(window._undoTimer);
  window._undoTimer = setTimeout(() => { bar.style.display = 'none'; undoStack = null; }, 5000);
}
function undoDelete() {
  if (!undoStack) return;
  const { section, item } = undoStack;
  db[section].push(item);
  saveDB();
  undoStack = null;
  document.getElementById('undoBar').style.display = 'none';
  showToast(lang==='mr'?'पूर्ववत झाले ✅':'Undo successful ✅');
  refreshCurrentPage();
}
function refreshCurrentPage() {
  const active = document.querySelector('.page.active');
  if (!active) return;
  const id = active.id.replace('page-','');
  showPage(id, document.querySelector(`.nav-item.active`));
}

/* ===================== FARMS ===================== */
function openFarmModal(id) {
  currentEditId = id || null;
  const f = id ? db.farms.find(x=>x.id===id) : null;
  document.getElementById('farmModalTitle').textContent = f ? '✏️ Edit Farm' : '🏡 Add Farm';
  document.getElementById('fmId').value = f ? f.id : '';
  document.getElementById('fmName').value = f ? f.name : '';
  document.getElementById('fmVillage').value = f ? f.village : '';
  document.getElementById('fmArea').value = f ? f.area : '';
  document.getElementById('fmOwner').value = f ? f.owner : '';
  document.getElementById('fmNotes').value = f ? f.notes : '';
  openModal('farmModal');
}
function saveFarm() {
  const name = document.getElementById('fmName').value.trim();
  if (!name) { showToast(lang==='mr'?'शेताचे नाव आवश्यक आहे':'Farm name is required','error'); return; }
  const farm = {
    id: currentEditId || uid(),
    name, village: document.getElementById('fmVillage').value.trim(),
    area: document.getElementById('fmArea').value.trim(),
    owner: document.getElementById('fmOwner').value.trim(),
    notes: document.getElementById('fmNotes').value.trim(),
    createdAt: new Date().toISOString()
  };
  if (currentEditId) {
    const idx = db.farms.findIndex(x=>x.id===currentEditId);
    if (idx > -1) db.farms[idx] = farm;
  } else {
    db.farms.push(farm);
  }
  saveDB();
  closeModal('farmModal');
  populateFilterDropdowns();
  renderFarmsPage();
  showToast(t('save') + ': ' + farm.name);
}
function deleteFarm(id) {
  const f = db.farms.find(x=>x.id===id);
  if (!f) return;
  confirmAction(`Delete farm "${f.name}"? All associated crops, expenses, and revenue will remain.`, () => {
    db.farms = db.farms.filter(x=>x.id!==id);
    saveDB(); populateFilterDropdowns(); renderFarmsPage();
    showToast('Farm deleted');
  }, false);
}
function renderFarmsPage() {
  const g = document.getElementById('farmsGrid');
  if (!g) return;
  if (db.farms.length === 0) {
    g.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="es-icon">🏡</div><h3>${t('noFarms')}</h3>
      <p>Click "Add Farm" to get started.</p></div>`;
    return;
  }
  g.innerHTML = db.farms.map(f => {
    const fExp = db.expenses.filter(e=>e.farmId===f.id).reduce((s,e)=>s+Number(e.amount),0);
    const fRev = db.revenue.filter(r=>r.farmId===f.id).reduce((s,r)=>s+Number(r.amount),0);
    const fProfit = fRev - fExp;
    const fCrops = db.crops.filter(c=>c.farmId===f.id).length;
    return `<div class="farm-card">
      <div class="farm-card-top">
        <div class="farm-emoji">🏡</div>
        <div class="farm-card-actions">
          <button class="act-btn act-edit" onclick="openFarmModal('${f.id}')" title="${t('edit')}">✏️</button>
          <button class="act-btn act-del" onclick="deleteFarm('${f.id}')" title="${t('delete')}">🗑</button>
        </div>
      </div>
      <div class="farm-name">${f.name}</div>
      <div class="farm-meta">
        ${f.village?`<div class="farm-meta-item"><div class="fm-label">📍 ${t('village')}</div><div class="fm-val">${f.village}</div></div>`:''}
        ${f.area?`<div class="farm-meta-item"><div class="fm-label">📐 ${t('area')}</div><div class="fm-val">${f.area}</div></div>`:''}
        ${f.owner?`<div class="farm-meta-item"><div class="fm-label">👤 ${t('ownerName')}</div><div class="fm-val">${f.owner}</div></div>`:''}
        <div class="farm-meta-item"><div class="fm-label">🌱 ${t('crops')}</div><div class="fm-val">${fCrops}</div></div>
      </div>
      <div class="farm-card-stats">
        <div class="farm-stat">${t('expenses')}: <strong>${rupee(fExp)}</strong></div>
        <div class="farm-stat">${t('revenue')}: <strong>${rupee(fRev)}</strong></div>
        <div class="farm-stat">${t('profit')}: <strong class="${fProfit>=0?'profit-pos':'profit-neg'}">${rupee(fProfit)}</strong></div>
      </div>
      ${f.notes?`<div style="font-size:.76rem;color:var(--muted);margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">${f.notes}</div>`:''}
    </div>`;
  }).join('');
}

/* ===================== CROPS ===================== */
function openCropModal(id) {
  currentEditId = id || null;
  const c = id ? db.crops.find(x=>x.id===id) : null;
  document.getElementById('cropModalTitle').textContent = c ? '✏️ Edit Crop' : '🌱 Add Crop';
  document.getElementById('cmId').value = c ? c.id : '';
  populateFarmDropdowns();
  if (c) {
    document.getElementById('cmFarm').value = c.farmId;
    document.getElementById('cmName').value = c.name;
    document.getElementById('cmPlant').value = c.plantDate || '';
    document.getElementById('cmHarvest').value = c.harvestDate || '';
    document.getElementById('cmArea').value = c.area || '';
    document.getElementById('cmStatus').value = c.status || 'growing';
    document.getElementById('cmNotes').value = c.notes || '';
  } else {
    document.getElementById('cmFarm').value = db.farms.length === 1 ? db.farms[0].id : '';
    document.getElementById('cmName').value = '';
    document.getElementById('cmPlant').value = today();
    document.getElementById('cmHarvest').value = '';
    document.getElementById('cmArea').value = '';
    document.getElementById('cmStatus').value = 'growing';
    document.getElementById('cmNotes').value = '';
  }
  openModal('cropModal');
}
function saveCrop() {
  const farmId = document.getElementById('cmFarm').value;
  const name   = document.getElementById('cmName').value.trim();
  if (!farmId) { showToast(lang==='mr'?'शेत निवडा':'Select a farm','error'); return; }
  if (!name)   { showToast(lang==='mr'?'पिकाचे नाव आवश्यक':'Crop name required','error'); return; }
  const crop = {
    id: currentEditId || uid(),
    farmId, name, plantDate: document.getElementById('cmPlant').value,
    harvestDate: document.getElementById('cmHarvest').value,
    area: document.getElementById('cmArea').value.trim(),
    status: document.getElementById('cmStatus').value,
    notes: document.getElementById('cmNotes').value.trim(),
    createdAt: new Date().toISOString()
  };
  if (currentEditId) {
    const idx = db.crops.findIndex(x=>x.id===currentEditId);
    if (idx > -1) db.crops[idx] = crop;
  } else {
    db.crops.push(crop);
  }
  saveDB();
  closeModal('cropModal');
  populateFilterDropdowns();
  renderCropsPage();
  showToast(crop.name + ' saved');
  // Auto-generate calendar schedule template for new crops
  if (!currentEditId && typeof generateCropScheduleTemplate === 'function') {
    generateCropScheduleTemplate(crop);
  }
}
function deleteCrop(id) {
  const c = db.crops.find(x=>x.id===id);
  if (!c) return;
  confirmAction(`Delete crop "${c.name}"?`, () => {
    pushUndo('crops', c);
    db.crops = db.crops.filter(x=>x.id!==id);
    saveDB(); renderCropsPage();
  });
}
function renderCropsPage() {
  const g = document.getElementById('cropsGrid');
  if (!g) return;
  const farmFilter = document.getElementById('cropFarmFilter')?.value || 'all';
  let crops = farmFilter === 'all' ? db.crops : db.crops.filter(c=>c.farmId===farmFilter);
  if (crops.length === 0) {
    g.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="es-icon">🌱</div><h3>${t('noCrops')}</h3>
      <p>Add a farm first, then add crops to it.</p></div>`;
    return;
  }
  g.innerHTML = crops.map(c => {
    const farm = db.farms.find(f=>f.id===c.farmId);
    const cExp = db.expenses.filter(e=>e.cropId===c.id).reduce((s,e)=>s+Number(e.amount),0);
    const cRev = db.revenue.filter(r=>r.cropId===c.id).reduce((s,r)=>s+Number(r.amount),0);
    const profit = cRev - cExp;
    return `<div class="crop-card">
      <div class="crop-card-top">
        <span class="crop-status-badge ${c.status}">${t(c.status) || c.status}</span>
        <div class="crop-card-actions">
          <button class="act-btn act-edit" onclick="openCropModal('${c.id}')">✏️</button>
          <button class="act-btn act-del" onclick="deleteCrop('${c.id}')">🗑</button>
        </div>
      </div>
      <div class="crop-name">🌾 ${c.name}</div>
      <div class="crop-farm">🏡 ${farm ? farm.name : '-'}</div>
      <div class="crop-dates">
        ${c.plantDate?`<div class="crop-date"><div class="cd-label">🌱 ${t('plantingDate')}</div><div class="cd-val">${fmt(c.plantDate)}</div></div>`:''}
        ${c.harvestDate?`<div class="crop-date"><div class="cd-label">🌾 ${t('harvestDate')}</div><div class="cd-val">${fmt(c.harvestDate)}</div></div>`:''}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:.77rem;margin-bottom:6px">
        <span style="color:var(--red)">💸 ${rupee(cExp)}</span>
        <span style="color:var(--g2)">💰 ${rupee(cRev)}</span>
        <span class="${profit>=0?'profit-pos':'profit-neg'}">📊 ${rupee(profit)}</span>
      </div>
      <div class="crop-card-foot">
        <div class="crop-area-label">📐 ${c.area || '-'}</div>
        ${c.notes?`<div style="font-size:.72rem;color:var(--muted);max-width:120px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${c.notes}</div>`:''}
      </div>
    </div>`;
  }).join('');
}

/* ===================== EXPENSES ===================== */
function openExpModal(id) {
  currentEditId = id || null;
  const e = id ? db.expenses.find(x=>x.id===id) : null;
  document.getElementById('expModalTitle').textContent = e ? '✏️ Edit Expense' : '💸 Add Expense';
  document.getElementById('emId').value = e ? e.id : '';
  populateFarmDropdowns();
  if (e) {
    document.getElementById('emDate').value = e.date;
    document.getElementById('emFarm').value = e.farmId || '';
    populateCropDropdown('emCrop','emFarm');
    document.getElementById('emCrop').value = e.cropId || '';
    document.getElementById('emCat').value = e.category || '';
    document.getElementById('emAmt').value = e.amount;
    document.getElementById('emPay').value = e.payment || 'Cash / रोख';
    document.getElementById('emDesc').value = e.description || '';
    document.getElementById('emNotes').value = e.notes || '';
  } else {
    document.getElementById('emDate').value = today();
    document.getElementById('emFarm').value = db.farms.length===1?db.farms[0].id:'';
    populateCropDropdown('emCrop','emFarm');
    document.getElementById('emCrop').value = '';
    document.getElementById('emCat').value = '';
    document.getElementById('emAmt').value = '';
    document.getElementById('emPay').value = 'Cash / रोख';
    document.getElementById('emDesc').value = '';
    document.getElementById('emNotes').value = '';
  }
  openModal('expModal');
}
function saveExpense() {
  const date   = document.getElementById('emDate').value;
  const amount = parseFloat(document.getElementById('emAmt').value);
  const cat    = document.getElementById('emCat').value;
  if (!date)          { showToast('Date required','error'); return; }
  if (!cat)           { showToast(lang==='mr'?'प्रकार निवडा':'Select a category','error'); return; }
  if (!amount||amount<=0){ showToast(lang==='mr'?'वैध रक्कम टाका':'Enter valid amount','error'); return; }
  const expense = {
    id: currentEditId || uid(),
    date, farmId: document.getElementById('emFarm').value || '',
    cropId: document.getElementById('emCrop').value || '',
    category: cat, amount,
    payment: document.getElementById('emPay').value,
    description: document.getElementById('emDesc').value.trim(),
    notes: document.getElementById('emNotes').value.trim(),
    createdAt: new Date().toISOString()
  };
  if (currentEditId) {
    const idx = db.expenses.findIndex(x=>x.id===currentEditId);
    if (idx > -1) db.expenses[idx] = expense;
  } else {
    db.expenses.push(expense);
  }
  saveDB();
  closeModal('expModal');
  populateMonthFilters();
  renderExpTable(); renderExpKPI(); renderExpChart();
  showToast(rupee(amount) + ' expense saved');
}
function deleteExpense(id) {
  const e = db.expenses.find(x=>x.id===id);
  if (!e) return;
  confirmAction(`Delete expense of ${rupee(e.amount)}?`, () => {
    pushUndo('expenses', e);
    db.expenses = db.expenses.filter(x=>x.id!==id);
    saveDB(); renderExpTable(); renderExpKPI(); renderExpChart();
  });
}
function getFilteredExpenses() {
  const search   = (document.getElementById('expSearch')?.value||'').toLowerCase();
  const farmF    = document.getElementById('expFarmFilter')?.value || '';
  const cropF    = document.getElementById('expCropFilter')?.value || '';
  const catF     = document.getElementById('expCatFilter')?.value || '';
  const monthF   = document.getElementById('expMonthFilter')?.value || '';
  return db.expenses.filter(e => {
    if (farmF  && e.farmId!==farmF)            return false;
    if (cropF  && e.cropId!==cropF)            return false;
    if (catF   && e.category!==catF)           return false;
    if (monthF && getMonthKey(e.date)!==monthF) return false;
    if (search) {
      const hay = [e.description,e.category,e.notes,rupee(e.amount)].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  }).sort((a,b)=>b.date.localeCompare(a.date));
}
function renderExpTable() {
  const tbody = document.getElementById('expTableBody');
  if (!tbody) return;
  const rows = getFilteredExpenses();
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">${t('noExpenses')}</td></tr>`;
  } else {
    tbody.innerHTML = rows.map((e,i) => {
      const farm = db.farms.find(f=>f.id===e.farmId);
      const crop = db.crops.find(c=>c.id===e.cropId);
      return `<tr>
        <td>${i+1}</td>
        <td>${fmt(e.date)}</td>
        <td><span class="badge badge-green">${farm?farm.name:'-'}</span></td>
        <td>${crop?crop.name:'-'}</td>
        <td><span class="badge badge-orange">${e.category}</span></td>
        <td>${e.description||'-'}</td>
        <td><strong>${rupee(e.amount)}</strong></td>
        <td><span class="badge badge-blue">${e.payment}</span></td>
        <td><div class="tbl-actions">
          <button class="act-btn act-edit" onclick="openExpModal('${e.id}')">✏️</button>
          <button class="act-btn act-del" onclick="deleteExpense('${e.id}')">🗑</button>
        </div></td>
      </tr>`;
    }).join('');
  }
  const total = rows.reduce((s,e)=>s+Number(e.amount),0);
  const foot = document.getElementById('expFoot');
  if (foot) foot.innerHTML = `<span>${rows.length} ${t('allExpenses')}</span><strong>${t('amount')}: ${rupee(total)}</strong>`;
}
function renderExpKPI() {
  const strip = document.getElementById('expKPI');
  if (!strip) return;
  const exp = db.expenses;
  const total = exp.reduce((s,e)=>s+Number(e.amount),0);
  // Category totals
  const cats = {};
  exp.forEach(e => { cats[e.category] = (cats[e.category]||0)+Number(e.amount); });
  const topCats = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,4);
  strip.innerHTML = `
    <div class="kpi-strip-item"><div class="ksi-icon">💸</div><div><div class="ksi-label">${t('totalSpent')}</div><div class="ksi-val">${rupee(total)}</div></div></div>
    ${topCats.map(([k,v])=>`<div class="kpi-strip-item"><div class="ksi-icon">📦</div><div><div class="ksi-label">${k.split('/')[0].trim()}</div><div class="ksi-val">${rupee(v)}</div></div></div>`).join('')}
  `;
}
function renderExpChart() {
  const canvas = document.getElementById('cExpPage');
  if (!canvas) return;
  const cats = {};
  db.expenses.forEach(e => { cats[e.category] = (cats[e.category]||0)+Number(e.amount); });
  const labels = Object.keys(cats).map(k=>k.split('/')[0].trim());
  const data   = Object.values(cats);
  destroyChart('cExpPage');
  if (data.length === 0) return;
  chartInstances['cExpPage'] = new Chart(canvas, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: generateColors(labels.length) }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right' } } }
  });
}
function exportExpExcel() {
  const rows = getFilteredExpenses();
  const ws = XLSX.utils.json_to_sheet(rows.map(e=>({
    Date:e.date, Farm:getFarmName(e.farmId), Crop:getCropName(e.cropId),
    Category:e.category, Description:e.description, Amount:e.amount, Payment:e.payment, Notes:e.notes
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, 'farm_expenses.xlsx');
}

/* ===================== REVENUE ===================== */
function openRevModal(id) {
  currentEditId = id || null;
  const r = id ? db.revenue.find(x=>x.id===id) : null;
  document.getElementById('revModalTitle').textContent = r ? '✏️ Edit Sale' : '💰 Add Sale';
  document.getElementById('rmId').value = r ? r.id : '';
  populateFarmDropdowns();
  if (r) {
    document.getElementById('rmDate').value = r.date;
    document.getElementById('rmFarm').value = r.farmId || '';
    populateCropDropdown('rmCrop','rmFarm');
    document.getElementById('rmCrop').value = r.cropId || '';
    document.getElementById('rmQty').value = r.qty || '';
    document.getElementById('rmUnit').value = r.unit || 'kg';
    document.getElementById('rmRate').value = r.rate || '';
    document.getElementById('rmAmt').value = r.amount;
    document.getElementById('rmBuyer').value = r.buyer || '';
    document.getElementById('rmPay').value = r.payment || 'Cash / रोख';
    document.getElementById('rmNotes').value = r.notes || '';
  } else {
    document.getElementById('rmDate').value = today();
    document.getElementById('rmFarm').value = db.farms.length===1?db.farms[0].id:'';
    populateCropDropdown('rmCrop','rmFarm');
    document.getElementById('rmCrop').value = '';
    document.getElementById('rmQty').value = '';
    document.getElementById('rmUnit').value = 'kg';
    document.getElementById('rmRate').value = '';
    document.getElementById('rmAmt').value = '';
    document.getElementById('rmBuyer').value = '';
    document.getElementById('rmPay').value = 'Cash / रोख';
    document.getElementById('rmNotes').value = '';
  }
  openModal('revModal');
}
function calcRevTotal() {
  const qty  = parseFloat(document.getElementById('rmQty').value) || 0;
  const rate = parseFloat(document.getElementById('rmRate').value) || 0;
  if (qty && rate) document.getElementById('rmAmt').value = (qty * rate).toFixed(2);
}
function saveRevenue() {
  const date   = document.getElementById('rmDate').value;
  const amount = parseFloat(document.getElementById('rmAmt').value);
  if (!date)          { showToast('Date required','error'); return; }
  if (!amount||amount<=0){ showToast('Enter valid amount','error'); return; }
  const rev = {
    id: currentEditId || uid(),
    date, farmId: document.getElementById('rmFarm').value || '',
    cropId: document.getElementById('rmCrop').value || '',
    qty: parseFloat(document.getElementById('rmQty').value) || 0,
    unit: document.getElementById('rmUnit').value,
    rate: parseFloat(document.getElementById('rmRate').value) || 0,
    amount,
    buyer: document.getElementById('rmBuyer').value.trim(),
    payment: document.getElementById('rmPay').value,
    notes: document.getElementById('rmNotes').value.trim(),
    createdAt: new Date().toISOString()
  };
  if (currentEditId) {
    const idx = db.revenue.findIndex(x=>x.id===currentEditId);
    if (idx > -1) db.revenue[idx] = rev;
  } else {
    db.revenue.push(rev);
  }
  saveDB();
  closeModal('revModal');
  populateMonthFilters();
  renderRevTable(); renderRevKPI();
  showToast(rupee(amount) + ' sale saved');
}
function deleteRevenue(id) {
  const r = db.revenue.find(x=>x.id===id);
  if (!r) return;
  confirmAction(`Delete sale of ${rupee(r.amount)}?`, () => {
    pushUndo('revenue', r);
    db.revenue = db.revenue.filter(x=>x.id!==id);
    saveDB(); renderRevTable(); renderRevKPI();
  });
}
function getFilteredRevenue() {
  const search = (document.getElementById('revSearch')?.value||'').toLowerCase();
  const farmF  = document.getElementById('revFarmFilter')?.value || '';
  const cropF  = document.getElementById('revCropFilter')?.value || '';
  const monthF = document.getElementById('revMonthFilter')?.value || '';
  return db.revenue.filter(r => {
    if (farmF  && r.farmId!==farmF)             return false;
    if (cropF  && r.cropId!==cropF)             return false;
    if (monthF && getMonthKey(r.date)!==monthF) return false;
    if (search) {
      const hay = [r.buyer,r.notes,getCropName(r.cropId),getFarmName(r.farmId),rupee(r.amount)].join(' ').toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  }).sort((a,b)=>b.date.localeCompare(a.date));
}
function renderRevTable() {
  const tbody = document.getElementById('revTableBody');
  if (!tbody) return;
  const rows = getFilteredRevenue();
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="table-empty">${t('noRevenue')}</td></tr>`;
  } else {
    tbody.innerHTML = rows.map((r,i) => `<tr>
      <td>${i+1}</td>
      <td>${fmt(r.date)}</td>
      <td><span class="badge badge-green">${getFarmName(r.farmId)}</span></td>
      <td>${getCropName(r.cropId) || '-'}</td>
      <td>${r.qty?r.qty+' '+r.unit:'-'}</td>
      <td>${r.rate?rupee(r.rate)+'/'+r.unit:'-'}</td>
      <td><strong style="color:var(--g2)">${rupee(r.amount)}</strong></td>
      <td>${r.buyer||'-'}</td>
      <td><span class="badge badge-blue">${r.payment}</span></td>
      <td><div class="tbl-actions">
        <button class="act-btn act-edit" onclick="openRevModal('${r.id}')">✏️</button>
        <button class="act-btn act-del" onclick="deleteRevenue('${r.id}')">🗑</button>
      </div></td>
    </tr>`).join('');
  }
  const total = rows.reduce((s,r)=>s+Number(r.amount),0);
  const foot = document.getElementById('revFoot');
  if (foot) foot.innerHTML = `<span>${rows.length} ${t('allSales')}</span><strong>${t('revenue')}: ${rupee(total)}</strong>`;
}
function renderRevKPI() {
  const strip = document.getElementById('revKPI');
  if (!strip) return;
  const totalRev = db.revenue.reduce((s,r)=>s+Number(r.amount),0);
  const totalExp = db.expenses.reduce((s,e)=>s+Number(e.amount),0);
  const profit   = totalRev - totalExp;
  strip.innerHTML = `
    <div class="kpi-strip-item"><div class="ksi-icon">💰</div><div><div class="ksi-label">${t('totalRevenue')}</div><div class="ksi-val">${rupee(totalRev)}</div></div></div>
    <div class="kpi-strip-item"><div class="ksi-icon">💸</div><div><div class="ksi-label">${t('totalSpent')}</div><div class="ksi-val">${rupee(totalExp)}</div></div></div>
    <div class="kpi-strip-item"><div class="ksi-icon">${profit>=0?'📈':'📉'}</div><div><div class="ksi-label">${t('totalProfit')}</div><div class="ksi-val ${profit>=0?'profit-pos':'profit-neg'}">${rupee(profit)}</div></div></div>
  `;
}
function exportRevExcel() {
  const rows = getFilteredRevenue();
  const ws = XLSX.utils.json_to_sheet(rows.map(r=>({
    Date:r.date, Farm:getFarmName(r.farmId), Crop:getCropName(r.cropId),
    Quantity:r.qty, Unit:r.unit, Rate:r.rate, Amount:r.amount, Buyer:r.buyer, Payment:r.payment
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Revenue');
  XLSX.writeFile(wb, 'farm_revenue.xlsx');
}

/* ===================== TASKS ===================== */
function openTaskModal(id) {
  currentEditId = id || null;
  const tsk = id ? db.tasks.find(x=>x.id===id) : null;
  document.getElementById('taskModalTitle').textContent = tsk ? '✏️ Edit Task' : '📅 Add Task';
  document.getElementById('tmId').value = tsk ? tsk.id : '';
  populateFarmDropdowns();
  if (tsk) {
    document.getElementById('tmDesc').value = tsk.description;
    document.getElementById('tmDate').value = tsk.date;
    document.getElementById('tmTime').value = tsk.time || '';
    document.getElementById('tmFarm').value = tsk.farmId || '';
    populateCropDropdown('tmCrop','tmFarm');
    document.getElementById('tmCrop').value = tsk.cropId || '';
    document.getElementById('tmPriority').value = tsk.priority || 'medium';
    document.getElementById('tmStatus').value = tsk.status || 'pending';
    document.getElementById('tmReminder').value = tsk.reminder || 'none';
    document.getElementById('tmNotes').value = tsk.notes || '';
  } else {
    document.getElementById('tmDesc').value = '';
    document.getElementById('tmDate').value = today();
    document.getElementById('tmTime').value = '08:00';
    document.getElementById('tmFarm').value = db.farms.length===1?db.farms[0].id:'';
    populateCropDropdown('tmCrop','tmFarm');
    document.getElementById('tmCrop').value = '';
    document.getElementById('tmPriority').value = 'medium';
    document.getElementById('tmStatus').value = 'pending';
    document.getElementById('tmReminder').value = 'onday';
    document.getElementById('tmNotes').value = '';
  }
  openModal('taskModal');
}
function saveTask() {
  const desc = document.getElementById('tmDesc').value.trim();
  const date = document.getElementById('tmDate').value;
  if (!desc) { showToast('Task description required','error'); return; }
  if (!date) { showToast('Date required','error'); return; }
  const task = {
    id: currentEditId || uid(),
    description: desc, date,
    time: document.getElementById('tmTime').value,
    farmId: document.getElementById('tmFarm').value || '',
    cropId: document.getElementById('tmCrop').value || '',
    priority: document.getElementById('tmPriority').value,
    status: document.getElementById('tmStatus').value,
    reminder: document.getElementById('tmReminder').value,
    notes: document.getElementById('tmNotes').value.trim(),
    notified: false,
    createdAt: new Date().toISOString()
  };
  if (currentEditId) {
    const idx = db.tasks.findIndex(x=>x.id===currentEditId);
    if (idx > -1) db.tasks[idx] = task;
  } else {
    db.tasks.push(task);
  }
  saveDB();
  closeModal('taskModal');
  renderTasks(document.querySelector('.tstab.active')?.dataset.filter || 'all');
  showToast('Task saved');
}
function deleteTask(id) {
  const tsk = db.tasks.find(x=>x.id===id);
  if (!tsk) return;
  confirmAction(`Delete task "${tsk.description}"?`, () => {
    pushUndo('tasks', tsk);
    db.tasks = db.tasks.filter(x=>x.id!==id);
    saveDB();
    renderTasks(document.querySelector('.tstab.active')?.dataset.filter || 'all');
  });
}
function updateTaskStatus(id, status) {
  const tsk = db.tasks.find(x=>x.id===id);
  if (!tsk) return;
  tsk.status = status;
  saveDB();
  renderTasks(document.querySelector('.tstab.active')?.dataset.filter || 'all');
}
function filterTasks(filter, btn) {
  document.querySelectorAll('.tstab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks(filter);
}
function getTasksFiltered(filter) {
  const todayStr = today();
  const tomorrowStr = new Date(Date.now()+86400000).toISOString().split('T')[0];
  return db.tasks.filter(tsk => {
    if (filter === 'all')      return true;
    if (filter === 'today')    return tsk.date === todayStr && tsk.status !== 'done';
    if (filter === 'tomorrow') return tsk.date === tomorrowStr && tsk.status !== 'done';
    if (filter === 'upcoming') return tsk.date > tomorrowStr && tsk.status !== 'done';
    if (filter === 'overdue')  return tsk.date < todayStr && tsk.status !== 'done';
    if (filter === 'done')     return tsk.status === 'done';
    return true;
  }).sort((a,b) => a.date.localeCompare(b.date));
}
function renderTasks(filter='all') {
  const g = document.getElementById('tasksGrid');
  if (!g) return;
  const tasks = getTasksFiltered(filter);
  if (tasks.length === 0) {
    g.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="es-icon">📅</div><h3>${t('noTasks')}</h3>
      <p>Add tasks using the "+ Add Task" button above.</p></div>`;
    return;
  }
  const todayStr = today();
  g.innerHTML = tasks.map(tsk => {
    const farm = db.farms.find(f=>f.id===tsk.farmId);
    const crop = db.crops.find(c=>c.id===tsk.cropId);
    const isOverdue = tsk.date < todayStr && tsk.status !== 'done';
    return `<div class="task-card ${tsk.priority} ${tsk.status==='done'?'done':''}">
      <div class="task-card-top">
        <span class="task-priority ${tsk.priority}">${t(tsk.priority)}</span>
        <div class="tbl-actions">
          <button class="act-btn act-edit" onclick="openTaskModal('${tsk.id}')">✏️</button>
          <button class="act-btn act-del" onclick="deleteTask('${tsk.id}')">🗑</button>
        </div>
      </div>
      <div class="task-desc">${tsk.status==='done'?'✅ ':''}${tsk.description}</div>
      <div class="task-meta">
        <span class="task-meta-item">📅 ${fmt(tsk.date)}${tsk.time?' '+tsk.time:''}</span>
        ${farm?`<span class="task-meta-item">🏡 ${farm.name}</span>`:''}
        ${crop?`<span class="task-meta-item">🌾 ${crop.name}</span>`:''}
        ${isOverdue?`<span class="task-meta-item" style="color:var(--red)">⚠️ Overdue</span>`:''}
      </div>
      ${tsk.notes?`<div style="font-size:.76rem;color:var(--muted);margin-top:6px">${tsk.notes}</div>`:''}
      <div class="task-card-foot">
        <select class="task-status-sel" onchange="updateTaskStatus('${tsk.id}',this.value)">
          <option value="pending"${tsk.status==='pending'?' selected':''}>${t('pending')}</option>
          <option value="done"${tsk.status==='done'?' selected':''}>${t('done')}</option>
          <option value="cancelled"${tsk.status==='cancelled'?' selected':''}>${t('cancelled')}</option>
        </select>
        ${tsk.reminder!=='none'?`<span style="font-size:.72rem;color:var(--g2)">🔔</span>`:''}
      </div>
    </div>`;
  }).join('');
}

/* ===================== DASHBOARD ===================== */
function renderDashboard() {
  renderDashKPI();
  renderDashTasks();
  renderDashRecentTx();
  renderDashCharts();
  // Greeting
  const h = new Date().getHours();
  const greet = h < 12 ? t('dashGreetMorning') : h < 17 ? t('dashGreetAfternoon') : t('dashGreetEvening');
  const g = document.getElementById('dashGreeting');
  if (g) g.textContent = greet + (db.settings.owner ? ', ' + db.settings.owner + '!' : '!');
  const cy = document.getElementById('dashChartYear');
  if (cy) cy.textContent = new Date().getFullYear();
}
function renderDashKPI() {
  const kpi = document.getElementById('dashKPI');
  if (!kpi) return;
  const totalExp = db.expenses.reduce((s,e)=>s+Number(e.amount),0);
  const totalRev = db.revenue.reduce((s,r)=>s+Number(r.amount),0);
  const profit   = totalRev - totalExp;
  const pendingTasks = db.tasks.filter(t=>t.status==='pending').length;
  const overdueTasks = db.tasks.filter(t=>t.date < today() && t.status !== 'done').length;
  kpi.innerHTML = `
    <div class="kpi-card red"><div class="kpi-top"><span class="kpi-emoji">💸</span><span class="kpi-badge">${t('expenses')}</span></div>
      <div class="kpi-label">${t('totalSpent')}</div><div class="kpi-value">${rupee(totalExp)}</div></div>
    <div class="kpi-card blue"><div class="kpi-top"><span class="kpi-emoji">💰</span><span class="kpi-badge">${t('revenue')}</span></div>
      <div class="kpi-label">${t('totalRevenue')}</div><div class="kpi-value">${rupee(totalRev)}</div></div>
    <div class="kpi-card ${profit>=0?'':'red'}"><div class="kpi-top"><span class="kpi-emoji">${profit>=0?'📈':'📉'}</span><span class="kpi-badge">${t('profit')}</span></div>
      <div class="kpi-label">${t('totalProfit')}</div><div class="kpi-value ${profit>=0?'profit-pos':'profit-neg'}">${rupee(profit)}</div></div>
    <div class="kpi-card teal"><div class="kpi-top"><span class="kpi-emoji">🏡</span><span class="kpi-badge">${t('farms')}</span></div>
      <div class="kpi-label">${t('farms')}</div><div class="kpi-value">${db.farms.length}</div></div>
    <div class="kpi-card purple"><div class="kpi-top"><span class="kpi-emoji">🌾</span><span class="kpi-badge">${t('crops')}</span></div>
      <div class="kpi-label">${t('crops')}</div><div class="kpi-value">${db.crops.length}</div></div>
    <div class="kpi-card orange"><div class="kpi-top"><span class="kpi-emoji">📅</span><span class="kpi-badge">${overdueTasks>0?'⚠️':''}</span></div>
      <div class="kpi-label">${t('pendingTasks')}</div><div class="kpi-value">${pendingTasks}</div>
      ${overdueTasks>0?`<div class="kpi-sub" style="color:var(--red)">${overdueTasks} overdue</div>`:''}</div>
  `;
}
function renderDashTasks() {
  const todayStr = today();
  const tomorrowStr = new Date(Date.now()+86400000).toISOString().split('T')[0];
  const todayTasks = db.tasks.filter(t=>t.date===todayStr && t.status!=='done');
  const upcomingTasks = db.tasks.filter(t=>t.date>todayStr && t.date<=tomorrowStr+'9' && t.status!=='done').slice(0,5);
  const box1 = document.getElementById('dashTodayTasks');
  const box2 = document.getElementById('dashUpcomingTasks');
  const renderList = (tasks, box) => {
    if (!box) return;
    if (tasks.length === 0) {
      box.innerHTML = `<div class="task-mini-empty">🎉 ${lang==='mr'?'कोणतेही काम नाही':'No tasks'}</div>`;
    } else {
      box.innerHTML = tasks.map(tsk => `<div class="task-mini ${tsk.priority}">
        <span style="font-size:1.3rem">${tsk.priority==='high'?'🔴':tsk.priority==='medium'?'🟡':'🔵'}</span>
        <div class="task-mini-text">
          <strong>${tsk.description}</strong>
          <small>${fmt(tsk.date)}${tsk.time?' '+tsk.time:''}${getFarmName(tsk.farmId)?` · ${getFarmName(tsk.farmId)}`:''}</small>
        </div>
      </div>`).join('');
    }
  };
  renderList(todayTasks, box1);
  renderList(upcomingTasks, box2);
}
function renderDashRecentTx() {
  const box = document.getElementById('dashRecentTx');
  if (!box) return;
  const exp = db.expenses.map(e=>({...e,_type:'exp'}));
  const rev = db.revenue.map(r=>({...r,_type:'rev'}));
  const all = [...exp,...rev].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  if (all.length === 0) {
    box.innerHTML = `<div class="empty-state"><div class="es-icon">📋</div><p>${lang==='mr'?'अजून कोणताही व्यवहार नाही':'No transactions yet'}</p></div>`;
    return;
  }
  box.innerHTML = all.map(item => `<div class="tx-item">
    <div class="tx-icon ${item._type}">${item._type==='exp'?'💸':'💰'}</div>
    <div class="tx-body">
      <strong>${item._type==='exp'?(item.category||item.description||'Expense'):(getCropName(item.cropId)||'Sale')}</strong>
      <small>${fmt(item.date)} · ${getFarmName(item.farmId)||'-'}</small>
    </div>
    <div class="tx-amount ${item._type}">${item._type==='exp'?'-':'+'}${rupee(item.amount)}</div>
  </div>`).join('');
}
function renderDashCharts() {
  renderMonthlyExpChart();
  renderExpCatDashChart();
  renderRevExpChart();
  renderProfitTrendChart();
}

/* ===================== CHARTS - DASHBOARD ===================== */
function getMonthlyTotals(year) {
  const exp = new Array(12).fill(0);
  const rev = new Array(12).fill(0);
  db.expenses.forEach(e => {
    if (e.date && getYear(e.date)===year) exp[new Date(e.date).getMonth()] += Number(e.amount);
  });
  db.revenue.forEach(r => {
    if (r.date && getYear(r.date)===year) rev[new Date(r.date).getMonth()] += Number(r.amount);
  });
  return { exp, rev };
}
function destroyChart(id) {
  if (chartInstances[id]) { try { chartInstances[id].destroy(); } catch(e){} delete chartInstances[id]; }
}
function generateColors(n) {
  const palette = ['#4caf50','#2196f3','#ff9800','#e91e63','#9c27b0','#00bcd4','#ff5722','#607d8b','#8bc34a','#ffc107','#3f51b5','#009688','#f44336','#795548'];
  return Array.from({length:n}, (_,i) => palette[i % palette.length]);
}
function getChartTextColor() { return theme==='dark' ? '#d4e8d4' : '#1a2e1a'; }
function getChartGridColor() { return theme==='dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'; }

function renderMonthlyExpChart() {
  const canvas = document.getElementById('cMonthlyExp');
  if (!canvas) return;
  destroyChart('cMonthlyExp');
  const year = new Date().getFullYear();
  const { exp } = getMonthlyTotals(year);
  const labels = lang==='mr'?MONTHS_MR:MONTHS_EN;
  chartInstances['cMonthlyExp'] = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [{ label: t('expenses'), data: exp, backgroundColor: 'rgba(239,83,80,.75)', borderRadius: 6 }] },
    options: chartOpts()
  });
}
function renderExpCatDashChart() {
  const canvas = document.getElementById('cExpCat');
  if (!canvas) return;
  destroyChart('cExpCat');
  const cats = {};
  db.expenses.forEach(e => { const k=e.category.split('/')[0].trim(); cats[k]=(cats[k]||0)+Number(e.amount); });
  if (Object.keys(cats).length === 0) return;
  chartInstances['cExpCat'] = new Chart(canvas, {
    type: 'doughnut',
    data: { labels: Object.keys(cats), datasets: [{ data: Object.values(cats), backgroundColor: generateColors(Object.keys(cats).length) }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color:getChartTextColor(), font:{size:11} } } } }
  });
}
function renderRevExpChart() {
  const canvas = document.getElementById('cRevExp');
  if (!canvas) return;
  destroyChart('cRevExp');
  const year = new Date().getFullYear();
  const { exp, rev } = getMonthlyTotals(year);
  const labels = lang==='mr'?MONTHS_MR:MONTHS_EN;
  chartInstances['cRevExp'] = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: [
      { label: t('revenue'),  data: rev, backgroundColor: 'rgba(76,175,80,.8)',  borderRadius: 4 },
      { label: t('expenses'), data: exp, backgroundColor: 'rgba(239,83,80,.75)', borderRadius: 4 }
    ]},
    options: chartOpts()
  });
}
function renderProfitTrendChart() {
  const canvas = document.getElementById('cProfitTrend');
  if (!canvas) return;
  destroyChart('cProfitTrend');
  const year = new Date().getFullYear();
  const { exp, rev } = getMonthlyTotals(year);
  const profit = rev.map((r,i)=>r-exp[i]);
  const labels = lang==='mr'?MONTHS_MR:MONTHS_EN;
  chartInstances['cProfitTrend'] = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: [{ label: t('profit'), data: profit,
      borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,.12)',
      fill: true, tension: 0.4, pointRadius: 4 }]},
    options: chartOpts()
  });
}
function chartOpts() {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: getChartTextColor(), font:{size:11} } } },
    scales: {
      x: { ticks: { color: getChartTextColor(), font:{size:10} }, grid: { color: getChartGridColor() } },
      y: { ticks: { color: getChartTextColor(), font:{size:10},
          callback: v => '₹'+v.toLocaleString('en-IN') },
        grid: { color: getChartGridColor() } }
    }
  };
}

/* ===================== ANALYTICS ===================== */
function renderAnalytics() {
  const year   = parseInt(document.getElementById('analyticsYear')?.value) || new Date().getFullYear();
  const farmId = document.getElementById('analyticsFarm')?.value || 'all';

  const filterExp = db.expenses.filter(e=>getYear(e.date)===year && (farmId==='all'||e.farmId===farmId));
  const filterRev = db.revenue.filter(r=>getYear(r.date)===year  && (farmId==='all'||r.farmId===farmId));
  const totalExp = filterExp.reduce((s,e)=>s+Number(e.amount),0);
  const totalRev = filterRev.reduce((s,r)=>s+Number(r.amount),0);
  const profit   = totalRev - totalExp;

  // KPI
  const kpi = document.getElementById('analyticsKPI');
  if (kpi) kpi.innerHTML = `
    <div class="kpi-card blue"><div class="kpi-top"><span class="kpi-emoji">💰</span><span class="kpi-badge">${year}</span></div>
      <div class="kpi-label">${t('totalRevenue')}</div><div class="kpi-value">${rupee(totalRev)}</div></div>
    <div class="kpi-card red"><div class="kpi-top"><span class="kpi-emoji">💸</span><span class="kpi-badge">${year}</span></div>
      <div class="kpi-label">${t('totalSpent')}</div><div class="kpi-value">${rupee(totalExp)}</div></div>
    <div class="kpi-card ${profit>=0?'':'red'}"><div class="kpi-top"><span class="kpi-emoji">${profit>=0?'📈':'📉'}</span><span class="kpi-badge">${profit>=0?t('profitLabel'):t('lossLabel')}</span></div>
      <div class="kpi-label">${t('totalProfit')}</div><div class="kpi-value ${profit>=0?'profit-pos':'profit-neg'}">${rupee(profit)}</div></div>
    <div class="kpi-card purple"><div class="kpi-top"><span class="kpi-emoji">📊</span></div>
      <div class="kpi-label">${lang==='mr'?'नफा मार्जिन':'Profit Margin'}</div>
      <div class="kpi-value">${totalRev>0?((profit/totalRev)*100).toFixed(1)+'%':'—'}</div></div>
  `;

  // Monthly P&L chart
  const expM = new Array(12).fill(0);
  const revM = new Array(12).fill(0);
  filterExp.forEach(e => { expM[new Date(e.date).getMonth()] += Number(e.amount); });
  filterRev.forEach(r => { revM[new Date(r.date).getMonth()] += Number(r.amount); });
  const profitM = revM.map((r,i)=>r-expM[i]);
  const labels = lang==='mr'?MONTHS_MR:MONTHS_EN;

  destroyChart('cMonthPL');
  const c1 = document.getElementById('cMonthPL');
  if (c1) chartInstances['cMonthPL'] = new Chart(c1, {
    type: 'bar',
    data: { labels, datasets: [
      { label: t('revenue'),  data: revM,   backgroundColor: 'rgba(76,175,80,.8)',  borderRadius:4 },
      { label: t('expenses'), data: expM,   backgroundColor: 'rgba(239,83,80,.75)', borderRadius:4 },
      { label: t('profit'),   data: profitM, backgroundColor: profitM.map(v=>v>=0?'rgba(33,150,243,.7)':'rgba(244,67,54,.7)'), borderRadius:4 }
    ]},
    options: chartOpts()
  });

  // Crop-wise profit
  destroyChart('cCropProfit');
  const c2 = document.getElementById('cCropProfit');
  if (c2) {
    const cropProfit = {};
    db.crops.forEach(crop => {
      const cExp = filterExp.filter(e=>e.cropId===crop.id).reduce((s,e)=>s+Number(e.amount),0);
      const cRev = filterRev.filter(r=>r.cropId===crop.id).reduce((s,r)=>s+Number(r.amount),0);
      if (cExp > 0 || cRev > 0) cropProfit[crop.name] = cRev - cExp;
    });
    if (Object.keys(cropProfit).length > 0) {
      chartInstances['cCropProfit'] = new Chart(c2, {
        type: 'bar',
        data: { labels: Object.keys(cropProfit), datasets: [{ label: t('profit'),
          data: Object.values(cropProfit),
          backgroundColor: Object.values(cropProfit).map(v=>v>=0?'rgba(76,175,80,.8)':'rgba(239,83,80,.75)'), borderRadius:4 }]},
        options: chartOpts()
      });
    }
  }

  // Farm comparison
  destroyChart('cFarmComp');
  const c3 = document.getElementById('cFarmComp');
  if (c3 && db.farms.length > 0) {
    const fLabels = db.farms.map(f=>f.name);
    const fExp = db.farms.map(f => filterExp.filter(e=>e.farmId===f.id).reduce((s,e)=>s+Number(e.amount),0));
    const fRev = db.farms.map(f => filterRev.filter(r=>r.farmId===f.id).reduce((s,r)=>s+Number(r.amount),0));
    chartInstances['cFarmComp'] = new Chart(c3, {
      type: 'bar',
      data: { labels: fLabels, datasets: [
        { label: t('revenue'),  data: fRev, backgroundColor: 'rgba(76,175,80,.8)',  borderRadius:4 },
        { label: t('expenses'), data: fExp, backgroundColor: 'rgba(239,83,80,.75)', borderRadius:4 }
      ]},
      options: chartOpts()
    });
  }

  // Yearly comparison
  destroyChart('cYearComp');
  const c4 = document.getElementById('cYearComp');
  if (c4) {
    const years = getYearsInData();
    const cy = new Date().getFullYear();
    if (!years.includes(cy)) years.push(cy);
    years.sort();
    const yExp = years.map(y=>db.expenses.filter(e=>getYear(e.date)===y).reduce((s,e)=>s+Number(e.amount),0));
    const yRev = years.map(y=>db.revenue.filter(r=>getYear(r.date)===y).reduce((s,r)=>s+Number(r.amount),0));
    chartInstances['cYearComp'] = new Chart(c4, {
      type: 'bar',
      data: { labels: years, datasets: [
        { label: t('revenue'),  data: yRev, backgroundColor: 'rgba(76,175,80,.8)',  borderRadius:4 },
        { label: t('expenses'), data: yExp, backgroundColor: 'rgba(239,83,80,.75)', borderRadius:4 }
      ]},
      options: chartOpts()
    });
  }

  // Month breakdown table
  const tbody = document.getElementById('analyticsMonthTable');
  if (tbody) {
    tbody.innerHTML = labels.map((m,i) => {
      const p = revM[i] - expM[i];
      return `<tr>
        <td>${m}</td>
        <td style="color:var(--g2)">${rupee(revM[i])}</td>
        <td style="color:var(--red)">${rupee(expM[i])}</td>
        <td class="${p>=0?'profit-pos':'profit-neg'}">${rupee(p)}</td>
        <td><span class="badge ${p>=0?'badge-green':'badge-red'}">${p>=0?t('profitLabel'):t('lossLabel')}</span></td>
      </tr>`;
    }).join('');
  }
}

/* ===================== REPORTS ===================== */
function generateReport(type) {
  const result = getReportData(type);
  const container = document.getElementById('r'+type.charAt(0).toUpperCase()+type.slice(1)+'Result');
  if (!container) return;
  if (!result || result.rows.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="es-icon">📊</div><p>${t('noProfitData')}</p></div>`;
    return;
  }
  const headerHtml = result.headers.map(h=>`<th>${h}</th>`).join('');
  const rowsHtml = result.rows.map(row=>`<tr>${row.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('');
  const total = result.total ? `<tr class="report-total-row"><td colspan="${result.headers.length-1}"><strong>Total</strong></td><td><strong>${rupee(result.total)}</strong></td></tr>` : '';
  container.innerHTML = `<div class="report-table-wrap">
    <div class="table-scroll">
      <table><thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}${total}</tbody></table>
    </div>
    <div class="table-foot">
      <span>${result.rows.length} records</span>
      ${result.total?`<strong>Total: ${rupee(result.total)}</strong>`:''}
    </div>
  </div>`;
}
function getReportData(type) {
  if (type === 'exp') {
    const from  = document.getElementById('rExpFrom')?.value || '';
    const to    = document.getElementById('rExpTo')?.value   || '';
    const farmF = document.getElementById('rExpFarm')?.value || '';
    const catF  = document.getElementById('rExpCat')?.value  || '';
    let rows = db.expenses.filter(e => {
      if (from && e.date < from) return false;
      if (to   && e.date > to)   return false;
      if (farmF && e.farmId !== farmF) return false;
      if (catF  && e.category !== catF) return false;
      return true;
    }).sort((a,b)=>a.date.localeCompare(b.date));
    const total = rows.reduce((s,e)=>s+Number(e.amount),0);
    return {
      headers: [t('date'),t('farm'),t('crop'),t('category'),t('description'),t('amount'),t('payment')],
      rows: rows.map(e=>[fmt(e.date),getFarmName(e.farmId),getCropName(e.cropId),e.category,e.description||'-',rupee(e.amount),e.payment]),
      total, raw: rows
    };
  }
  if (type === 'rev') {
    const from  = document.getElementById('rRevFrom')?.value || '';
    const to    = document.getElementById('rRevTo')?.value   || '';
    const farmF = document.getElementById('rRevFarm')?.value || '';
    const cropF = document.getElementById('rRevCrop')?.value || '';
    let rows = db.revenue.filter(r => {
      if (from && r.date < from) return false;
      if (to   && r.date > to)   return false;
      if (farmF && r.farmId !== farmF) return false;
      if (cropF && r.cropId !== cropF) return false;
      return true;
    }).sort((a,b)=>a.date.localeCompare(b.date));
    const total = rows.reduce((s,r)=>s+Number(r.amount),0);
    return {
      headers: [t('date'),t('farm'),t('crop'),t('quantity'),t('rate'),t('amount'),t('buyer'),t('payment')],
      rows: rows.map(r=>[fmt(r.date),getFarmName(r.farmId),getCropName(r.cropId),r.qty+' '+r.unit,rupee(r.rate)+'/'+r.unit,rupee(r.amount),r.buyer||'-',r.payment]),
      total, raw: rows
    };
  }
  if (type === 'pl') {
    const year  = parseInt(document.getElementById('rPLYear')?.value) || new Date().getFullYear();
    const farmF = document.getElementById('rPLFarm')?.value || '';
    const exp = db.expenses.filter(e=>getYear(e.date)===year && (!farmF||e.farmId===farmF));
    const rev = db.revenue.filter(r=>getYear(r.date)===year && (!farmF||r.farmId===farmF));
    const rows = [];
    for (let m=0;m<12;m++) {
      const mExp = exp.filter(e=>new Date(e.date).getMonth()===m).reduce((s,e)=>s+Number(e.amount),0);
      const mRev = rev.filter(r=>new Date(r.date).getMonth()===m).reduce((s,r)=>s+Number(r.amount),0);
      const mProfit = mRev - mExp;
      rows.push([(lang==='mr'?MONTHS_MR:MONTHS_EN)[m]+' '+year, rupee(mRev), rupee(mExp), rupee(mProfit), mProfit>=0?'✅ Profit':'❌ Loss']);
    }
    return { headers: [t('month'),t('revenue'),t('expenses'),t('profit'),t('status')], rows };
  }
  if (type === 'crop') {
    const farmF = document.getElementById('rCropFarm')?.value || '';
    const cropF = document.getElementById('rCropCrop')?.value || '';
    const crops = db.crops.filter(c => (!farmF||c.farmId===farmF) && (!cropF||c.id===cropF));
    const rows = crops.map(c => {
      const cExp = db.expenses.filter(e=>e.cropId===c.id).reduce((s,e)=>s+Number(e.amount),0);
      const cRev = db.revenue.filter(r=>r.cropId===c.id).reduce((s,r)=>s+Number(r.amount),0);
      const p = cRev - cExp;
      return [c.name, getFarmName(c.farmId), t(c.status), fmt(c.plantDate), fmt(c.harvestDate), rupee(cExp), rupee(cRev), rupee(p), p>=0?'✅':'❌'];
    });
    return { headers: [t('cropName'),t('farm'),t('status'),t('plantingDate'),t('harvestDate'),t('expenses'),t('revenue'),t('profit'),''], rows };
  }
}
function downloadReportPDF(type) {
  const result = getReportData(type);
  if (!result || result.rows.length===0) { showToast('No data to export','warning'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const ownr = db.settings.owner || 'Mali Farm Manager';
  doc.setFontSize(16); doc.text('Mali Farm Manager', 14, 18);
  doc.setFontSize(11); doc.text(ownr, 14, 26);
  doc.setFontSize(10); doc.text('Report: ' + type.toUpperCase() + ' | Generated: ' + new Date().toLocaleDateString(), 14, 32);
  doc.autoTable({ head:[result.headers], body: result.rows, startY: 38, styles:{fontSize:8}, headStyles:{fillColor:[46,125,50]} });
  if (result.total) {
    const finalY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(11); doc.text('Total: ' + rupee(result.total), 14, finalY);
  }
  doc.save('mali_' + type + '_report.pdf');
}
function downloadReportExcel(type) {
  const result = getReportData(type);
  if (!result || result.rows.length===0) { showToast('No data to export','warning'); return; }
  const ws = XLSX.utils.aoa_to_sheet([result.headers, ...result.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type.toUpperCase());
  XLSX.writeFile(wb, 'mali_' + type + '_report.xlsx');
}
function downloadReportCSV(type) {
  const result = getReportData(type);
  if (!result || result.rows.length===0) { showToast('No data to export','warning'); return; }
  const csv = [result.headers, ...result.rows].map(row=>row.join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mali_' + type + '_report.csv';
  a.click();
}

/* ===================== NOTIFICATIONS ===================== */
function requestNotifPermission() {
  if (!('Notification' in window)) {
    showToast('Notifications not supported in this browser','warning');
    return;
  }
  Notification.requestPermission().then(perm => {
    const el = document.getElementById('notifStatus');
    if (perm === 'granted') {
      if (el) el.textContent = '✅ Notifications enabled';
      showToast('Notifications enabled 🔔');
    } else {
      if (el) el.textContent = '❌ Permission denied';
      showToast('Notification permission denied','error');
    }
  });
}
function scheduleNotificationCheck() {
  if (Notification.permission !== 'granted') return;
  const todayStr = today();
  const tomorrowStr = new Date(Date.now()+86400000).toISOString().split('T')[0];
  db.tasks.forEach(tsk => {
    if (tsk.status === 'done' || tsk.notified) return;
    let shouldNotify = false;
    if (tsk.reminder === 'onday'  && tsk.date === todayStr)     shouldNotify = true;
    if (tsk.reminder === '1day'   && tsk.date === tomorrowStr)  shouldNotify = true;
    if (tsk.reminder === '2day') {
      const d2 = new Date(Date.now()+2*86400000).toISOString().split('T')[0];
      if (tsk.date === d2) shouldNotify = true;
    }
    if (shouldNotify) {
      new Notification('🌾 Mali Farm Manager', {
        body: tsk.description + (getFarmName(tsk.farmId) ? ' · ' + getFarmName(tsk.farmId) : ''),
        icon: 'public/favicon.svg'
      });
      tsk.notified = true;
      saveDB();
    }
  });
}

/* ===================== DATA BACKUP / RESTORE ===================== */
function exportData() {
  const json = JSON.stringify(db, null, 2);
  const blob = new Blob([json], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'mali_farm_backup_' + today() + '.json';
  a.click();
  showToast('Data exported successfully 📤');
}
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.farms && !data.expenses) throw new Error('Invalid format');
      confirmAction('Import will merge with existing data. Continue?', () => {
        // Merge (avoid duplicates by id)
        ['farms','crops','expenses','revenue','tasks'].forEach(key => {
          if (data[key]) {
            const existing = new Set(db[key].map(x=>x.id));
            data[key].forEach(item => { if (!existing.has(item.id)) db[key].push(item); });
          }
        });
        if (data.settings) db.settings = {...db.settings, ...data.settings};
        saveDB();
        populateFilterDropdowns();
        renderDashboard();
        showToast('Data imported successfully 📥');
        initSettings();
      }, false);
    } catch(err) {
      showToast('Import failed: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
function clearSection(section) {
  const msg = section === 'all' ? 'Delete ALL data? This cannot be undone!' :
              section === 'expenses' ? 'Delete all expense records?' : 'Delete all revenue records?';
  confirmAction(msg, () => {
    if (section === 'all') {
      // Wipe every key from localStorage so nothing auto-restores on reload
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY + '_initialized');
      db = { farms:[], crops:[], expenses:[], revenue:[], tasks:[], settings:{} };
      // Re-save the now-empty DB so the key exists but is genuinely blank.
      // Mark as "seen" so demo data is never auto-loaded again.
      localStorage.setItem(STORAGE_KEY + '_initialized', '1');
      saveDB();
    } else if (section === 'expenses') {
      db.expenses = [];
      saveDB();
    } else {
      db.revenue = [];
      saveDB();
    }
    populateFilterDropdowns();
    populateYearDropdowns();
    initSettings();
    renderDashboard();
    showToast(lang === 'mr' ? 'यशस्वीरित्या साफ केले ✅' : 'Cleared successfully ✅');
  }, false);
}

/* ===================== HELPER FUNCTIONS ===================== */
function getFarmName(id) {
  if (!id) return '';
  const f = db.farms.find(x=>x.id===id);
  return f ? f.name : '-';
}
function getCropName(id) {
  if (!id) return '';
  const c = db.crops.find(x=>x.id===id);
  return c ? c.name : '-';
}

/* ===================== SERVICE WORKER REGISTRATION ===================== */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        // Listen for new SW waiting to activate
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version is ready — show toast and auto-reload after 3 seconds
              showToast('🔄 New version available! Updating…', 'info');
              setTimeout(() => window.location.reload(), 3000);
            }
          });
        });
      })
      .catch(err => console.warn('SW registration failed:', err));

    // Also listen for the SW_UPDATED message posted from sw.js activate
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        showToast('✅ App updated to latest version!', 'info');
        setTimeout(() => window.location.reload(), 2000);
      }
    });
  });
}

/* ===================== CROP FILTER in revenue page ===================== */
document.addEventListener('change', e => {
  if (e.target.id === 'revFarmFilter') {
    const crops = db.crops.filter(c=>!e.target.value || c.farmId===e.target.value);
    const sel = document.getElementById('revCropFilter');
    if (sel) sel.innerHTML = `<option value="">${t('allCrops')}</option>` + crops.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  }
  if (e.target.id === 'expFarmFilter') {
    const crops = db.crops.filter(c=>!e.target.value || c.farmId===e.target.value);
    const sel = document.getElementById('expCropFilter');
    if (sel) sel.innerHTML = `<option value="">${t('allCrops')}</option>` + crops.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  }
});

/* ===================== DEMO DATA (manual load only) =====================
 * Called ONLY when the user explicitly clicks "Load Demo Data".
 * NEVER called automatically on init or refresh.
 * ===================================================================== */
function loadDemoData() {
  confirmAction(
    lang === 'mr'
      ? 'डेमो डेटा लोड करायचा? हे सध्याच्या डेटामध्ये जोडेल.'
      : 'Load demo data? This will add sample records to your current data.',
    () => {
      const f1id = uid(), f2id = uid(), f3id = uid();
      const c1id = uid(), c2id = uid(), c3id = uid(), c4id = uid();
      db.farms.push(
        { id:f1id, name:'Home Farm',       village:'Pune',      area:'5 Acres', owner:'Balasaheb Mali', notes:'Main family farm',       createdAt:new Date().toISOString() },
        { id:f2id, name:'East Farm',        village:'Nashik',    area:'3 Acres', owner:'Balasaheb Mali', notes:'Seasonal crops',           createdAt:new Date().toISOString() },
        { id:f3id, name:'Sugarcane Farm',   village:'Kolhapur',  area:'8 Acres', owner:'Balasaheb Mali', notes:'Dedicated to sugarcane',   createdAt:new Date().toISOString() }
      );
      db.crops.push(
        { id:c1id, farmId:f1id, name:'Tomato / टोमॅटो', plantDate:'2025-01-15', harvestDate:'2025-04-15', area:'2 Acres',   status:'growing',   notes:'', createdAt:new Date().toISOString() },
        { id:c2id, farmId:f1id, name:'Onion / कांदा',   plantDate:'2025-02-01', harvestDate:'2025-05-01', area:'1.5 Acres', status:'growing',   notes:'', createdAt:new Date().toISOString() },
        { id:c3id, farmId:f2id, name:'Wheat / गहू',     plantDate:'2024-11-01', harvestDate:'2025-03-15', area:'3 Acres',   status:'harvested', notes:'', createdAt:new Date().toISOString() },
        { id:c4id, farmId:f3id, name:'Sugarcane / ऊस',  plantDate:'2024-06-01', harvestDate:'2025-12-01', area:'8 Acres',   status:'growing',   notes:'', createdAt:new Date().toISOString() }
      );
      const cy = new Date().getFullYear();
      const em = m => `${cy}-${String(m).padStart(2,'0')}-${String(Math.floor(Math.random()*20)+1).padStart(2,'0')}`;
      db.expenses.push(
        { id:uid(), farmId:f1id, cropId:c1id, date:em(1), category:'Seeds / बियाणे',          description:'Tomato seeds purchase',        amount:3200,  payment:'Cash / रोख',       notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:c1id, date:em(1), category:'Fertilizers / खते',       description:'DAP fertilizer',               amount:5500,  payment:'UPI',               notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:c2id, date:em(2), category:'Workers / मजुरी',         description:'Labour for planting',          amount:8000,  payment:'Cash / रोख',       notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f3id, cropId:c4id, date:em(2), category:'Irrigation / सिंचन',      description:'Drip irrigation maintenance',  amount:4200,  payment:'Cheque / धनादेश', notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f2id, cropId:c3id, date:em(3), category:'Tractor / ट्रॅक्टर',     description:'Tractor rental for harvesting',amount:6000,  payment:'Cash / रोख',       notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:c1id, date:em(3), category:'Pesticides / कीटकनाशके', description:'Fungicide spray',              amount:2800,  payment:'UPI',               notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f3id, cropId:c4id, date:em(4), category:'Fertilizers / खते',       description:'Urea top dressing',            amount:3600,  payment:'Cash / रोख',       notes:'', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:c2id, date:em(5), category:'Transport / वाहतूक',      description:'Onion transport to market',    amount:1800,  payment:'Cash / रोख',       notes:'', createdAt:new Date().toISOString() }
      );
      db.revenue.push(
        { id:uid(), farmId:f2id, cropId:c3id, date:em(3), qty:50,  unit:'quintal', rate:2100, amount:105000, buyer:'Datta Traders', payment:'Cheque / धनादेश', notes:'Wheat harvest sale',      createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:c1id, date:em(4), qty:800, unit:'kg',      rate:28,   amount:22400,  buyer:'Rahul Patil',   payment:'UPI',               notes:'First harvest tomatoes', createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:c2id, date:em(5), qty:200, unit:'kg',      rate:35,   amount:7000,   buyer:'APMC Market',   payment:'Cash / रोख',       notes:'Onion sale',             createdAt:new Date().toISOString() }
      );
      db.tasks.push(
        { id:uid(), farmId:f1id, cropId:c1id, description:'Spray pesticide on tomato crop', date:today(),                                                         time:'07:00', priority:'high',   status:'pending', reminder:'onday', notes:'Use neem oil', notified:false, createdAt:new Date().toISOString() },
        { id:uid(), farmId:f3id, cropId:c4id, description:'Irrigate sugarcane field',        date:new Date(Date.now()+86400000).toISOString().split('T')[0],       time:'06:00', priority:'medium', status:'pending', reminder:'1day',  notes:'',           notified:false, createdAt:new Date().toISOString() },
        { id:uid(), farmId:f1id, cropId:'',   description:'Pay farm workers',                date:new Date(Date.now()+2*86400000).toISOString().split('T')[0],     time:'10:00', priority:'high',   status:'pending', reminder:'2day',  notes:'₹8000 total',notified:false, createdAt:new Date().toISOString() }
      );
      saveDB();
      populateFilterDropdowns();
      populateYearDropdowns();
      renderDashboard();
      showToast(lang === 'mr' ? 'डेमो डेटा लोड झाला ✅' : 'Demo data loaded ✅');
    },
    false
  );
}
