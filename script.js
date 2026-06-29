/* =====================================================================
   script.js — App controller / view layer
   Ties together storage, engine, charts and blood-report modules.
   ===================================================================== */

const App = {
  selectedDate: dateKey(),     // currently viewed date (YYYY-MM-DD)
  activeView: 'today',
  activeMeal: 'breakfast',
  statRange: 'week',

  /* ---------- Init ---------- */
  init() {
    this.applyTheme(Storage.getProfile().theme);
    this.bindChrome();
    this.renderDayStrip();
    this.switchView('today');
    this.refresh();
    window.addEventListener('resize', () => { if (this.activeView === 'stats') this.renderStats(); });
  },

  get day() { return Storage.getDay(this.selectedDate); },
  saveDay() { Storage.saveDay(this.selectedDate, this.day); },

  dietFor(dk) {
    const d = Storage.getDay(dk);
    if (d.dietOverride) return d.dietOverride;
    return DAY_DIET[dayName(new Date(dk + 'T00:00'))];
  },
  get diet() { return this.dietFor(this.selectedDate); },

  /* ---------- Chrome / nav ---------- */
  bindChrome() {
    document.querySelectorAll('.tab').forEach(t =>
      t.addEventListener('click', () => this.switchView(t.dataset.view)));

    document.getElementById('themeToggle').addEventListener('click', () => this.cycleTheme());

    document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
    document.getElementById('modalBackdrop').addEventListener('click', () => this.closeModal());

    // water buttons
    document.querySelectorAll('[data-water]').forEach(b =>
      b.addEventListener('click', () => {
        const d = this.day;
        d.water = Math.max(0, d.water + parseInt(b.dataset.water));
        this.saveDay(); this.refresh();
      }));

    // activity toggles
    document.getElementById('gymToggle').addEventListener('change', e => {
      this.day.gym.done = e.target.checked; this.saveDay(); this.refresh();
    });
    document.getElementById('fbToggle').addEventListener('change', e => {
      this.day.football.done = e.target.checked; this.saveDay(); this.refresh();
    });
    document.getElementById('walkToggle').addEventListener('change', e => {
      this.day.walkAfterMeals = e.target.checked; this.saveDay(); this.refresh();
    });

    document.getElementById('scoreWhy').addEventListener('click', () => this.showScoreBreakdown());
    document.getElementById('dietOverride').addEventListener('click', () => this.toggleDietOverride());
  },

  switchView(v) {
    this.activeView = v;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
    document.querySelectorAll('.view').forEach(s => s.hidden = (s.id !== 'view-' + v));
    const titles = { today: 'Today', log: 'Log Meals', stats: 'Analytics', blood: 'Blood Report', more: 'More' };
    document.getElementById('viewTitle').textContent = titles[v];
    document.getElementById('main').scrollTop = 0;
    if (v === 'log') this.renderLog();
    if (v === 'stats') this.renderStats();
    if (v === 'blood') this.renderBlood();
    if (v === 'more') this.renderMore();
    if (v === 'today') this.refresh();
  },

  /* ---------- Theme ---------- */
  applyTheme(theme) {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  },
  cycleTheme() {
    const order = ['auto', 'light', 'dark'];
    const cur = Storage.getProfile().theme || 'auto';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    Storage.setProfile({ theme: next });
    this.applyTheme(next);
    this.toast('Theme: ' + next);
    if (this.activeView === 'today') this.refresh();
    if (this.activeView === 'stats') this.renderStats();
  },

  /* ---------- Day strip ---------- */
  renderDayStrip() {
    const strip = document.getElementById('dayStrip');
    strip.innerHTML = '';
    // show 7 days ending today
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const dk = dateKey(d);
      const pill = document.createElement('button');
      pill.className = 'day-pill' + (dk === this.selectedDate ? ' active' : '');
      pill.innerHTML = `<span>${d.getDate()}</span><span class="dn">${dayName(d).slice(0,3)}</span>`;
      pill.addEventListener('click', () => { this.selectedDate = dk; this.renderDayStrip(); this.refresh(); });
      strip.appendChild(pill);
    }
  },

  toggleDietOverride() {
    const d = this.day;
    const base = DAY_DIET[dayName(new Date(this.selectedDate + 'T00:00'))];
    const cur = d.dietOverride || base;
    d.dietOverride = (cur === 'veg') ? 'nonveg' : 'veg';
    if (d.dietOverride === base) d.dietOverride = null; // back to default
    this.saveDay();
    this.toast('Diet: ' + this.diet);
    this.refresh();
    if (this.activeView === 'log') this.renderLog();
  },

  /* ===================================================================
     DASHBOARD / TODAY
     =================================================================== */
  refresh() {
    const p = Storage.getProfile();
    const d = this.day;
    const sd = new Date(this.selectedDate + 'T00:00');
    document.getElementById('dateLabel').textContent =
      sd.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    // diet badge
    const badge = document.getElementById('dietBadge');
    badge.textContent = this.diet === 'veg' ? '🥗 Vegetarian Day' : '🍗 Non-Veg Day';
    badge.className = 'diet-badge ' + this.diet;

    // score ring
    const { score } = Engine.liverScore(d, p);
    const color = ({ green: '#34c759', yellow: '#ff9f0a', red: '#ff3b30' })[Engine.scoreColor(score)];
    Charts.ring(document.getElementById('scoreRing'), score, 100, color, String(score), '/ 100');
    document.getElementById('scoreVerdict').textContent =
      score >= 80 ? 'Liver-friendly day. Keep it up!' :
      score >= 55 ? 'Decent — a few tweaks will boost it.' :
                    'Needs attention. Check the breakdown.';

    // macros
    const totals = Engine.dayTotals(d);
    this.renderMacros(totals, p);

    // water
    const wpct = Math.min(100, d.water / p.waterGoal * 100);
    const wfill = document.getElementById('waterFill');
    wfill.style.width = wpct + '%';
    wfill.className = 'progress-fill' + (d.water >= p.waterGoal ? ' met' : '');
    document.getElementById('waterLabel').textContent = `${d.water} / ${p.waterGoal} ml`;

    // activity
    document.getElementById('gymToggle').checked = d.gym.done;
    document.getElementById('fbToggle').checked = d.football.done;
    document.getElementById('walkToggle').checked = d.walkAfterMeals;
    document.getElementById('gymSub').textContent = p.gymTiming ? 'Usual: ' + p.gymTiming : '';
    document.getElementById('fbSub').textContent = p.footballTiming ? 'Usual: ' + p.footballTiming : '';
    this.renderSeg('gymDuration', [30, 45, 60, 90, 120].map(v => ({ label: v + 'm', val: v })),
      d.gym.duration, v => { d.gym.duration = v; this.saveDay(); });
    this.renderSeg('fbTime', [{ label: '9 PM', val: '21:00' }, { label: '10 PM', val: '22:00' }],
      d.football.time, v => { d.football.time = v; this.saveDay(); });

    // coaching
    this.renderCoach(Engine.suggestions(d, p));
  },

  renderMacros(t, p) {
    const grid = document.getElementById('macroGrid');
    const items = [
      { name: 'Calories', cur: t.cal, tgt: p.targetCalories, u: 'kcal', c: '#0a84ff' },
      { name: 'Protein', cur: t.p, tgt: p.targetProtein, u: 'g', c: '#34c759' },
      { name: 'Carbs', cur: t.c, tgt: p.targetCarbs, u: 'g', c: '#ff9f0a' },
      { name: 'Fat', cur: t.f, tgt: p.targetFat, u: 'g', c: '#ff375f' },
      { name: 'Fiber', cur: t.fiber, tgt: p.targetFiber, u: 'g', c: '#30d158' },
    ];
    grid.innerHTML = items.map(m => {
      const pct = Math.min(100, m.cur / m.tgt * 100);
      const cls = m.cur > m.tgt * 1.05 ? 'over' : (m.cur >= m.tgt ? 'met' : '');
      return `<div class="macro glass">
        <div class="m-top"><span class="m-name">${m.name}</span></div>
        <div class="m-val">${Math.round(m.cur)} <small>/ ${m.tgt} ${m.u}</small></div>
        <div class="progress"><div class="progress-fill ${cls}" style="width:${pct}%;${cls ? '' : 'background:' + m.c}"></div></div>
      </div>`;
    }).join('');
  },

  renderCoach(list) {
    const host = document.getElementById('coachList');
    if (!list.length) { host.innerHTML = ''; return; }
    const ic = { good: '✅', warn: '⚠️', info: '💡' };
    host.innerHTML = '<div class="section-title">Coach</div>' + list.map(s =>
      `<div class="coach ${s.type}"><span class="ic">${ic[s.type]}</span><span>${s.text}</span></div>`).join('');
  },

  renderSeg(id, options, current, onPick) {
    const el = document.getElementById(id);
    el.innerHTML = options.map(o =>
      `<button data-val="${o.val}" class="${String(o.val) === String(current) ? 'active' : ''}">${o.label}</button>`).join('');
    el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      onPick(isNaN(b.dataset.val) ? b.dataset.val : +b.dataset.val);
      el.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      this.refresh();
    }));
  },

  showScoreBreakdown() {
    const { score, breakdown } = Engine.liverScore(this.day, Storage.getProfile());
    const rows = breakdown.length ? breakdown.map(b =>
      `<div class="breakdown-item"><span>${b.label}</span><span class="${b.delta >= 0 ? 'pos' : 'neg'}">${b.delta >= 0 ? '+' : ''}${b.delta}</span></div>`).join('')
      : '<p class="empty-note">Log meals & activity to see scoring.</p>';
    this.openModal(`Liver Score · ${score}/100`,
      `<p class="hint">Starts at 100. Liver-friendly actions add points; processed/sugary/fried foods subtract.</p>${rows}`);
  },

  /* ===================================================================
     LOG / MEAL BUILDERS
     =================================================================== */
  renderLog() {
    const meals = [
      { id: 'breakfast', label: 'Breakfast' },
      { id: 'protein', label: 'Protein' },
      { id: 'lunch', label: 'Lunch' },
      { id: 'snacks', label: 'Snacks' },
      { id: 'dinner', label: 'Dinner' },
    ];
    const seg = document.getElementById('mealSeg');
    seg.innerHTML = meals.map(m =>
      `<button data-meal="${m.id}" class="${m.id === this.activeMeal ? 'active' : ''}">${m.label}</button>`).join('');
    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      this.activeMeal = b.dataset.meal; this.renderLog();
    }));
    const area = document.getElementById('builderArea');
    if (this.activeMeal === 'dinner') area.innerHTML = '', this.renderDinner(area);
    else this.renderBuilder(area, this.activeMeal);
  },

  /* Generic builder for a meal slot using option lists */
  renderBuilder(area, slot) {
    let groups = [];
    if (slot === 'breakfast') {
      groups = [{ title: 'Breakfast', ids: BREAKFAST_OPTIONS, rec: { idli: 2, dosa: 2, oats: 1 } }];
    } else if (slot === 'protein') {
      const ids = this.diet === 'veg' ? PROTEIN_VEG : PROTEIN_NONVEG;
      groups = [{ title: this.diet === 'veg' ? 'Vegetarian Protein' : 'Non-Veg Protein', ids }];
    } else if (slot === 'lunch') {
      const protIds = this.diet === 'veg' ? ['paneer'] : ['chicken_br', 'paneer'];
      groups = [
        { title: 'Protein', ids: protIds },
        { title: 'Carbs', ids: LUNCH_CARB },
        { title: 'Vegetables', ids: VEG_OPTIONS },
      ];
    } else if (slot === 'snacks') {
      const ids = SNACK_OPTIONS.filter(id => !(this.diet === 'veg' && false)); // all allowed
      groups = [{ title: 'Evening Snacks', ids }];
    }

    const day = this.day;
    const selMap = {};
    (day.meals[slot] || []).forEach(i => selMap[i.id] = i.qty);

    let html = '';
    groups.forEach(g => {
      html += `<div class="section-title">${g.title}</div><div class="food-grid">`;
      g.ids.forEach(id => {
        const f = getFood(id); if (!f) return;
        const sel = selMap[id];
        const rec = g.rec && g.rec[id];
        const isUnitCount = ['piece','egg','slice','medium','cup','glass','scoop (30g)','tbsp','tsp','can','3 pcs','20 g','30 g','50 g dry','bowl (40g)'].includes(f.unit) || true;
        html += `<div class="food-card ${sel ? 'selected' : ''}" data-id="${id}" data-slot="${slot}">
          <span class="liver-dot ${f.liver}"></span>
          <div class="fc-name">${f.name}</div>
          <div class="fc-macros">${Math.round(f.cal)} kcal · P ${f.p} · C ${f.c} · F ${f.f}<br>Fiber ${f.fiber} · per ${f.unit}</div>
          ${rec ? `<div class="fc-rec">Recommended: ${rec}</div>` : ''}
          <div class="qty-row" data-qtyrow="${id}">${this.qtyButtons(f, sel)}</div>
        </div>`;
      });
      html += `</div>`;
    });

    // summary
    const t = Engine.mealTotals(day.meals[slot]);
    html += `<div class="sel-summary">This meal: ${Math.round(t.cal)} kcal · ${Math.round(t.p)}g protein · ${Math.round(t.c)}g carbs · ${Math.round(t.fiber)}g fiber</div>`;

    area.innerHTML = html;
    area.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.closest('[data-qtyrow]').dataset.qtyrow;
        const qty = +btn.dataset.qty;
        this.setMealItem(slot, id, qty);
        this.renderBuilder(area, slot);
      });
    });
  },

  qtyButtons(f, current) {
    // quantity options scaled by step
    const opts = [];
    if (['rice','brown_rice','chicken_br','grilled_chk','paneer','jeera_rice'].includes(f.id)) {
      // gram-based: show g multiples
      const base = f.id.includes('chicken') ? [1,1.5,2,2.5] : (f.id === 'paneer' ? [0.5,1,1.5,2] : [1,1.5,2,2.5]);
      base.forEach(q => opts.push({ q, label: Math.round(q*100)+'g' }));
    } else {
      [1,2,3,4].forEach(q => opts.push({ q, label: String(q) }));
    }
    let h = `<button class="qty-btn ${!current ? '' : ''}" data-qty="0" ${!current?'style="opacity:.5"':''}>0</button>`;
    h = '';
    opts.forEach(o => {
      h += `<button class="qty-btn ${current === o.q ? 'on' : ''}" data-qty="${o.q}">${o.label}</button>`;
    });
    return h;
  },

  setMealItem(slot, id, qty) {
    const day = this.day;
    const arr = day.meals[slot];
    const idx = arr.findIndex(i => i.id === id);
    if (qty <= 0) { if (idx >= 0) arr.splice(idx, 1); }
    else if (idx >= 0) arr[idx].qty = qty;
    else arr.push({ id, qty });
    this.saveDay();
    this.toast(getFood(id).name + (qty > 0 ? ' updated' : ' removed'));
  },

  renderDinner(area) {
    const p = Storage.getProfile();
    const day = this.day;
    const { items, rationale } = Engine.generateDinner(day, p, this.diet);
    const t = Engine.mealTotals(items);
    const eaten = Engine.dayTotals(day, 'dinner');
    const logged = day.meals.dinner.length > 0;

    area.innerHTML = `
      <p class="hint">Auto-generated from your breakfast, lunch, snacks, remaining targets, and tonight's gym/football.</p>
      <div class="dinner-card">
        <div class="row-between"><strong>Suggested Dinner</strong><span class="diet-badge ${this.diet}">${this.diet === 'veg' ? 'Veg' : 'Non-Veg'}</span></div>
        <div style="margin-top:10px">
          ${items.map(i => { const f = getFood(i.id); return `<div class="dinner-item"><span>${f.name}</span><span>${this.qtyLabel(f, i.qty)}</span></div>`; }).join('')}
        </div>
        <div class="dinner-item" style="font-weight:800"><span>Dinner total</span><span>${Math.round(t.cal)} kcal · ${Math.round(t.p)}g P</span></div>
        <ul class="rationale">${rationale.map(r => `<li>${r}</li>`).join('')}</ul>
        <button class="btn" id="acceptDinner" style="margin-top:14px">${logged ? 'Replace logged dinner' : 'Accept this dinner'}</button>
        ${logged ? '<button class="btn secondary" id="clearDinner" style="margin-top:8px">Clear dinner</button>' : ''}
      </div>
      <div class="sel-summary">After accepting: total day ≈ ${Math.round(eaten.cal + t.cal)} kcal · ${Math.round(eaten.p + t.p)}g protein · ${Math.round(eaten.fiber + t.fiber)}g fiber</div>
    `;
    area.querySelector('#acceptDinner').addEventListener('click', () => {
      day.meals.dinner = items.map(i => ({ ...i }));
      this.saveDay(); this.toast('Dinner logged ✓'); this.renderDinner(area);
    });
    const clr = area.querySelector('#clearDinner');
    if (clr) clr.addEventListener('click', () => { day.meals.dinner = []; this.saveDay(); this.renderDinner(area); });
  },

  qtyLabel(f, qty) {
    if (['chicken_br','grilled_chk','paneer','rice','brown_rice'].includes(f.id)) return Math.round(qty*100)+' g';
    return qty + ' × ' + f.unit;
  },

  /* ===================================================================
     STATS / ANALYTICS
     =================================================================== */
  renderStats() {
    const seg = document.getElementById('statRange');
    seg.innerHTML = [['week','Weekly'],['month','Monthly']].map(([v,l]) =>
      `<button data-r="${v}" class="${this.statRange===v?'active':''}">${l}</button>`).join('');
    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { this.statRange = b.dataset.r; this.renderStats(); }));

    const n = this.statRange === 'week' ? 7 : 30;
    const today = new Date();
    const keys = [];
    for (let i = n - 1; i >= 0; i--) { const d = new Date(today); d.setDate(today.getDate() - i); keys.push(dateKey(d)); }
    const p = Storage.getProfile();
    const lbls = keys.map(k => { const d = new Date(k + 'T00:00'); return this.statRange === 'week' ? dayName(d).slice(0,2) : String(d.getDate()); });

    const seriesOf = fn => keys.map(k => fn(Storage.getDay(k)));
    const cal = seriesOf(d => Math.round(Engine.dayTotals(d).cal));
    const prot = seriesOf(d => Math.round(Engine.dayTotals(d).p));
    const fiber = seriesOf(d => Math.round(Engine.dayTotals(d).fiber));
    const water = seriesOf(d => d.water);
    const score = seriesOf(d => Engine.liverScore(d, p).score);
    const gymCount = keys.filter(k => Storage.getDay(k).gym.done).length;
    const fbCount = keys.filter(k => Storage.getDay(k).football.done).length;

    // averages (only days with data)
    const loggedKeys = keys.filter(k => Engine.dayTotals(Storage.getDay(k)).cal > 0);
    const avg = arrFn => { const vals = loggedKeys.map(k => arrFn(Storage.getDay(k))); return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0; };

    const area = document.getElementById('statsArea');
    area.innerHTML = `
      <div class="stat-card">
        <h3>Averages (${loggedKeys.length} logged days)</h3>
        <div class="avg-grid">
          <div class="avg-box"><div class="av">${avg(d=>Engine.dayTotals(d).cal)}</div><div class="al">kcal</div></div>
          <div class="avg-box"><div class="av">${avg(d=>Engine.dayTotals(d).p)}</div><div class="al">protein g</div></div>
          <div class="avg-box"><div class="av">${avg(d=>Engine.dayTotals(d).fiber)}</div><div class="al">fiber g</div></div>
          <div class="avg-box"><div class="av">${avg(d=>d.water)}</div><div class="al">water ml</div></div>
          <div class="avg-box"><div class="av">${avg(d=>Engine.liverScore(d,p).score)}</div><div class="al">liver score</div></div>
          <div class="avg-box"><div class="av">${gymCount}/${fbCount}</div><div class="al">gym / football</div></div>
        </div>
      </div>
      <div class="stat-card"><h3>Liver Score</h3><div class="stat-sub">Target ≥ 80</div><canvas id="cScore" height="160"></canvas></div>
      <div class="stat-card"><h3>Calories</h3><div class="stat-sub">Target ${p.targetCalories} kcal</div><canvas id="cCal" height="160"></canvas></div>
      <div class="stat-card"><h3>Protein & Fiber</h3><div class="stat-sub">Protein (green) · Fiber (orange)</div><canvas id="cPF" height="160"></canvas></div>
      <div class="stat-card"><h3>Water</h3><div class="stat-sub">Goal ${p.waterGoal} ml</div><canvas id="cWater" height="150"></canvas></div>
      ${this.weightWaistMarkup()}
    `;
    Charts.line(document.getElementById('cScore'), lbls, [{ data: score, color: '#34c759' }], { min: 0, max: 100 });
    Charts.line(document.getElementById('cCal'), lbls, [{ data: cal, color: '#0a84ff' }]);
    Charts.line(document.getElementById('cPF'), lbls, [{ data: prot, color: '#34c759' }, { data: fiber, color: '#ff9f0a' }], { min: 0 });
    Charts.bar(document.getElementById('cWater'), lbls, water, '#0a84ff', { max: p.waterGoal * 1.2 });
    this.drawWeightWaist();
  },

  weightWaistMarkup() {
    const blood = Storage.getBlood();
    if (blood.length < 1) return '';
    return `<div class="stat-card"><h3>Weight & Waist</h3><div class="stat-sub">From blood reports · Weight (blue) · Waist (purple)</div><canvas id="cWW" height="160"></canvas></div>`;
  },
  drawWeightWaist() {
    const el = document.getElementById('cWW'); if (!el) return;
    const blood = Storage.getBlood();
    const lbls = blood.map(b => { const d = new Date(b.date); return (d.getMonth()+1)+'/'+d.getDate(); });
    Charts.line(el, lbls, [
      { data: blood.map(b => b.weight != null && b.weight !== '' ? +b.weight : null), color: '#0a84ff' },
      { data: blood.map(b => b.waist != null && b.waist !== '' ? +b.waist : null), color: '#5e5ce6' },
    ]);
  },

  /* ===================================================================
     BLOOD REPORT
     =================================================================== */
  renderBlood() {
    const entries = Storage.getBlood();
    const area = document.getElementById('bloodArea');
    const latest = entries[entries.length - 1];

    let markersHtml = BLOOD_MARKERS.map(m => {
      const val = latest ? latest[m.key] : null;
      const status = BloodReport.status(m, val);
      const imp = BloodReport.improvement(entries, m);
      let impHtml = '';
      if (imp) {
        const improved = imp.pct > 0;
        impHtml = `<div class="bm-imp ${improved ? 'up' : 'down'}">${improved ? '▼ improved' : '▲ worse'} ${Math.abs(imp.pct)}%</div>`;
      }
      return `<div class="blood-marker">
        <div class="bm-left"><div class="bm-name">${m.label}</div><div class="bm-ref">Ref: ${m.ref} ${m.unit}</div></div>
        <div class="bm-right"><div class="bm-val">${val != null && val !== '' ? val : '—'} <span class="status-pill ${status}"></span></div>${impHtml}</div>
      </div>`;
    }).join('');

    area.innerHTML = `
      <button class="btn" id="addBlood">＋ Add Blood Report</button>
      <div class="hint">${entries.length ? `Latest report: ${latest.date}. Improvement is first → latest reading.` : 'No reports yet. Add your first to start tracking trends.'}</div>
      <div class="list-card">${markersHtml}</div>
      ${entries.length ? `<div class="section-title">History (${entries.length})</div>` : ''}
      <div id="bloodHistory">${entries.slice().reverse().map((e, ri) => {
        const realIdx = entries.length - 1 - ri;
        return `<div class="list-card"><div class="row-between"><div class="lc-title">${e.date}</div>
          <button class="mini-btn chip" data-del="${realIdx}">Delete</button></div>
          <div class="bm-ref" style="padding-bottom:12px">${BLOOD_MARKERS.filter(m=>e[m.key]!=null&&e[m.key]!=='').map(m=>`${m.label}: ${e[m.key]}`).join(' · ') || 'No values'}</div></div>`;
      }).join('')}</div>
    `;
    area.querySelector('#addBlood').addEventListener('click', () => this.openBloodForm());
    area.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
      Storage.deleteBlood(+b.dataset.del); this.renderBlood(); this.toast('Report deleted');
    }));
  },

  openBloodForm() {
    const fields = [{ key: 'date', label: 'Date', type: 'date' }].concat(
      BLOOD_MARKERS.map(m => ({ key: m.key, label: `${m.label} (${m.unit})`, type: 'number' })));
    const today = dateKey();
    const body = `<form id="bloodForm">
      ${fields.map(f => `<div class="field"><label>${f.label}</label>
        <input name="${f.key}" type="${f.type}" ${f.key === 'date' ? `value="${today}"` : 'inputmode="decimal" step="any"'} ${f.key==='date'?'required':''} /></div>`).join('')}
      <button class="btn" type="submit">Save Report</button>
    </form>`;
    this.openModal('New Blood Report', body);
    document.getElementById('bloodForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const entry = {};
      fields.forEach(f => { const v = fd.get(f.key); entry[f.key] = (f.type === 'number' && v !== '') ? +v : v; });
      Storage.addBlood(entry);
      this.closeModal(); this.renderBlood(); this.toast('Report saved ✓');
    });
  },

  /* ===================================================================
     MORE — profile, shopping, calendar, export
     =================================================================== */
  renderMore() {
    const area = document.getElementById('moreArea');
    area.innerHTML = `
      <div class="seg" id="moreSeg">
        <button data-m="profile" class="active">Profile</button>
        <button data-m="shop">Shopping</button>
        <button data-m="calendar">Calendar</button>
        <button data-m="data">Data</button>
      </div>
      <div id="morePane"></div>`;
    const seg = area.querySelector('#moreSeg');
    seg.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
      this.renderMorePane(b.dataset.m);
    }));
    this.renderMorePane('profile');
  },

  renderMorePane(which) {
    const pane = document.getElementById('morePane');
    if (which === 'profile') return this.renderProfile(pane);
    if (which === 'shop') return this.renderShopping(pane);
    if (which === 'calendar') return this.renderCalendar(pane);
    if (which === 'data') return this.renderData(pane);
  },

  renderProfile(pane) {
    const p = Storage.getProfile();
    const f = (k, label, type = 'number', extra = '') =>
      `<div class="field"><label>${label}</label><input name="${k}" type="${type}" value="${p[k] ?? ''}" ${extra}/></div>`;
    pane.innerHTML = `<form id="profileForm" class="list-card" style="padding:18px">
      <div class="field-row">${f('weight','Weight (kg)')}${f('height','Height (cm)')}</div>
      <div class="field-row">${f('age','Age')}
        <div class="field"><label>Gender</label><select name="gender"><option ${p.gender==='male'?'selected':''}>male</option><option ${p.gender==='female'?'selected':''}>female</option></select></div></div>
      <div class="section-title">Daily Targets</div>
      <div class="field-row">${f('targetCalories','Calories')}${f('targetProtein','Protein (g)')}</div>
      <div class="field-row">${f('targetCarbs','Carbs (g)')}${f('targetFat','Fat (g)')}</div>
      <div class="field-row">${f('targetFiber','Fiber (g)')}${f('waterGoal','Water (ml)')}</div>
      <div class="section-title">Schedule</div>
      <div class="field-row">${f('gymTiming','Gym timing','text')}${f('footballTiming','Football timing','text')}</div>
      <div class="field-row">${f('wakeTime','Wake-up','time')}${f('sleepTime','Sleep','time')}</div>
      <button class="btn" type="submit">Save Profile</button>
    </form>`;
    pane.querySelector('#profileForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const patch = {};
      ['weight','height','age','targetCalories','targetProtein','targetCarbs','targetFat','targetFiber','waterGoal']
        .forEach(k => patch[k] = +fd.get(k));
      ['gender','gymTiming','footballTiming','wakeTime','sleepTime'].forEach(k => patch[k] = fd.get(k));
      Storage.setProfile(patch);
      this.toast('Profile saved ✓');
    });
  },

  renderShopping(pane) {
    const list = Engine.shoppingList(Storage.allDays());
    pane.innerHTML = `<p class="hint">Auto-estimated weekly groceries, scaled from your last 7 logged days.</p>
      <div class="list-card">${list.length ? list.map(i =>
        `<div class="shop-item"><span>${i.name}</span><span class="amt">${i.amount} ${i.unit}</span></div>`).join('')
        : '<p class="empty-note">Log a few meals to generate your shopping list.</p>'}</div>`;
  },

  renderCalendar(pane) {
    const now = new Date(this.selectedDate + 'T00:00');
    const year = now.getFullYear(), month = now.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const p = Storage.getProfile();
    const dow = ['S','M','T','W','T','F','S'];
    let cells = dow.map(d => `<div class="cal-dow">${d}</div>`).join('');
    for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell empty"></div>`;
    const todayK = dateKey();
    for (let d = 1; d <= days; d++) {
      const dk = dateKey(new Date(year, month, d));
      const day = Storage.getDay(dk);
      const hasData = Engine.dayTotals(day).cal > 0 || day.water > 0;
      const cls = hasData ? Engine.scoreColor(Engine.liverScore(day, p).score) : '';
      cells += `<div class="cal-cell ${cls} ${dk===todayK?'today':''}" data-dk="${dk}">${d}</div>`;
    }
    const monthName = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    pane.innerHTML = `<div class="list-card" style="padding:18px">
      <div class="row-between" style="margin-bottom:14px"><button class="chip" id="calPrev">‹</button><strong>${monthName}</strong><button class="chip" id="calNext">›</button></div>
      <div class="cal-grid">${cells}</div>
      <p class="hint" style="margin-top:14px">🟢 ≥80 · 🟡 55–79 · 🔴 &lt;55 liver score. Tap a day to view it.</p></div>`;
    pane.querySelector('#calPrev').addEventListener('click', () => { this.selectedDate = dateKey(new Date(year, month - 1, 1)); this.renderCalendar(pane); });
    pane.querySelector('#calNext').addEventListener('click', () => { this.selectedDate = dateKey(new Date(year, month + 1, 1)); this.renderCalendar(pane); });
    pane.querySelectorAll('[data-dk]').forEach(c => c.addEventListener('click', () => this.showDaySummary(c.dataset.dk)));
  },

  showDaySummary(dk) {
    const day = Storage.getDay(dk);
    const p = Storage.getProfile();
    const t = Engine.dayTotals(day);
    const { score } = Engine.liverScore(day, p);
    const mealHtml = Object.entries(day.meals).map(([slot, items]) => {
      if (!items.length) return '';
      return `<div class="breakdown-item"><strong style="text-transform:capitalize">${slot}</strong><span>${items.map(i => getFood(i.id)?.name + '×' + i.qty).join(', ')}</span></div>`;
    }).join('') || '<p class="empty-note">No meals logged.</p>';
    this.openModal(new Date(dk+'T00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'}),
      `<div class="breakdown-item"><span>Liver Score</span><strong>${score}/100</strong></div>
       <div class="breakdown-item"><span>Calories</span><strong>${Math.round(t.cal)} kcal</strong></div>
       <div class="breakdown-item"><span>Protein / Fiber</span><strong>${Math.round(t.p)}g / ${Math.round(t.fiber)}g</strong></div>
       <div class="breakdown-item"><span>Water</span><strong>${day.water} ml</strong></div>
       <div class="breakdown-item"><span>Gym / Football</span><strong>${day.gym.done?'✓':'—'} / ${day.football.done?'✓':'—'}</strong></div>
       <div class="section-title">Meals</div>${mealHtml}
       <button class="btn" id="goToDay" style="margin-top:14px">Open this day</button>`);
    document.getElementById('goToDay').addEventListener('click', () => {
      this.selectedDate = dk; this.closeModal(); this.renderDayStrip(); this.switchView('today');
    });
  },

  renderData(pane) {
    pane.innerHTML = `<p class="hint">All data is stored locally on this device. Export regularly to back up.</p>
      <div class="list-card" style="padding:18px">
        <button class="btn" id="exportBtn">⬇︎ Export Backup (JSON)</button>
        <button class="btn secondary" id="importBtn" style="margin-top:10px">⬆︎ Import Backup</button>
        <input type="file" id="importFile" accept="application/json" hidden />
        <button class="btn danger" id="resetBtn" style="margin-top:10px">Reset All Data</button>
      </div>
      <div class="hint">Future features: barcode scanner, food search, voice logging, AI coach, recipe ideas, meal reminders, cloud sync, Apple Health, CSV export, multiple profiles.</div>`;
    pane.querySelector('#exportBtn').addEventListener('click', () => {
      const blob = new Blob([Storage.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `liver-tracker-backup-${dateKey()}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      this.toast('Backup exported ✓');
    });
    const fileInput = pane.querySelector('#importFile');
    pane.querySelector('#importBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try { Storage.importJSON(reader.result); this.toast('Backup restored ✓'); this.renderDayStrip(); this.refresh(); this.renderMore(); }
        catch (err) { this.toast('Invalid backup file'); }
      };
      reader.readAsText(file);
    });
    pane.querySelector('#resetBtn').addEventListener('click', () => {
      this.openModal('Reset everything?', `<p class="hint">This permanently deletes all meals, profile and blood reports on this device. This cannot be undone.</p>
        <button class="btn danger" id="confirmReset">Yes, delete everything</button>
        <button class="btn secondary" id="cancelReset" style="margin-top:8px">Cancel</button>`);
      document.getElementById('confirmReset').addEventListener('click', () => {
        Storage.resetAll(); this.closeModal(); this.selectedDate = dateKey();
        this.renderDayStrip(); this.refresh(); this.renderMore(); this.toast('All data reset');
      });
      document.getElementById('cancelReset').addEventListener('click', () => this.closeModal());
    });
  },

  /* ---------- Modal & toast ---------- */
  openModal(title, bodyHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalHost').hidden = false;
  },
  closeModal() { document.getElementById('modalHost').hidden = true; },

  _toastTimer: null,
  toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
