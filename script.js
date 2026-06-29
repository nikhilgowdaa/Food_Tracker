/* =====================================================================
   script.js — App controller / view layer
   Ties together storage, engine, charts and blood-report modules.
   ===================================================================== */

const App = {
  selectedDate: dateKey(),     // currently viewed date (YYYY-MM-DD)
  activeView: 'today',
  activeMeal: 'breakfast',
  statRange: 'week',
  searchTerm: '',

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

    // score ring (compact)
    const { score } = Engine.liverScore(d, p);
    const color = ({ green: '#34c759', yellow: '#ff9f0a', red: '#ff3b30' })[Engine.scoreColor(score)];
    Charts.ring(document.getElementById('scoreRing'), score, 100, color, String(score), null);
    document.getElementById('scoreVerdict').textContent =
      score >= 80 ? `${score}/100 · Liver-friendly day. Keep it up!` :
      score >= 55 ? `${score}/100 · Decent — a few tweaks will boost it.` :
                    `${score}/100 · Needs attention. Tap Why?`;

    // macros — use activity-adjusted (effective) targets
    const et = Engine.effectiveTargets(d, p);
    const ep = { ...p, ...et };
    const totals = Engine.dayTotals(d);
    this.renderMacros(totals, ep);

    // activity target note
    const note = document.getElementById('activityNote');
    const parts = [];
    let icon = '🛌';
    if (et.gym) { icon = '💪'; parts.push('Gym day — full target'); }
    else parts.push('No gym — target −300 kcal');
    if (et.fb) { icon = et.gym ? '🔥' : '⚽'; parts.push('Football +200 kcal'); }
    note.hidden = false;
    note.innerHTML = `<span class="an-ic">${icon}</span><span>${parts.join(' · ')}. Targets: <strong>${et.targetCalories} kcal</strong> · <strong>${et.targetProtein}g protein</strong>.</span>`;

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
      { name: 'Calories', k: 'cal',   cur: t.cal,   tgt: p.targetCalories, u: 'kcal', c: '#0a84ff' },
      { name: 'Protein',  k: 'p',     cur: t.p,     tgt: p.targetProtein,  u: 'g',    c: '#34c759' },
      { name: 'Carbs',    k: 'c',     cur: t.c,     tgt: p.targetCarbs,    u: 'g',    c: '#ff9f0a' },
      { name: 'Fat',      k: 'f',     cur: t.f,     tgt: p.targetFat,      u: 'g',    c: '#ff375f' },
      { name: 'Fiber',    k: 'fiber', cur: t.fiber, tgt: p.targetFiber,    u: 'g',    c: '#30d158' },
    ];
    grid.innerHTML = items.map(m => {
      const pct = Math.min(100, m.cur / m.tgt * 100);
      const cls = m.cur > m.tgt * 1.05 ? 'over' : (m.cur >= m.tgt ? 'met' : '');
      return `<div class="macro glass" data-macro="${m.k}">
        <div class="m-top"><span class="m-name">${m.name}</span><span class="m-chev">›</span></div>
        <div class="m-val">${Math.round(m.cur)} <small>/ ${m.tgt} ${m.u}</small></div>
        <div class="progress"><div class="progress-fill ${cls}" style="width:${pct}%;${cls ? '' : 'background:' + m.c}"></div></div>
      </div>`;
    }).join('');
    grid.querySelectorAll('.macro').forEach(el =>
      el.addEventListener('click', () => this.showMacroBreakdown(el.dataset.macro)));
  },

  /* Drill-down breakdown for a macro card.
     Calories → grouped by meal; other macros → per-food contribution, sorted. */
  showMacroBreakdown(key) {
    const labels = { cal: 'Calories', p: 'Protein', c: 'Carbs', f: 'Fat', fiber: 'Fiber' };
    const unit = key === 'cal' ? 'kcal' : 'g';
    const day = this.day;
    const p = Storage.getProfile();
    const et = Engine.effectiveTargets(day, p);
    const tgt = { cal: et.targetCalories, p: et.targetProtein, c: et.targetCarbs, f: et.targetFat, fiber: et.targetFiber }[key];
    const slots = [['breakfast', 'Breakfast'], ['protein', 'Protein'], ['lunch', 'Lunch'], ['snacks', 'Snacks'], ['dinner', 'Dinner']];
    let total = 0;
    let body = '';

    if (key === 'cal') {
      slots.forEach(([slot, name]) => {
        const items = day.meals[slot] || [];
        if (!items.length) return;
        let sub = 0;
        const rows = items.map(i => {
          const f = getFood(i.id); const v = f.cal * i.qty; sub += v;
          return `<div class="breakdown-item"><span>${f.name} <small class="bd-q">${this.qtyLabel(f, i.qty)}</small></span><span>${Math.round(v)} ${unit}</span></div>`;
        }).join('');
        total += sub;
        body += `<div class="bd-group"><div class="bd-head"><span>${name}</span><span>${Math.round(sub)} ${unit}</span></div>${rows}</div>`;
      });
    } else {
      const contribs = [];
      slots.forEach(([slot, name]) => (day.meals[slot] || []).forEach(i => {
        const f = getFood(i.id); const v = f[key] * i.qty;
        if (v > 0) { contribs.push({ f, qty: i.qty, v, meal: name }); total += v; }
      }));
      contribs.sort((a, b) => b.v - a.v);
      body = contribs.map(ct => {
        const pct = total > 0 ? Math.round(ct.v / total * 100) : 0;
        return `<div class="breakdown-item">
          <span>${ct.f.name} <small class="bd-q">${this.qtyLabel(ct.f, ct.qty)} · ${ct.meal}</small></span>
          <span>${Math.round(ct.v * 10) / 10} ${unit} <small class="bd-q">${pct}%</small></span>
        </div>`;
      }).join('');
    }

    if (!total) body = '<p class="empty-note">No foods logged yet for this day.</p>';
    const header = `<div class="breakdown-item bd-total"><span>Total</span><span>${Math.round(total)} / ${tgt} ${unit}</span></div>`;
    this.openModal(labels[key] + ' breakdown', header + body);
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
      this.activeMeal = b.dataset.meal; this.searchTerm = ''; this.renderLog();
    }));
    const area = document.getElementById('builderArea');
    if (this.activeMeal === 'dinner') area.innerHTML = '', this.renderDinner(area);
    else this.renderBuilder(area, this.activeMeal);
  },

  /* Default option groups per meal slot */
  builderGroups(slot) {
    if (slot === 'breakfast') return [{ title: 'Breakfast', ids: BREAKFAST_OPTIONS }];
    if (slot === 'protein') {
      const ids = this.diet === 'veg' ? PROTEIN_VEG : PROTEIN_NONVEG;
      return [{ title: this.diet === 'veg' ? 'Vegetarian Protein' : 'Non-Veg Protein', ids }];
    }
    if (slot === 'lunch' || slot === 'dinner') {
      const protIds = this.diet === 'veg'
        ? ['paneer', 'tofu']
        : ['chicken_br', 'grilled_chk', 'chicken_kebab', 'paneer', 'boiled_egg', 'egg_bhurji', 'fish', 'fish_fry'];
      const curryIds = this.diet === 'veg' ? CURRY_VEG : CURRY_VEG.concat(CURRY_NONVEG);
      const riceIds = this.diet === 'veg' ? RICE_OPTIONS.filter(id => !(getFood(id).tags || []).includes('nonveg')) : RICE_OPTIONS;
      return [
        { title: 'Protein', ids: protIds },
        { title: 'Curries', ids: curryIds },
        { title: 'Rice & One-pot', ids: riceIds },
        { title: 'Carbs & Rottis', ids: LUNCH_CARB },
        { title: 'Vegetables', ids: VEG_OPTIONS },
      ];
    }
    if (slot === 'snacks') {
      return [
        { title: 'Fruits', ids: SNACK_FRUITS },
        { title: 'Nuts & Dry Fruits', ids: SNACK_NUTS },
        { title: 'Drinks', ids: SNACK_DRINKS },
        { title: 'Other', ids: SNACK_OTHER },
      ];
    }
    return [];
  },

  /* Recommended starting quantity for a food */
  recQty(f) {
    const map = {
      idli: 3, mini_idli: 6, dosa: 2, masala_dosa: 1, set_dosa: 3, rava_dosa: 2, neer_dosa: 4,
      poha: 1, upma: 1, pongal: 1, chapati_bf: 2, brown_bread: 2, white_bread: 2, oats: 1,
      idiyappam: 3, appam: 2, uttapam: 2, paratha: 2, methi_thepla: 2, ragi_dosa: 2, moong_chilla: 2,
      chapati: 2, phulka: 2, rice: 1.5, brown_rice: 1.5, jeera_rice: 1.5, quinoa: 1.5, millet: 1.5,
      chicken_br: 1.5, grilled_chk: 1.5, chicken_kebab: 1.5, paneer: 1, tofu: 1, milk: 1, whey: 1,
      boiled_egg: 2, egg: 2, egg_white: 3, dal: 1, fish: 1, salmon: 1,
      // kannada / south indian
      rava_idli: 3, thatte_idli: 2, benne_dosa: 2, mysore_dosa: 1, medu_vada: 2, maddur_vada: 2,
      goli_baje: 3, ragi_rotti: 2, akki_rotti: 2, jolada_rotti: 2, ragi_mudde: 1, bajra_roti: 2,
      fish_fry: 1, egg_bhurji: 1, chiroti: 1, mysore_pak: 1, holige: 1, chakli: 2, kodubale: 2, nippattu: 2,
    };
    if (map[f.id] != null) return map[f.id];
    if (f.cat === 'fat') return 2;
    return 1;
  },

  /* foods measured per 100 g use gram-multiple buttons */
  isGram100(f) { return f.unit.indexOf('100 g') === 0; },

  foodCardHTML(f, slot, selMap) {
    const sel = selMap[f.id];
    const rec = this.recQty(f);
    const showG = !/\d/.test(f.unit) && SERVING_GRAMS[f.id];
    const perUnit = showG ? `1 ${f.unit} ≈ ${SERVING_GRAMS[f.id]} ${unitIsLiquid(f) ? 'ml' : 'g'}` : `per ${f.unit}`;
    return `<div class="food-card ${sel ? 'selected' : ''}" data-card="${f.id}" data-slot="${slot}">
      <span class="liver-dot ${f.liver}"></span>
      <div class="fc-name">${f.name}</div>
      <div class="fc-macros">${Math.round(f.cal)} kcal · P ${f.p} · C ${f.c} · F ${f.f}<br>Fiber ${f.fiber} · ${perUnit}</div>
      <div class="fc-rec">${sel ? '✓ Eaten: ' + this.qtyLabel(f, sel) : 'Tap to add · rec ' + this.qtyLabel(f, rec)}</div>
      <div class="qty-row" data-qtyrow="${f.id}">${this.qtyButtons(f, sel)}</div>
    </div>`;
  },

  qtyButtons(f, current) {
    const rec = this.recQty(f);
    let opts;
    if (this.isGram100(f)) {
      const base = f.id === 'paneer' ? [0.5, 1, 1.5, 2] : [1, 1.5, 2, 2.5];
      opts = base.map(q => ({ q, label: Math.round(q * 100) + 'g' }));
    } else {
      opts = [1, 2, 3, 4].map(q => ({ q, label: String(q) }));
    }
    if (!opts.some(o => o.q === rec)) {
      opts.unshift({ q: rec, label: this.isGram100(f) ? Math.round(rec * 100) + 'g' : String(rec) });
    }
    let h = current ? `<button class="qty-btn clear" data-qty="0" aria-label="Remove">✕</button>` : '';
    h += opts.map(o => {
      const isOn = current === o.q;
      const isRec = !current && o.q === rec;
      return `<button class="qty-btn ${isOn ? 'on' : ''} ${isRec ? 'rec' : ''}" data-qty="${o.q}">${o.label}</button>`;
    }).join('');
    return h;
  },

  renderBuilder(area, slot) {
    const day = this.day;
    const selMap = {};
    (day.meals[slot] || []).forEach(i => selMap[i.id] = i.qty);

    const raw = this.searchTerm || '';
    const term = raw.trim();
    const termLower = term.toLowerCase();

    let html = `<div class="search-wrap">
      <span class="search-ic">🔍</span>
      <input id="foodSearch" class="food-search" type="search" inputmode="search" placeholder="Search any food…" value="${this.escapeAttr(raw)}" autocomplete="off" autocapitalize="none" />
      ${term ? '<button id="searchClear" class="search-clear" aria-label="Clear">✕</button>' : ''}
    </div>`;

    if (term) {
      let results = FOOD_DB.filter(f => f.name.toLowerCase().includes(termLower));
      if (this.diet === 'veg') results = results.filter(f => !(f.tags || []).includes('nonveg'));
      html += `<div class="section-title">Results (${results.length})</div>`;
      html += results.length
        ? `<div class="food-grid">${results.slice(0, 60).map(f => this.foodCardHTML(f, slot, selMap)).join('')}</div>`
        : `<p class="empty-note">No food matches “${this.escapeHtml(term)}”.</p>`;
    } else {
      this.builderGroups(slot).forEach(g => {
        html += `<div class="section-title">${g.title}</div><div class="food-grid">`;
        g.ids.forEach(id => { const f = getFood(id); if (f) html += this.foodCardHTML(f, slot, selMap); });
        html += `</div>`;
      });
    }

    const t = Engine.mealTotals(day.meals[slot]);
    const n = (day.meals[slot] || []).length;
    html += `<div class="sel-summary">This meal: ${Math.round(t.cal)} kcal · ${Math.round(t.p)}g protein · ${Math.round(t.c)}g carbs · ${Math.round(t.fiber)}g fiber${n ? ' · ' + n + ' item' + (n > 1 ? 's' : '') : ''}</div>`;

    area.innerHTML = html;

    // search field
    const search = area.querySelector('#foodSearch');
    if (search) {
      search.addEventListener('input', e => {
        this.searchTerm = e.target.value;
        const pos = e.target.selectionStart;
        this.renderBuilder(area, slot);
        const again = area.querySelector('#foodSearch');
        if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) {} }
      });
    }
    const clr = area.querySelector('#searchClear');
    if (clr) clr.addEventListener('click', () => { this.searchTerm = ''; this.renderBuilder(area, slot); });

    // tap card body → add at recommended quantity
    area.querySelectorAll('.food-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.card;
        if (selMap[id]) return;                 // already added: adjust via qty buttons
        this.setMealItem(slot, id, this.recQty(getFood(id)));
        this.renderBuilder(area, slot);
      });
    });

    // qty buttons → set actual consumed quantity
    area.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.closest('[data-qtyrow]').dataset.qtyrow;
        this.setMealItem(slot, id, +btn.dataset.qty);
        this.renderBuilder(area, slot);
      });
    });
  },

  escapeAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); },
  escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

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
    const logged = day.meals.dinner.length > 0;

    area.innerHTML = `
      <div class="dinner-card">
        <div class="row-between"><strong>💡 Suggested Dinner</strong><span class="diet-badge ${this.diet}">${this.diet === 'veg' ? 'Veg' : 'Non-Veg'}</span></div>
        <p class="hint" style="margin:6px 0 4px">Auto-balanced from your breakfast, lunch, snacks, remaining targets and tonight's activity. Use it as-is, or log what you actually ate below.</p>
        <div style="margin-top:8px">
          ${items.map(i => { const f = getFood(i.id); return `<div class="dinner-item"><span>${f.name}</span><span>${this.qtyLabel(f, i.qty)}</span></div>`; }).join('')}
        </div>
        <div class="dinner-item" style="font-weight:800"><span>Dinner total</span><span>${Math.round(t.cal)} kcal · ${Math.round(t.p)}g P</span></div>
        <ul class="rationale">${rationale.map(r => `<li>${r}</li>`).join('')}</ul>
        <button class="btn" id="useDinner" style="margin-top:14px">${logged ? '↺ Replace my dinner with this suggestion' : '✓ Use this suggested dinner'}</button>
      </div>

      <div class="section-title">${logged ? 'Your logged dinner — search & adjust' : 'Or search & log what you actually ate'}</div>
      <div id="dinnerBuilder"></div>
    `;
    area.querySelector('#useDinner').addEventListener('click', () => {
      day.meals.dinner = items.map(i => ({ ...i }));
      this.saveDay(); this.toast('Dinner set to suggestion ✓');
      this.searchTerm = ''; this.renderDinner(area);
    });
    // full search + recommend-then-adjust builder, writing to the dinner slot
    this.renderBuilder(area.querySelector('#dinnerBuilder'), 'dinner');
  },

  qtyLabel(f, qty) {
    if (f.unit.indexOf('100 g') === 0) return Math.round(qty * 100) + ' g';
    let s = qty + ' × ' + f.unit;
    if (!/\d/.test(f.unit) && SERVING_GRAMS[f.id]) {
      s += ` (${Math.round(SERVING_GRAMS[f.id] * qty)} ${unitIsLiquid(f) ? 'ml' : 'g'})`;
    }
    return s;
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
          <div class="avg-box"><div class="av">${avg(d=>Engine.dayTotals(d).c)}</div><div class="al">carbs g</div></div>
          <div class="avg-box"><div class="av">${avg(d=>Engine.liverScore(d,p).score)}</div><div class="al">liver score</div></div>
          <div class="avg-box"><div class="av">${gymCount}/${fbCount}</div><div class="al">gym / football</div></div>
        </div>
      </div>
      <div class="stat-card"><h3>Liver Score</h3><div class="stat-sub">Target ≥ 80</div><canvas id="cScore" height="160"></canvas></div>
      <div class="stat-card"><h3>Calories</h3><div class="stat-sub">Target ${p.targetCalories} kcal</div><canvas id="cCal" height="160"></canvas></div>
      <div class="stat-card"><h3>Protein & Fiber</h3><div class="stat-sub">Protein (green) · Fiber (orange)</div><canvas id="cPF" height="160"></canvas></div>
      ${this.weightWaistMarkup()}
    `;
    Charts.line(document.getElementById('cScore'), lbls, [{ data: score, color: '#34c759' }], { min: 0, max: 100 });
    Charts.line(document.getElementById('cCal'), lbls, [{ data: cal, color: '#0a84ff' }]);
    Charts.line(document.getElementById('cPF'), lbls, [{ data: prot, color: '#34c759' }, { data: fiber, color: '#ff9f0a' }], { min: 0 });
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
      ${f('targetFiber','Fiber (g)')}
      <div class="section-title">Schedule</div>
      <div class="field-row">${f('gymTiming','Gym timing','text')}${f('footballTiming','Football timing','text')}</div>
      <div class="field-row">${f('wakeTime','Wake-up','time')}${f('sleepTime','Sleep','time')}</div>
      <button class="btn" type="submit">Save Profile</button>
    </form>`;
    pane.querySelector('#profileForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const patch = {};
      ['weight','height','age','targetCalories','targetProtein','targetCarbs','targetFat','targetFiber']
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
      <div class="hint">Future features: barcode scanner, voice logging, AI coach, recipe ideas, meal reminders, cloud sync, Apple Health, CSV export, multiple profiles.</div>`;
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
