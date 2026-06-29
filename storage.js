/* =====================================================================
   storage.js
   Centralised LocalStorage persistence for Fatty Liver Nutrition Tracker.
   No backend, no login. Everything lives under one namespaced key.
   ===================================================================== */

const STORE_KEY = 'flt_pro_v1';

/* Default user profile (personalised for the target user) */
const DEFAULT_PROFILE = {
  weight: 69.5,
  height: 174,
  age: 28,
  gender: 'male',
  targetCalories: 2000,
  targetProtein: 140,
  targetCarbs: 170,
  targetFat: 55,
  targetFiber: 35,
  waterGoal: 3000,        // ml
  gymTiming: '12:30–14:00',
  footballTiming: '21:00–22:00',
  wakeTime: '07:00',
  sleepTime: '23:30',
  theme: 'auto',          // auto | light | dark
};

/* Shape of a single day's log */
function emptyDay() {
  return {
    dietOverride: null,         // null = use day rule, else 'veg' | 'nonveg'
    meals: {                    // each is array of { id, qty }
      breakfast: [],
      protein: [],
      lunch: [],
      snacks: [],
      dinner: [],
    },
    water: 0,                   // ml consumed
    gym: { done: false, duration: 60 },
    football: { done: false, time: '21:00' },
    walkAfterMeals: false,
    notes: '',
  };
}

const Storage = {
  _cache: null,

  _load() {
    if (this._cache) return this._cache;
    let data;
    try {
      data = JSON.parse(localStorage.getItem(STORE_KEY));
    } catch (e) {
      data = null;
    }
    if (!data) {
      data = { profile: { ...DEFAULT_PROFILE }, days: {}, blood: [] };
    }
    // backfill missing keys
    data.profile = { ...DEFAULT_PROFILE, ...(data.profile || {}) };
    data.days = data.days || {};
    data.blood = data.blood || [];
    this._cache = data;
    return data;
  },

  _save() {
    if (!this._cache) return;
    localStorage.setItem(STORE_KEY, JSON.stringify(this._cache));
  },

  /* ---- Profile ---- */
  getProfile() { return this._load().profile; },
  setProfile(patch) {
    const d = this._load();
    d.profile = { ...d.profile, ...patch };
    this._save();
    return d.profile;
  },

  /* ---- Days ---- */
  getDay(dateKey) {
    const d = this._load();
    if (!d.days[dateKey]) d.days[dateKey] = emptyDay();
    return d.days[dateKey];
  },
  saveDay(dateKey, dayObj) {
    const d = this._load();
    d.days[dateKey] = dayObj;
    this._save();
  },
  allDays() { return this._load().days; },

  /* ---- Blood reports ---- */
  getBlood() { return this._load().blood; },
  addBlood(entry) {
    const d = this._load();
    d.blood.push(entry);
    d.blood.sort((a, b) => new Date(a.date) - new Date(b.date));
    this._save();
  },
  deleteBlood(idx) {
    const d = this._load();
    d.blood.splice(idx, 1);
    this._save();
  },

  /* ---- Export / Import ---- */
  exportJSON() {
    return JSON.stringify(this._load(), null, 2);
  },
  importJSON(json) {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object') throw new Error('Invalid backup file');
    data.profile = { ...DEFAULT_PROFILE, ...(data.profile || {}) };
    data.days = data.days || {};
    data.blood = data.blood || [];
    this._cache = data;
    this._save();
  },

  resetAll() {
    this._cache = { profile: { ...DEFAULT_PROFILE }, days: {}, blood: [] };
    this._save();
  },
};

/* Date helpers (local time, YYYY-MM-DD) */
function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function dayName(d = new Date()) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
}

if (typeof window !== 'undefined') {
  window.Storage = Storage;
  window.emptyDay = emptyDay;
  window.dateKey = dateKey;
  window.dayName = dayName;
  window.DEFAULT_PROFILE = DEFAULT_PROFILE;
}
