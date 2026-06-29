/* =====================================================================
   meal-engine.js
   The intelligent core: totals, liver score, smart dinner generation,
   live re-balancing, and coaching notifications.
   ===================================================================== */

const Engine = {

  /* Sum macros for one meal array [{id, qty}] */
  mealTotals(items) {
    const t = { cal: 0, p: 0, c: 0, f: 0, fiber: 0 };
    (items || []).forEach(({ id, qty }) => {
      const food = getFood(id);
      if (!food) return;
      t.cal   += food.cal   * qty;
      t.p     += food.p     * qty;
      t.c     += food.c     * qty;
      t.f     += food.f     * qty;
      t.fiber += food.fiber * qty;
    });
    return t;
  },

  /* Sum all meals in a day (optionally excluding a meal slot) */
  dayTotals(day, exclude) {
    const total = { cal: 0, p: 0, c: 0, f: 0, fiber: 0 };
    Object.keys(day.meals).forEach(slot => {
      if (slot === exclude) return;
      const t = this.mealTotals(day.meals[slot]);
      total.cal += t.cal; total.p += t.p; total.c += t.c; total.f += t.f; total.fiber += t.fiber;
    });
    return total;
  },

  round(n) { return Math.round(n); },

  /* ---------------------------------------------------------------
     SMART DINNER GENERATION
     Looks at what's already eaten + remaining targets and proposes
     a dinner that fills the gap while honouring liver-friendly rules.
     Returns { items:[{id,qty}], rationale:[strings] }
  --------------------------------------------------------------- */
  generateDinner(day, profile, diet) {
    const eaten = this.dayTotals(day, 'dinner');
    const remCal   = profile.targetCalories - eaten.cal;
    const remP     = profile.targetProtein  - eaten.p;
    const remC     = profile.targetCarbs    - eaten.c;
    const remFiber = profile.targetFiber    - eaten.fiber;

    const items = [];
    const rationale = [];

    // 1) Protein anchor
    if (diet === 'nonveg') {
      const grams = Math.max(100, Math.min(250, Math.round(((remP) / 31) * 100 / 25) * 25));
      if (remP > 15) {
        const qty = Math.max(1, Math.min(2.5, +(grams / 100).toFixed(1)));
        items.push({ id: 'grilled_chk', qty });
        rationale.push(`Grilled chicken ${Math.round(qty*100)} g to cover ~${Math.round(remP)} g protein gap.`);
      } else {
        items.push({ id: 'boiled_egg', qty: 2 });
        rationale.push('Protein target nearly met — light option: 2 boiled eggs.');
      }
    } else {
      if (remP > 25) {
        items.push({ id: 'paneer', qty: 1 });
        rationale.push('Vegetarian day: 100 g paneer for protein.');
      } else if (remP > 12) {
        items.push({ id: 'whey', qty: 1 });
        rationale.push('Whey scoop to top up protein without heavy calories.');
      } else {
        items.push({ id: 'dal', qty: 1 });
        rationale.push('Protein near target — a cup of dal keeps it gentle.');
      }
    }

    // 2) Liver-friendly vegetables (always)
    items.push({ id: 'broccoli', qty: 1 });
    rationale.push('Broccoli — a liver superfood, adds fiber & antioxidants.');
    if (remFiber > 12) {
      items.push({ id: 'mixed_veg', qty: 1 });
      rationale.push('Fiber is still short — adding mixed vegetables.');
    }

    // 3) Carb amount scaled to remaining calories (prefer whole grain)
    const afterProteinVeg = this.mealTotals(items);
    const carbCalLeft = remCal - afterProteinVeg.cal;
    if (carbCalLeft > 250) {
      const chapatis = Math.max(1, Math.min(3, Math.round(carbCalLeft / 110)));
      items.push({ id: 'chapati', qty: chapatis });
      rationale.push(`${chapatis} chapati to use remaining ~${Math.round(carbCalLeft)} kcal (whole-grain, fiber-rich).`);
    } else if (carbCalLeft > 90) {
      items.push({ id: 'phulka', qty: 1 });
      rationale.push('Low remaining calories — just 1 phulka to keep dinner light.');
    } else {
      rationale.push('Calorie budget tight — keeping dinner protein + veg only (no extra carbs).');
    }

    // 4) Football / Gym adjustments
    if (day.football && day.football.done) {
      items.push({ id: 'banana', qty: 1 });
      rationale.push('Football tonight ⚽ — added a banana for recovery carbs/potassium.');
    }
    if (day.gym && day.gym.done && diet === 'nonveg') {
      rationale.push('Gym done today 💪 — protein portion kept on the higher side for recovery.');
    }

    return { items, rationale };
  },

  /* ---------------------------------------------------------------
     LIVER HEALTH SCORE
     Starts at 100, applies positive & negative modifiers, clamps 0-100.
     Returns { score, breakdown:[{label, delta}] }
  --------------------------------------------------------------- */
  liverScore(day, profile) {
    let score = 100;
    const breakdown = [];
    const add = (label, delta) => { score += delta; breakdown.push({ label, delta }); };

    const totals = this.dayTotals(day);

    // Positive
    if (day.gym && day.gym.done) add('Gym workout', +10);
    if (day.football && day.football.done) add('Football session', +10);
    if (day.water >= profile.waterGoal) add('Water goal reached', +10);
    else if (day.water >= profile.waterGoal * 0.7) add('Good hydration', +5);

    // broccoli / vegetables eaten?
    const allItems = Object.values(day.meals).flat();
    const hasBroccoli = allItems.some(i => i.id === 'broccoli');
    const vegCount = allItems.filter(i => { const f = getFood(i.id); return f && f.cat === 'veg'; }).length;
    if (hasBroccoli) add('Broccoli eaten', +5);
    if (vegCount >= 2) add('Plenty of vegetables', +5);

    if (totals.fiber >= profile.targetFiber) add('Fiber target met', +10);
    if (totals.p >= profile.targetProtein) add('Protein target met', +10);
    if (day.walkAfterMeals) add('Walked after meals', +5);

    // Negative — scan tags
    const tagCounts = {};
    allItems.forEach(i => {
      const f = getFood(i.id);
      if (!f) return;
      (f.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + i.qty; });
    });
    if (allItems.some(i => i.id === 'ice_cream')) add('Ice cream', -15);
    if (allItems.some(i => i.id === 'soft_drink')) add('Soft drink', -20);
    if (tagCounts.bakery) add('Bakery item', -15);
    if (tagCounts.sugary) add('Sugary food', -15);
    const gheeQty = allItems.filter(i => i.id === 'ghee').reduce((s, i) => s + i.qty, 0);
    if (gheeQty > 2) add('Too much ghee', -10);
    if (totals.fiber < profile.targetFiber * 0.4 && totals.cal > 800) add('Very low fiber', -10);

    // Late heavy dinner
    const dinner = this.mealTotals(day.meals.dinner);
    if (dinner.cal > 800) add('Heavy dinner', -5);

    score = Math.max(0, Math.min(100, score));
    return { score: Math.round(score), breakdown };
  },

  scoreColor(score) {
    if (score >= 80) return 'green';
    if (score >= 55) return 'yellow';
    return 'red';
  },

  /* ---------------------------------------------------------------
     COACHING NOTIFICATIONS — context-aware suggestions
  --------------------------------------------------------------- */
  suggestions(day, profile) {
    const out = [];
    const totals = this.dayTotals(day);
    const bf = this.mealTotals(day.meals.breakfast);
    const lunch = this.mealTotals(day.meals.lunch);

    // Breakfast carb-heavy
    if (bf.cal > 0 && bf.c > 45 && bf.p < 12) {
      const reduce = Math.round((bf.c - 45) / 28 * 50);
      out.push({ type: 'warn', text: `Breakfast is high in carbs. Reduce lunch rice by ~${Math.max(50, reduce)} g to balance.` });
    }
    // Protein status
    if (totals.p >= profile.targetProtein) {
      out.push({ type: 'good', text: 'Excellent — protein target already achieved today! 💪' });
    } else if (totals.p >= profile.targetProtein * 0.7) {
      out.push({ type: 'info', text: `Protein on track: ${Math.round(totals.p)}/${profile.targetProtein} g. A whey scoop closes the gap.` });
    } else if (totals.cal > profile.targetCalories * 0.6) {
      out.push({ type: 'warn', text: `Protein is lagging (${Math.round(totals.p)} g). Prioritise protein at dinner.` });
    }
    // Calories nearly used
    if (totals.cal >= profile.targetCalories * 0.85 && totals.cal < profile.targetCalories) {
      out.push({ type: 'info', text: 'Calorie budget almost used — dinner can be lighter.' });
    } else if (totals.cal > profile.targetCalories) {
      out.push({ type: 'warn', text: `Over calorie budget by ${Math.round(totals.cal - profile.targetCalories)} kcal. Keep dinner protein + veg only.` });
    }
    // Fiber
    if (totals.fiber < profile.targetFiber * 0.6) {
      out.push({ type: 'warn', text: 'Fiber is low. Add broccoli or green peas for liver health.' });
    } else if (totals.fiber >= profile.targetFiber) {
      out.push({ type: 'good', text: 'Great fiber intake — your liver thanks you. 🥦' });
    }
    // Water
    if (day.water < profile.waterGoal) {
      const left = profile.waterGoal - day.water;
      out.push({ type: 'info', text: `Drink another ${left >= 500 ? '500 ml' : left + ' ml'} of water (${day.water}/${profile.waterGoal} ml).` });
    }
    // Liver negatives
    const allItems = Object.values(day.meals).flat();
    if (allItems.some(i => { const f = getFood(i.id); return f && f.liver === 'bad'; })) {
      out.push({ type: 'warn', text: 'A liver-unfriendly item was logged. Add a 15-min walk and green tea to offset.' });
    }
    return out;
  },

  /* ---------------------------------------------------------------
     SHOPPING LIST — aggregate ~last 7 logged days, scale to a week
     Returns array of { name, amount, unit }
  --------------------------------------------------------------- */
  shoppingList(allDays) {
    const keys = Object.keys(allDays).sort().slice(-7);
    const agg = {}; // foodId -> total qty
    keys.forEach(k => {
      const day = allDays[k];
      Object.values(day.meals).flat().forEach(({ id, qty }) => {
        agg[id] = (agg[id] || 0) + qty;
      });
    });
    const daysLogged = Math.max(1, keys.length);
    const weekFactor = 7 / daysLogged;

    // map foods to purchasable groceries
    const grocery = {}; // label -> {grams or count}
    const addG = (label, grams) => { grocery[label] = grocery[label] || { grams: 0 }; grocery[label].grams += grams; };
    const addC = (label, count) => { grocery[label] = grocery[label] || { count: 0 }; grocery[label].count += count; };

    Object.entries(agg).forEach(([id, qty]) => {
      const wq = qty * weekFactor;
      const f = getFood(id);
      if (!f) return;
      switch (id) {
        case 'chicken_br': case 'grilled_chk': case 'chicken_curry': addG('Chicken', wq * 100); break;
        case 'paneer': addG('Paneer', wq * 100); break;
        case 'rice': case 'jeera_rice': addG('Rice', wq * 100); break;
        case 'brown_rice': addG('Brown Rice', wq * 100); break;
        case 'milk': addG('Milk (ml)', wq * 250); break;
        case 'broccoli': addG('Broccoli', wq * 150); break;
        case 'green_peas': addG('Green Peas', wq * 150); break;
        case 'spinach': case 'beans': case 'carrot': case 'capsicum': case 'mixed_veg': case 'mushroom':
          addG('Mixed Vegetables', wq * 150); break;
        case 'banana': addC('Bananas', wq); break;
        case 'apple': addC('Apples', wq); break;
        case 'boiled_egg': case 'egg': case 'egg_white': addC('Eggs', wq); break;
        case 'whey': addC('Whey scoops', wq); break;
        case 'oats': addG('Oats', wq * 40); break;
        case 'walnuts': addG('Walnuts', wq * 30); break;
        case 'almonds': addG('Almonds', wq * 30); break;
        case 'flaxseed': addG('Flaxseed', wq * 15); break;
        case 'chapati': case 'chapati_bf': case 'phulka': addG('Atta (flour)', wq * 30); break;
        case 'brown_bread': addC('Brown Bread (slices)', wq); break;
        default: break;
      }
    });

    const list = [];
    Object.entries(grocery).forEach(([label, v]) => {
      if (v.grams != null) {
        if (label.includes('(ml)')) {
          list.push({ name: label.replace(' (ml)', ''), amount: (v.grams / 1000).toFixed(1), unit: 'litres' });
        } else if (v.grams >= 1000) {
          list.push({ name: label, amount: (v.grams / 1000).toFixed(1), unit: 'kg' });
        } else {
          list.push({ name: label, amount: Math.round(v.grams), unit: 'g' });
        }
      } else {
        list.push({ name: label, amount: Math.ceil(v.count), unit: 'pcs' });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },
};

if (typeof window !== 'undefined') window.Engine = Engine;
