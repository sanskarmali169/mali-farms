/* =============================================================
   Mali Farm Manager  —  firebase.js
   Firebase Authentication + Firestore + LocalStorage Migration
   ============================================================= */

'use strict';

// ── Firebase SDK (v9 compat CDN) loaded in index.html ──────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCd6ROrDbCylojBuS0tANrD_xDfqLOjuhM",
  authDomain:        "mali-farm-manager.firebaseapp.com",
  projectId:         "mali-farm-manager",
  storageBucket:     "mali-farm-manager.firebasestorage.app",
  messagingSenderId: "441265860755",
  appId:             "1:441265860755:web:797770f04317ebd103dd66",
  measurementId:     "G-LGFZVKQ32W"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const fsdb = firebase.firestore();

// Enable Firestore offline persistence (works across tabs, survives no-internet)
fsdb.enablePersistence({ synchronizeTabs: true })
  .catch(err => {
    if (err.code === 'failed-precondition') console.warn('Firestore persistence: multiple tabs open');
    else if (err.code === 'unimplemented')  console.warn('Firestore persistence: browser not supported');
  });

/* ── Constants ──────────────────────────────────────────────────── */
const MIGRATION_FLAG  = 'maliFarm_migrated_v1';
const LS_KEY          = 'maliFarmData';
const COLLECTIONS     = ['farms','crops','expenses','revenue','tasks','calTasks','diaryNotes'];
let   currentUser     = null;
let   firestoreUnsubs = [];   // holds onSnapshot unsubscribe functions

/* ================================================================
   AUTH STATE OBSERVER
   Shows login screen or app depending on auth state.
================================================================ */
auth.onAuthStateChanged(async user => {
  if (user) {
    currentUser = user;
    showAuthScreen(false);
    showLoadingOverlay('Loading your farm data…');

    // ── Migrate LocalStorage → Firestore (first login only) ──────
    await maybeRunMigration(user.uid);

    // ── Subscribe to real-time Firestore listeners ────────────────
    subscribeToFirestore(user.uid);

    // Update user info in sidebar
    const el = document.getElementById('authUserInfo');
    if (el) el.textContent = user.email;

  } else {
    currentUser = null;
    // Detach all Firestore listeners
    firestoreUnsubs.forEach(u => u());
    firestoreUnsubs = [];
    showAuthScreen(true);
    hideLoadingOverlay();
  }
});

/* ================================================================
   SHOW / HIDE AUTH SCREEN vs APP
================================================================ */
function showAuthScreen(show) {
  const authWrap = document.getElementById('authWrapper');
  const appWrap  = document.getElementById('appWrapper');
  if (authWrap) authWrap.style.display = show ? 'flex'   : 'none';
  if (appWrap)  appWrap.style.display  = show ? 'none'   : 'flex';
}

/* ================================================================
   LOGIN
================================================================ */
async function fbLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const pass  = document.getElementById('authPass').value;
  const errEl = document.getElementById('authError');
  errEl.style.color = '';
  errEl.textContent = '';
  if (!email || !pass) { errEl.textContent = 'Please enter email and password.'; return; }
  setBtnLoading('authLoginBtn', true, '🔐 Login');
  try {
    await auth.signInWithEmailAndPassword(email, pass);
    // onAuthStateChanged will handle the rest — no need to reset button
  } catch (e) {
    console.error('Login error:', e.code, e.message);
    errEl.textContent = friendlyAuthError(e.code, e.message);
    setBtnLoading('authLoginBtn', false, '🔐 Login');
  }
}

/* ================================================================
   REGISTER (Sign Up)
================================================================ */
async function fbRegister() {
  const email = document.getElementById('authEmail').value.trim();
  const pass  = document.getElementById('authPass').value;
  const errEl = document.getElementById('authError');
  errEl.style.color = '';
  errEl.textContent = '';
  if (!email || !pass) { errEl.textContent = 'Please enter email and password.'; return; }
  if (pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
  setBtnLoading('authRegisterBtn', true, '✅ Create Account');
  try {
    await auth.createUserWithEmailAndPassword(email, pass);
    // onAuthStateChanged will handle the rest — no need to reset button
  } catch (e) {
    console.error('Register error:', e.code, e.message);
    errEl.textContent = friendlyAuthError(e.code, e.message);
    setBtnLoading('authRegisterBtn', false, '✅ Create Account');
  }
}

/* ================================================================
   FORGOT PASSWORD
================================================================ */
async function fbForgotPassword() {
  const email = document.getElementById('authEmail').value.trim();
  const errEl = document.getElementById('authError');
  errEl.style.color = '';
  errEl.textContent = '';
  if (!email) { errEl.textContent = 'Enter your email address first, then click Forgot Password.'; return; }
  try {
    await auth.sendPasswordResetEmail(email);
    errEl.style.color = 'var(--g2)';
    errEl.textContent = '✅ Password reset email sent! Check your inbox.';
  } catch (e) {
    console.error('Forgot password error:', e.code, e.message);
    errEl.style.color = '';
    errEl.textContent = friendlyAuthError(e.code, e.message);
  }
}

/* ================================================================
   LOGOUT
================================================================ */
async function fbLogout() {
  firestoreUnsubs.forEach(u => u());
  firestoreUnsubs = [];
  await auth.signOut();
  // Reset in-memory db so stale data doesn't flash
  if (typeof db !== 'undefined') {
    db.farms=[]; db.crops=[]; db.expenses=[]; db.revenue=[]; db.tasks=[]; db.settings={};
  }
}

/* ================================================================
   LOADING OVERLAY
================================================================ */
function showLoadingOverlay(msg) {
  let el = document.getElementById('fbLoadingOverlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fbLoadingOverlay';
    el.innerHTML = `<div class="fb-loading-box">
      <div class="fb-spinner"></div>
      <p id="fbLoadingMsg">${msg || 'Loading…'}</p>
    </div>`;
    document.body.appendChild(el);
  } else {
    el.style.display = 'flex';
    document.getElementById('fbLoadingMsg').textContent = msg || 'Loading…';
  }
}
function hideLoadingOverlay() {
  const el = document.getElementById('fbLoadingOverlay');
  if (el) el.style.display = 'none';
}
function updateLoadingMsg(msg) {
  const el = document.getElementById('fbLoadingMsg');
  if (el) el.textContent = msg;
}

/* ================================================================
   LOCALSTORAGE → FIRESTORE MIGRATION
   Runs once per account. Safe to call again — uses doc IDs from
   LocalStorage so duplicates are impossible.
================================================================ */
async function maybeRunMigration(uid) {
  // Check if this account has already been migrated
  const flagDoc = await fsdb.collection('users').doc(uid)
    .collection('meta').doc('migration').get();

  if (flagDoc.exists && flagDoc.data().done === true) {
    // Already migrated — nothing to do
    return;
  }

  // Check if there's anything in LocalStorage to migrate
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    // No LocalStorage data — just mark as migrated and continue
    await markMigrationDone(uid);
    return;
  }

  let lsData;
  try { lsData = JSON.parse(raw); } catch(e) {
    console.warn('Migration: LocalStorage parse error', e);
    await markMigrationDone(uid);
    return;
  }

  const hasData = COLLECTIONS.some(k => lsData[k] && lsData[k].length > 0);
  if (!hasData) {
    await markMigrationDone(uid);
    return;
  }

  // ── Run the migration ──────────────────────────────────────────
  updateLoadingMsg('Migrating your existing data to the cloud… Please wait.');
  console.log('🔄 Starting LocalStorage → Firestore migration');

  let totalMigrated = 0;

  for (const col of COLLECTIONS) {
    const items = lsData[col] || [];
    if (items.length === 0) continue;

    // Firestore batch writes (max 500 per batch)
    const chunks = chunkArray(items, 400);
    for (const chunk of chunks) {
      const batch = fsdb.batch();
      chunk.forEach(item => {
        if (!item.id) return;
        const ref = fsdb.collection('users').doc(uid)
          .collection(col).doc(item.id);
        // setMerge: won't overwrite if doc already exists from a partial run
        batch.set(ref, sanitiseForFirestore(item), { merge: true });
      });
      await batch.commit();
      totalMigrated += chunk.length;
    }
    console.log(`✅ Migrated ${items.length} records from "${col}"`);
  }

  // Migrate settings
  if (lsData.settings && Object.keys(lsData.settings).length > 0) {
    await fsdb.collection('users').doc(uid)
      .collection('meta').doc('settings')
      .set(lsData.settings, { merge: true });
  }

  await markMigrationDone(uid);
  console.log(`🎉 Migration complete — ${totalMigrated} records moved to Firestore`);
  updateLoadingMsg('Migration complete! Loading app…');
}

async function markMigrationDone(uid) {
  await fsdb.collection('users').doc(uid)
    .collection('meta').doc('migration')
    .set({ done: true, timestamp: firebase.firestore.FieldValue.serverTimestamp() });
}

/* ================================================================
   REAL-TIME FIRESTORE LISTENERS
   Each collection gets an onSnapshot listener. When Firestore
   updates (from any device), we update the in-memory db and
   re-render the current page automatically.
================================================================ */
function subscribeToFirestore(uid) {
  // Detach previous listeners
  firestoreUnsubs.forEach(u => u());
  firestoreUnsubs = [];

  let initialLoadCount = 0;
  const TOTAL_COLLECTIONS = COLLECTIONS.length + 1; // +1 for settings

  function onCollectionReady() {
    initialLoadCount++;
    if (initialLoadCount >= TOTAL_COLLECTIONS) {
      hideLoadingOverlay();
      // Boot the app with loaded data
      if (typeof initApp === 'function') initApp();
    }
  }

  COLLECTIONS.forEach(col => {
    const unsub = fsdb.collection('users').doc(uid)
      .collection(col)
      .onSnapshot(snapshot => {
        // Replace the in-memory array with fresh Firestore data
        db[col] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        onCollectionReady();
        // Re-render current page if app is already running
        if (initialLoadCount >= TOTAL_COLLECTIONS) {
          refreshCurrentPage();
          if (typeof populateFilterDropdowns === 'function') populateFilterDropdowns();
          if (typeof populateYearDropdowns   === 'function') populateYearDropdowns();
        }
      }, err => {
        console.error(`Firestore listener error (${col}):`, err);
        onCollectionReady(); // don't block app startup on error
      });
    firestoreUnsubs.push(unsub);
  });

  // Settings
  const settingsUnsub = fsdb.collection('users').doc(uid)
    .collection('meta').doc('settings')
    .onSnapshot(snap => {
      if (snap.exists) db.settings = snap.data() || {};
      onCollectionReady();
      if (initialLoadCount >= TOTAL_COLLECTIONS) {
        if (typeof initSettings === 'function') initSettings();
      }
    }, err => {
      console.error('Firestore settings listener error:', err);
      onCollectionReady();
    });
  firestoreUnsubs.push(settingsUnsub);
}

/* ================================================================
   FIRESTORE CRUD — replaces LocalStorage saveDB()
   app.js calls saveDB() after every change.
   We override saveDB() here so it writes to Firestore instead.
================================================================ */

// Override saveDB — write the *changed* items to Firestore
// We do a full collection sync on every save (simple & reliable for this app size)
window.saveDB = async function() {
  // Still keep LocalStorage as backup
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(e) {}

  if (!currentUser) return;
  const uid = currentUser.uid;

  // Write all collections (batched)
  for (const col of COLLECTIONS) {
    const items = db[col] || [];
    if (items.length === 0) continue;
    const chunks = chunkArray(items, 400);
    for (const chunk of chunks) {
      const batch = fsdb.batch();
      chunk.forEach(item => {
        if (!item.id) return;
        const ref = fsdb.collection('users').doc(uid).collection(col).doc(item.id);
        batch.set(ref, sanitiseForFirestore(item));
      });
      await batch.commit();
    }
  }

  // Save settings
  if (db.settings && Object.keys(db.settings).length > 0) {
    await fsdb.collection('users').doc(uid)
      .collection('meta').doc('settings')
      .set(db.settings, { merge: true });
  }
};

// Override saveDB for deletions — we must also delete from Firestore
// Deletions are handled by deleteFromFirestore() called in CRUD functions
window.deleteFromFirestore = async function(col, id) {
  if (!currentUser || !id) return;
  await fsdb.collection('users').doc(currentUser.uid)
    .collection(col).doc(id).delete();
};

/* ================================================================
   PATCHING app.js CRUD FUNCTIONS to call deleteFromFirestore
   We wrap the existing delete* functions after app.js loads.
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Patch deleteExpense
  const _origDeleteExpense = window.deleteExpense;
  window.deleteExpense = function(id) {
    const e = db.expenses.find(x => x.id === id);
    if (!e) return;
    confirmAction(`Delete expense of ${rupee(e.amount)}?`, async () => {
      pushUndo('expenses', e);
      db.expenses = db.expenses.filter(x => x.id !== id);
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
      await deleteFromFirestore('expenses', id);
      renderExpTable(); renderExpKPI(); renderExpChart();
    });
  };

  // Patch deleteRevenue
  window.deleteRevenue = function(id) {
    const r = db.revenue.find(x => x.id === id);
    if (!r) return;
    confirmAction(`Delete sale of ${rupee(r.amount)}?`, async () => {
      pushUndo('revenue', r);
      db.revenue = db.revenue.filter(x => x.id !== id);
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
      await deleteFromFirestore('revenue', id);
      renderRevTable(); renderRevKPI();
    });
  };

  // Patch deleteFarm
  window.deleteFarm = function(id) {
    const f = db.farms.find(x => x.id === id);
    if (!f) return;
    confirmAction(`Delete farm "${f.name}"?`, async () => {
      db.farms = db.farms.filter(x => x.id !== id);
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
      await deleteFromFirestore('farms', id);
      populateFilterDropdowns(); renderFarmsPage();
      showToast('Farm deleted');
    }, false);
  };

  // Patch deleteCrop
  window.deleteCrop = function(id) {
    const c = db.crops.find(x => x.id === id);
    if (!c) return;
    confirmAction(`Delete crop "${c.name}"?`, async () => {
      pushUndo('crops', c);
      db.crops = db.crops.filter(x => x.id !== id);
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
      await deleteFromFirestore('crops', id);
      renderCropsPage();
    });
  };

  // Patch deleteTask
  window.deleteTask = function(id) {
    const tsk = db.tasks.find(x => x.id === id);
    if (!tsk) return;
    confirmAction(`Delete task "${tsk.description}"?`, async () => {
      pushUndo('tasks', tsk);
      db.tasks = db.tasks.filter(x => x.id !== id);
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
      await deleteFromFirestore('tasks', id);
      renderTasks(document.querySelector('.tstab.active')?.dataset.filter || 'all');
    });
  };

  // Patch deleteDiaryNote for Firestore
  window.deleteDiaryNote = function(id, dateStr) {
    confirmAction(typeof lang!=='undefined'&&lang==='mr'?'ही नोंद हटवायची?':'Delete this note?', async () => {
      db.diaryNotes = (db.diaryNotes||[]).filter(n=>n.id!==id);
      try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
      await deleteFromFirestore('diaryNotes', id);
      if (typeof renderDiaryPage === 'function') renderDiaryPage(dateStr || (typeof diaryDate!=='undefined'?diaryDate:null));
      showToast('Note deleted');
    });
  };

  // Patch clearSection — must also delete all Firestore docs
  window.clearSection = function(section) {
    const msg = section === 'all'      ? 'Delete ALL data? This cannot be undone!' :
                section === 'expenses' ? 'Delete all expense records?' : 'Delete all revenue records?';
    confirmAction(msg, async () => {
      const uid = currentUser ? currentUser.uid : null;
      if (section === 'all') {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_KEY + '_initialized');
        db = { farms:[], crops:[], expenses:[], revenue:[], tasks:[], settings:{} };
        localStorage.setItem(LS_KEY + '_initialized', '1');
        try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
        if (uid) {
          for (const col of COLLECTIONS) await deleteCollection(uid, col);
        }      } else if (section === 'expenses') {
        const ids = db.expenses.map(e => e.id);
        db.expenses = [];
        try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
        if (uid) for (const id of ids) await deleteFromFirestore('expenses', id);
      } else {
        const ids = db.revenue.map(r => r.id);
        db.revenue = [];
        try { localStorage.setItem(LS_KEY, JSON.stringify(db)); } catch(_) {}
        if (uid) for (const id of ids) await deleteFromFirestore('revenue', id);
      }
      populateFilterDropdowns(); populateYearDropdowns(); initSettings(); renderDashboard();
      showToast(typeof lang !== 'undefined' && lang === 'mr' ? 'यशस्वीरित्या साफ केले ✅' : 'Cleared successfully ✅');
    }, false);
  };
});

/* ================================================================
   HELPER: delete all docs in a user's sub-collection
================================================================ */
async function deleteCollection(uid, col) {
  const snap = await fsdb.collection('users').doc(uid).collection(col).get();
  const batch = fsdb.batch();
  snap.docs.forEach(d => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
}

/* ================================================================
   HELPERS
================================================================ */
function chunkArray(arr, size) {
  const res = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i+size));
  return res;
}

// Firestore doesn't allow undefined values
function sanitiseForFirestore(obj) {
  const clean = {};
  for (const [k,v] of Object.entries(obj)) {
    clean[k] = (v === undefined) ? null : v;
  }
  return clean;
}

function friendlyAuthError(code, rawMessage) {
  const map = {
    'auth/user-not-found':         'No account found with this email. Please register first.',
    'auth/wrong-password':         'Incorrect password. Try again.',
    'auth/invalid-email':          'Invalid email address format.',
    'auth/email-already-in-use':   'An account with this email already exists. Please login.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/too-many-requests':      'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/invalid-credential':     'Invalid email or password. Please check and try again.',
    'auth/user-disabled':          'This account has been disabled.',
    'auth/operation-not-allowed':  'Email/password login is not enabled. Please contact support.',
    'auth/missing-password':       'Please enter a password.',
    'auth/missing-email':          'Please enter your email address.',
    'auth/internal-error':         'An internal error occurred. Please try again.',
  };
  if (map[code]) return map[code];
  // Show the raw Firebase message if we don't have a friendly version
  // Strip the "Firebase: " prefix Firebase often adds
  const clean = (rawMessage || '').replace(/^Firebase:\s*/i, '').replace(/\s*\(.*\)\s*$/, '');
  return clean || 'Authentication failed. Please try again. (Code: ' + code + ')';
}

function setBtnLoading(btnId, loading, defaultText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : defaultText;
}

// Legacy alias kept for any other references
function setAuthBtnLoading(loading) {
  setBtnLoading('authLoginBtn', loading, '🔐 Login');
}

/* ================================================================
   AUTH UI HELPERS
================================================================ */
function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);

  // Login tab: show Login button, hide Register button
  // Register tab: hide Login button, show Register button
  const loginBtn    = document.getElementById('authLoginBtn');
  const registerBtn = document.getElementById('authRegisterSection');
  if (loginBtn)    loginBtn.style.display    = isLogin ? 'block' : 'none';
  if (registerBtn) registerBtn.style.display = isLogin ? 'none'  : 'block';

  // Clear errors and reset button states when switching tabs
  const errEl = document.getElementById('authError');
  if (errEl) { errEl.textContent = ''; errEl.style.color = ''; }
  setBtnLoading('authLoginBtn',    false, '🔐 Login');
  setBtnLoading('authRegisterBtn', false, '✅ Create Account');
}

function togglePassVis() {
  const inp = document.getElementById('authPass');
  const btn = document.getElementById('authEyeBtn');
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  if (btn) btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

/* ================================================================
   ONLINE / OFFLINE SYNC INDICATOR
================================================================ */
function updateSyncIndicator() {
  let ind = document.getElementById('syncIndicator');
  if (!ind) {
    const footer = document.querySelector('.sidebar-footer');
    if (footer) {
      ind = document.createElement('div');
      ind.id = 'syncIndicator';
      ind.className = 'sync-indicator';
      footer.insertBefore(ind, footer.firstChild);
    }
  }
  if (!ind) return;
  const online = navigator.onLine;
  ind.innerHTML = `<span class="sync-dot ${online?'':'offline'}"></span>
    <span>${online ? '☁️ Cloud Sync Active' : '📴 Offline — syncing when online'}</span>`;
}

window.addEventListener('online',  updateSyncIndicator);
window.addEventListener('offline', updateSyncIndicator);
document.addEventListener('DOMContentLoaded', updateSyncIndicator);
