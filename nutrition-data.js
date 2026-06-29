/* =====================================================================
   nutrition-data.js
   Indian food database (~150 items) for Fatty Liver Nutrition Tracker Pro
   ---------------------------------------------------------------------
   Each food entry stores nutrition PER "unit". The `unit` describes what
   one unit is (e.g. "1 idli", "100 g", "1 cup"). The meal engine multiplies
   these values by the chosen quantity.

   Fields:
     id        unique key
     name      display name
     cat       category: breakfast | protein | carb | veg | snack | fruit | drink | treat
     unit      label for one serving unit
     step      typical quantity step shown in UI
     cal,p,c,f,fiber   macros per unit (kcal, g)
     liver     liver-health tag: 'good' | 'neutral' | 'bad'
     tags      array of flags used by engine (e.g. 'fried','sugary','highfiber')
   ===================================================================== */

const FOOD_DB = [
  /* ---------------- BREAKFAST ---------------- */
  { id: 'idli',        name: 'Idli',            cat: 'breakfast', unit: 'piece', step: 1, cal: 58,  p: 2.0, c: 12,  f: 0.4, fiber: 0.9, liver: 'good',    tags: ['steamed'] },
  { id: 'mini_idli',   name: 'Mini Idli',       cat: 'breakfast', unit: 'piece', step: 2, cal: 28,  p: 1.0, c: 6,   f: 0.2, fiber: 0.4, liver: 'good',    tags: ['steamed'] },
  { id: 'dosa',        name: 'Dosa',            cat: 'breakfast', unit: 'piece', step: 1, cal: 133, p: 2.7, c: 24,  f: 3.0, fiber: 1.2, liver: 'neutral', tags: [] },
  { id: 'masala_dosa', name: 'Masala Dosa',     cat: 'breakfast', unit: 'piece', step: 1, cal: 250, p: 4.5, c: 38,  f: 8.0, fiber: 2.5, liver: 'neutral', tags: ['oil'] },
  { id: 'set_dosa',    name: 'Set Dosa',        cat: 'breakfast', unit: 'piece', step: 1, cal: 95,  p: 2.2, c: 17,  f: 2.0, fiber: 0.8, liver: 'neutral', tags: [] },
  { id: 'rava_dosa',   name: 'Rava Dosa',       cat: 'breakfast', unit: 'piece', step: 1, cal: 150, p: 2.5, c: 22,  f: 5.5, fiber: 0.7, liver: 'neutral', tags: ['oil'] },
  { id: 'neer_dosa',   name: 'Neer Dosa',       cat: 'breakfast', unit: 'piece', step: 2, cal: 70,  p: 1.5, c: 14,  f: 0.8, fiber: 0.5, liver: 'good',    tags: [] },
  { id: 'poha',        name: 'Poha',            cat: 'breakfast', unit: 'cup',   step: 1, cal: 180, p: 3.5, c: 33,  f: 4.0, fiber: 1.5, liver: 'neutral', tags: [] },
  { id: 'upma',        name: 'Upma',            cat: 'breakfast', unit: 'cup',   step: 1, cal: 192, p: 4.0, c: 30,  f: 6.0, fiber: 2.0, liver: 'neutral', tags: ['oil'] },
  { id: 'pongal',      name: 'Pongal',          cat: 'breakfast', unit: 'cup',   step: 1, cal: 220, p: 6.0, c: 34,  f: 7.0, fiber: 2.2, liver: 'neutral', tags: ['ghee'] },
  { id: 'chapati_bf',  name: 'Chapati',         cat: 'breakfast', unit: 'piece', step: 1, cal: 104, p: 3.1, c: 18,  f: 2.5, fiber: 2.7, liver: 'good',    tags: ['wholegrain','highfiber'] },
  { id: 'brown_bread', name: 'Brown Bread',     cat: 'breakfast', unit: 'slice', step: 1, cal: 75,  p: 3.0, c: 13,  f: 1.0, fiber: 2.0, liver: 'good',    tags: ['wholegrain'] },
  { id: 'oats',        name: 'Oats',            cat: 'breakfast', unit: 'bowl (40g)', step: 1, cal: 150, p: 5.0, c: 27, f: 3.0, fiber: 4.0, liver: 'good', tags: ['wholegrain','highfiber'] },
  { id: 'idiyappam',   name: 'Idiyappam',       cat: 'breakfast', unit: 'piece', step: 1, cal: 90,  p: 1.8, c: 19,  f: 0.5, fiber: 0.8, liver: 'good',    tags: [] },
  { id: 'appam',       name: 'Appam',           cat: 'breakfast', unit: 'piece', step: 1, cal: 120, p: 2.0, c: 24,  f: 1.8, fiber: 0.6, liver: 'neutral', tags: [] },
  { id: 'uttapam',     name: 'Uttapam',         cat: 'breakfast', unit: 'piece', step: 1, cal: 180, p: 4.0, c: 30,  f: 4.5, fiber: 1.8, liver: 'neutral', tags: [] },
  { id: 'paratha',     name: 'Plain Paratha',   cat: 'breakfast', unit: 'piece', step: 1, cal: 210, p: 4.5, c: 30,  f: 8.0, fiber: 2.5, liver: 'neutral', tags: ['oil','ghee'] },
  { id: 'methi_thepla',name: 'Methi Thepla',    cat: 'breakfast', unit: 'piece', step: 1, cal: 130, p: 3.5, c: 18,  f: 4.5, fiber: 2.6, liver: 'good',    tags: ['highfiber'] },
  { id: 'ragi_dosa',   name: 'Ragi Dosa',       cat: 'breakfast', unit: 'piece', step: 1, cal: 110, p: 3.0, c: 20,  f: 2.0, fiber: 3.0, liver: 'good',    tags: ['highfiber'] },
  { id: 'moong_chilla',name: 'Moong Dal Chilla',cat:'breakfast', unit: 'piece', step: 1, cal: 120, p: 7.0, c: 14,  f: 3.5, fiber: 3.0, liver: 'good',    tags: ['highprotein','highfiber'] },
  { id: 'sambar',      name: 'Sambar',          cat: 'breakfast', unit: 'cup',   step: 1, cal: 90,  p: 4.0, c: 13,  f: 2.5, fiber: 3.5, liver: 'good',    tags: ['highfiber'] },
  { id: 'coconut_chut',name: 'Coconut Chutney', cat: 'breakfast', unit: 'tbsp',  step: 1, cal: 55,  p: 0.8, c: 2,   f: 5.0, fiber: 1.0, liver: 'neutral', tags: ['fat'] },

  /* ---------------- PROTEIN ---------------- */
  { id: 'egg',         name: 'Whole Egg',       cat: 'protein', unit: 'egg',     step: 1, cal: 72,  p: 6.3, c: 0.4, f: 5.0, fiber: 0, liver: 'good',    tags: ['highprotein','nonveg'] },
  { id: 'egg_white',   name: 'Egg White',       cat: 'protein', unit: 'egg',     step: 1, cal: 17,  p: 3.6, c: 0.2, f: 0.1, fiber: 0, liver: 'good',    tags: ['highprotein','nonveg'] },
  { id: 'boiled_egg',  name: 'Boiled Egg',      cat: 'protein', unit: 'egg',     step: 1, cal: 78,  p: 6.3, c: 0.6, f: 5.3, fiber: 0, liver: 'good',    tags: ['highprotein','nonveg'] },
  { id: 'chicken_br',  name: 'Chicken Breast',  cat: 'protein', unit: '100 g',   step: 1, cal: 165, p: 31,  c: 0,   f: 3.6, fiber: 0, liver: 'good',    tags: ['highprotein','nonveg'] },
  { id: 'chicken_curry',name:'Chicken Curry',   cat: 'protein', unit: '100 g',   step: 1, cal: 190, p: 20,  c: 4,   f: 10,  fiber: 0.8, liver: 'neutral', tags: ['highprotein','nonveg','oil'] },
  { id: 'grilled_chk', name: 'Grilled Chicken', cat: 'protein', unit: '100 g',   step: 1, cal: 170, p: 30,  c: 0,   f: 5,   fiber: 0, liver: 'good',    tags: ['highprotein','nonveg'] },
  { id: 'paneer',      name: 'Paneer',          cat: 'protein', unit: '100 g',   step: 1, cal: 265, p: 18,  c: 4,   f: 20,  fiber: 0, liver: 'neutral', tags: ['highprotein','veg','fat'] },
  { id: 'tofu',        name: 'Tofu',            cat: 'protein', unit: '100 g',   step: 1, cal: 144, p: 17,  c: 3,   f: 9,   fiber: 2, liver: 'good',    tags: ['highprotein','veg'] },
  { id: 'milk',        name: 'Milk (toned)',    cat: 'protein', unit: 'glass (250ml)', step: 1, cal: 125, p: 8, c: 12, f: 4.5, fiber: 0, liver: 'good', tags: ['highprotein'] },
  { id: 'whey',        name: 'Whey Protein',    cat: 'protein', unit: 'scoop (30g)', step: 1, cal: 120, p: 24, c: 3, f: 1.5, fiber: 0, liver: 'good',  tags: ['highprotein'] },
  { id: 'soya_chunk',  name: 'Soya Chunks',     cat: 'protein', unit: '50 g dry', step: 1, cal: 173, p: 26,  c: 17,  f: 0.5, fiber: 6, liver: 'good',    tags: ['highprotein','veg','highfiber'] },
  { id: 'fish',        name: 'Fish (Rohu)',     cat: 'protein', unit: '100 g',   step: 1, cal: 130, p: 22,  c: 0,   f: 4,   fiber: 0, liver: 'good',    tags: ['highprotein','nonveg','omega3'] },
  { id: 'salmon',      name: 'Salmon',          cat: 'protein', unit: '100 g',   step: 1, cal: 208, p: 20,  c: 0,   f: 13,  fiber: 0, liver: 'good',    tags: ['highprotein','nonveg','omega3'] },
  { id: 'dal',         name: 'Dal (cooked)',    cat: 'protein', unit: 'cup',     step: 1, cal: 180, p: 12,  c: 28,  f: 2,   fiber: 8, liver: 'good',    tags: ['highprotein','veg','highfiber'] },
  { id: 'chana',       name: 'Chickpeas',       cat: 'protein', unit: 'cup',     step: 1, cal: 210, p: 11,  c: 35,  f: 3.5, fiber: 9, liver: 'good',    tags: ['highprotein','veg','highfiber'] },
  { id: 'rajma',       name: 'Rajma',           cat: 'protein', unit: 'cup',     step: 1, cal: 215, p: 13,  c: 37,  f: 1.5, fiber: 11, liver: 'good',   tags: ['highprotein','veg','highfiber'] },
  { id: 'curd_skip',   name: 'Greek Yogurt',    cat: 'protein', unit: 'cup',     step: 1, cal: 130, p: 11,  c: 9,   f: 4,   fiber: 0, liver: 'good',    tags: ['highprotein'] },

  /* ---------------- CARBS ---------------- */
  { id: 'rice',        name: 'White Rice',      cat: 'carb', unit: '100 g cooked', step: 1, cal: 130, p: 2.7, c: 28, f: 0.3, fiber: 0.4, liver: 'neutral', tags: ['refined'] },
  { id: 'brown_rice',  name: 'Brown Rice',      cat: 'carb', unit: '100 g cooked', step: 1, cal: 123, p: 2.7, c: 26, f: 1.0, fiber: 1.8, liver: 'good',    tags: ['wholegrain','highfiber'] },
  { id: 'chapati',     name: 'Chapati',         cat: 'carb', unit: 'piece',        step: 1, cal: 104, p: 3.1, c: 18, f: 2.5, fiber: 2.7, liver: 'good',    tags: ['wholegrain','highfiber'] },
  { id: 'phulka',      name: 'Phulka',          cat: 'carb', unit: 'piece',        step: 1, cal: 80,  p: 2.6, c: 16, f: 0.6, fiber: 2.4, liver: 'good',    tags: ['wholegrain','highfiber'] },
  { id: 'jeera_rice',  name: 'Jeera Rice',      cat: 'carb', unit: '100 g',        step: 1, cal: 165, p: 3,   c: 28, f: 4.5, fiber: 0.6, liver: 'neutral', tags: ['oil'] },
  { id: 'quinoa',      name: 'Quinoa',          cat: 'carb', unit: '100 g cooked', step: 1, cal: 120, p: 4.4, c: 21, f: 1.9, fiber: 2.8, liver: 'good',    tags: ['wholegrain','highfiber'] },
  { id: 'millet',      name: 'Millet (Ragi)',   cat: 'carb', unit: '100 g cooked', step: 1, cal: 119, p: 3.5, c: 25, f: 1.0, fiber: 3.6, liver: 'good',    tags: ['wholegrain','highfiber'] },
  { id: 'sweet_potato',name: 'Sweet Potato',    cat: 'carb', unit: '100 g',        step: 1, cal: 86,  p: 1.6, c: 20, f: 0.1, fiber: 3.0, liver: 'good',    tags: ['highfiber'] },
  { id: 'white_bread', name: 'White Bread',     cat: 'carb', unit: 'slice',        step: 1, cal: 80,  p: 2.5, c: 15, f: 1.0, fiber: 0.8, liver: 'neutral', tags: ['refined'] },

  /* ---------------- VEGETABLES ---------------- */
  { id: 'broccoli',    name: 'Broccoli',        cat: 'veg', unit: 'cup',  step: 1, cal: 55,  p: 3.7, c: 11, f: 0.6, fiber: 5.1, liver: 'good', tags: ['highfiber','liverstar'] },
  { id: 'green_peas',  name: 'Green Peas',      cat: 'veg', unit: 'cup',  step: 1, cal: 118, p: 8.0, c: 21, f: 0.6, fiber: 8.3, liver: 'good', tags: ['highfiber'] },
  { id: 'spinach',     name: 'Spinach',         cat: 'veg', unit: 'cup',  step: 1, cal: 23,  p: 2.9, c: 3.6,f: 0.4, fiber: 2.2, liver: 'good', tags: ['highfiber'] },
  { id: 'beans',       name: 'Beans',           cat: 'veg', unit: 'cup',  step: 1, cal: 44,  p: 2.4, c: 8,  f: 0.3, fiber: 3.4, liver: 'good', tags: ['highfiber'] },
  { id: 'carrot',      name: 'Carrot',          cat: 'veg', unit: 'cup',  step: 1, cal: 52,  p: 1.2, c: 12, f: 0.3, fiber: 3.6, liver: 'good', tags: ['highfiber'] },
  { id: 'capsicum',    name: 'Capsicum',        cat: 'veg', unit: 'cup',  step: 1, cal: 30,  p: 1.3, c: 7,  f: 0.3, fiber: 2.5, liver: 'good', tags: ['highfiber'] },
  { id: 'mushroom',    name: 'Mushroom',        cat: 'veg', unit: 'cup',  step: 1, cal: 21,  p: 3.0, c: 3,  f: 0.3, fiber: 1.0, liver: 'good', tags: [] },
  { id: 'mixed_veg',   name: 'Mixed Vegetables',cat: 'veg', unit: 'cup',  step: 1, cal: 70,  p: 3.0, c: 13, f: 0.5, fiber: 4.5, liver: 'good', tags: ['highfiber'] },
  { id: 'cauliflower', name: 'Cauliflower',     cat: 'veg', unit: 'cup',  step: 1, cal: 27,  p: 2.0, c: 5,  f: 0.3, fiber: 2.1, liver: 'good', tags: ['highfiber'] },
  { id: 'cabbage',     name: 'Cabbage',         cat: 'veg', unit: 'cup',  step: 1, cal: 22,  p: 1.1, c: 5,  f: 0.1, fiber: 2.2, liver: 'good', tags: ['highfiber'] },
  { id: 'bottle_gourd',name: 'Bottle Gourd',    cat: 'veg', unit: 'cup',  step: 1, cal: 17,  p: 0.6, c: 4,  f: 0.0, fiber: 1.2, liver: 'good', tags: [] },
  { id: 'okra',        name: 'Okra (Bhindi)',   cat: 'veg', unit: 'cup',  step: 1, cal: 33,  p: 1.9, c: 7,  f: 0.2, fiber: 3.2, liver: 'good', tags: ['highfiber'] },
  { id: 'tomato',      name: 'Tomato',          cat: 'veg', unit: 'cup',  step: 1, cal: 32,  p: 1.6, c: 7,  f: 0.4, fiber: 2.2, liver: 'good', tags: [] },
  { id: 'cucumber',    name: 'Cucumber',        cat: 'veg', unit: 'cup',  step: 1, cal: 16,  p: 0.7, c: 4,  f: 0.1, fiber: 0.5, liver: 'good', tags: [] },
  { id: 'beetroot',    name: 'Beetroot',        cat: 'veg', unit: 'cup',  step: 1, cal: 58,  p: 2.2, c: 13, f: 0.2, fiber: 3.8, liver: 'good', tags: ['highfiber'] },
  { id: 'lauki_sabzi', name: 'Mixed Sabzi',     cat: 'veg', unit: 'cup',  step: 1, cal: 110, p: 3.0, c: 12, f: 5.5, fiber: 4.0, liver: 'neutral', tags: ['oil','highfiber'] },

  /* ---------------- FRUITS ---------------- */
  { id: 'banana',      name: 'Banana',          cat: 'fruit', unit: 'medium', step: 1, cal: 105, p: 1.3, c: 27, f: 0.4, fiber: 3.1, liver: 'good', tags: ['highfiber'] },
  { id: 'apple',       name: 'Apple',           cat: 'fruit', unit: 'medium', step: 1, cal: 95,  p: 0.5, c: 25, f: 0.3, fiber: 4.4, liver: 'good', tags: ['highfiber'] },
  { id: 'orange',      name: 'Orange',          cat: 'fruit', unit: 'medium', step: 1, cal: 62,  p: 1.2, c: 15, f: 0.2, fiber: 3.1, liver: 'good', tags: ['highfiber'] },
  { id: 'papaya',      name: 'Papaya',          cat: 'fruit', unit: 'cup',    step: 1, cal: 62,  p: 0.7, c: 16, f: 0.4, fiber: 2.5, liver: 'good', tags: ['highfiber'] },
  { id: 'guava',       name: 'Guava',           cat: 'fruit', unit: 'medium', step: 1, cal: 68,  p: 2.6, c: 14, f: 1.0, fiber: 5.4, liver: 'good', tags: ['highfiber'] },
  { id: 'pomegranate', name: 'Pomegranate',     cat: 'fruit', unit: 'cup',    step: 1, cal: 144, p: 3.0, c: 33, f: 2.0, fiber: 7.0, liver: 'good', tags: ['highfiber'] },
  { id: 'berries',     name: 'Mixed Berries',   cat: 'fruit', unit: 'cup',    step: 1, cal: 70,  p: 1.0, c: 17, f: 0.5, fiber: 6.0, liver: 'good', tags: ['highfiber','antioxidant'] },
  { id: 'watermelon',  name: 'Watermelon',      cat: 'fruit', unit: 'cup',    step: 1, cal: 46,  p: 0.9, c: 12, f: 0.2, fiber: 0.6, liver: 'good', tags: [] },
  { id: 'mango',       name: 'Mango',           cat: 'fruit', unit: 'cup',    step: 1, cal: 99,  p: 1.4, c: 25, f: 0.6, fiber: 2.6, liver: 'neutral', tags: ['sugary'] },

  /* ---------------- SNACKS / NUTS / SEEDS ---------------- */
  { id: 'walnuts',     name: 'Walnuts',         cat: 'snack', unit: '30 g', step: 1, cal: 196, p: 4.5, c: 4,  f: 19.5, fiber: 2.0, liver: 'good', tags: ['omega3','fat','liverstar'] },
  { id: 'almonds',     name: 'Almonds',         cat: 'snack', unit: '30 g', step: 1, cal: 173, p: 6.3, c: 6,  f: 15,   fiber: 3.5, liver: 'good', tags: ['fat','highfiber'] },
  { id: 'flaxseed',    name: 'Flaxseed',        cat: 'snack', unit: 'tbsp', step: 1, cal: 55,  p: 1.9, c: 3,  f: 4.3,  fiber: 2.8, liver: 'good', tags: ['omega3','highfiber','liverstar'] },
  { id: 'chia',        name: 'Chia Seeds',      cat: 'snack', unit: 'tbsp', step: 1, cal: 58,  p: 2.0, c: 5,  f: 3.7,  fiber: 4.1, liver: 'good', tags: ['omega3','highfiber'] },
  { id: 'pumpkin_seed',name: 'Pumpkin Seeds',   cat: 'snack', unit: '30 g', step: 1, cal: 151, p: 7.0, c: 5,  f: 13,   fiber: 1.7, liver: 'good', tags: ['fat'] },
  { id: 'peanuts',     name: 'Roasted Peanuts', cat: 'snack', unit: '30 g', step: 1, cal: 166, p: 7.3, c: 6,  f: 14,   fiber: 2.4, liver: 'good', tags: ['fat'] },
  { id: 'makhana',     name: 'Makhana (roasted)',cat:'snack', unit: 'cup',  step: 1, cal: 90,  p: 3.0, c: 18, f: 0.5,  fiber: 2.5, liver: 'good', tags: ['highfiber'] },
  { id: 'sprouts',     name: 'Sprouts Salad',   cat: 'snack', unit: 'cup',  step: 1, cal: 100, p: 8.0, c: 16, f: 1.0,  fiber: 5.0, liver: 'good', tags: ['highprotein','highfiber'] },
  { id: 'roasted_chana',name:'Roasted Chana',   cat: 'snack', unit: '30 g', step: 1, cal: 120, p: 6.0, c: 18, f: 2.0,  fiber: 5.0, liver: 'good', tags: ['highprotein','highfiber'] },
  { id: 'dark_choc',   name: 'Dark Chocolate',  cat: 'snack', unit: '20 g', step: 1, cal: 120, p: 1.5, c: 9,  f: 8.5,  fiber: 2.0, liver: 'neutral', tags: ['fat'] },

  /* ---------------- DRINKS ---------------- */
  { id: 'coffee',      name: 'Coffee (with milk)', cat: 'drink', unit: 'cup', step: 1, cal: 60,  p: 3.0, c: 7, f: 2.5, fiber: 0, liver: 'neutral', tags: [] },
  { id: 'black_coffee',name: 'Black Coffee',    cat: 'drink', unit: 'cup', step: 1, cal: 5,   p: 0.3, c: 0,  f: 0,   fiber: 0, liver: 'good', tags: [] },
  { id: 'green_tea',   name: 'Green Tea',       cat: 'drink', unit: 'cup', step: 1, cal: 2,   p: 0,   c: 0,  f: 0,   fiber: 0, liver: 'good', tags: ['antioxidant','liverstar'] },
  { id: 'tea',         name: 'Tea (with milk)', cat: 'drink', unit: 'cup', step: 1, cal: 70,  p: 2.0, c: 9,  f: 2.5, fiber: 0, liver: 'neutral', tags: ['sugary'] },
  { id: 'buttermilk',  name: 'Buttermilk',      cat: 'drink', unit: 'glass', step: 1, cal: 40,  p: 2.5, c: 5, f: 1.0, fiber: 0, liver: 'good', tags: [] },
  { id: 'lemon_water', name: 'Lemon Water',     cat: 'drink', unit: 'glass', step: 1, cal: 10,  p: 0.1, c: 3, f: 0,   fiber: 0, liver: 'good', tags: [] },
  { id: 'coconut_water',name:'Coconut Water',   cat: 'drink', unit: 'glass', step: 1, cal: 46,  p: 1.7, c: 9, f: 0.5, fiber: 2.6, liver: 'good', tags: [] },
  { id: 'protein_shake',name:'Protein Shake',   cat: 'drink', unit: 'glass', step: 1, cal: 160, p: 26,  c: 8, f: 3,   fiber: 0, liver: 'good', tags: ['highprotein'] },

  /* ---------------- CURRIES (Indian) ---------------- */
  /* Vegetarian curries */
  { id: 'veg_curry',     name: 'Vegetable Curry',      cat: 'curry', unit: 'cup', step: 1, cal: 140, p: 4,  c: 14, f: 8,  fiber: 4.0, liver: 'neutral', tags: ['oil','highfiber','veg'] },
  { id: 'mixed_veg_curry',name:'Mixed Veg Sabzi',      cat: 'curry', unit: 'cup', step: 1, cal: 120, p: 3,  c: 13, f: 6.5,fiber: 4.5, liver: 'good',    tags: ['oil','highfiber','veg'] },
  { id: 'veg_korma',     name: 'Veg Korma',            cat: 'curry', unit: 'cup', step: 1, cal: 200, p: 5,  c: 16, f: 13, fiber: 4.0, liver: 'neutral', tags: ['oil','fat','veg'] },
  { id: 'paneer_bm',     name: 'Paneer Butter Masala', cat: 'curry', unit: 'cup', step: 1, cal: 320, p: 12, c: 12, f: 25, fiber: 2.0, liver: 'neutral', tags: ['fat','veg','highprotein'] },
  { id: 'palak_paneer',  name: 'Palak Paneer',         cat: 'curry', unit: 'cup', step: 1, cal: 250, p: 13, c: 10, f: 18, fiber: 4.0, liver: 'good',    tags: ['veg','highprotein','highfiber'] },
  { id: 'kadai_paneer',  name: 'Kadai Paneer',         cat: 'curry', unit: 'cup', step: 1, cal: 280, p: 14, c: 12, f: 20, fiber: 3.0, liver: 'neutral', tags: ['veg','highprotein'] },
  { id: 'matar_paneer',  name: 'Matar Paneer',         cat: 'curry', unit: 'cup', step: 1, cal: 260, p: 13, c: 16, f: 16, fiber: 5.0, liver: 'good',    tags: ['veg','highprotein','highfiber'] },
  { id: 'chole',         name: 'Chole (Chana Masala)', cat: 'curry', unit: 'cup', step: 1, cal: 230, p: 10, c: 32, f: 7,  fiber: 9.0, liver: 'good',    tags: ['veg','highprotein','highfiber'] },
  { id: 'rajma_curry',   name: 'Rajma Masala',         cat: 'curry', unit: 'cup', step: 1, cal: 240, p: 12, c: 35, f: 5,  fiber: 11,  liver: 'good',    tags: ['veg','highprotein','highfiber'] },
  { id: 'dal_tadka',     name: 'Dal Tadka',            cat: 'curry', unit: 'cup', step: 1, cal: 190, p: 11, c: 24, f: 6,  fiber: 6.0, liver: 'good',    tags: ['veg','highprotein','highfiber'] },
  { id: 'dal_makhani',   name: 'Dal Makhani',          cat: 'curry', unit: 'cup', step: 1, cal: 290, p: 12, c: 28, f: 14, fiber: 7.0, liver: 'neutral', tags: ['veg','fat','highfiber'] },
  { id: 'aloo_gobi',     name: 'Aloo Gobi',            cat: 'curry', unit: 'cup', step: 1, cal: 160, p: 4,  c: 22, f: 7,  fiber: 4.0, liver: 'neutral', tags: ['oil','veg','highfiber'] },
  { id: 'bhindi_masala', name: 'Bhindi Masala',        cat: 'curry', unit: 'cup', step: 1, cal: 150, p: 3,  c: 12, f: 10, fiber: 4.0, liver: 'neutral', tags: ['oil','veg','highfiber'] },
  { id: 'baingan_bharta',name: 'Baingan Bharta',       cat: 'curry', unit: 'cup', step: 1, cal: 140, p: 3,  c: 14, f: 9,  fiber: 5.0, liver: 'good',    tags: ['veg','highfiber'] },
  { id: 'mushroom_masala',name:'Mushroom Masala',      cat: 'curry', unit: 'cup', step: 1, cal: 170, p: 6,  c: 12, f: 11, fiber: 3.0, liver: 'neutral', tags: ['veg'] },
  { id: 'sambar_curry',  name: 'Sambar',               cat: 'curry', unit: 'cup', step: 1, cal: 110, p: 5,  c: 16, f: 3,  fiber: 4.0, liver: 'good',    tags: ['veg','highfiber'] },
  { id: 'kofta_curry',   name: 'Veg Kofta Curry',      cat: 'curry', unit: 'cup', step: 1, cal: 280, p: 7,  c: 20, f: 19, fiber: 3.5, liver: 'neutral', tags: ['oil','fat','veg'] },
  { id: 'soya_curry',    name: 'Soya Chunk Curry',     cat: 'curry', unit: 'cup', step: 1, cal: 230, p: 18, c: 18, f: 9,  fiber: 6.0, liver: 'good',    tags: ['veg','highprotein','highfiber'] },
  /* Non-vegetarian curries */
  { id: 'chk_curry_c',   name: 'Chicken Curry',        cat: 'curry', unit: 'cup', step: 1, cal: 240, p: 24, c: 6,  f: 13, fiber: 1.0, liver: 'neutral', tags: ['nonveg','highprotein','oil'] },
  { id: 'butter_chicken',name: 'Butter Chicken',       cat: 'curry', unit: 'cup', step: 1, cal: 330, p: 22, c: 8,  f: 22, fiber: 1.0, liver: 'neutral', tags: ['nonveg','highprotein','fat'] },
  { id: 'chk_tikka_masala',name:'Chicken Tikka Masala',cat: 'curry', unit: 'cup', step: 1, cal: 290, p: 24, c: 9,  f: 17, fiber: 2.0, liver: 'neutral', tags: ['nonveg','highprotein'] },
  { id: 'egg_curry',     name: 'Egg Curry',            cat: 'curry', unit: 'cup', step: 1, cal: 220, p: 12, c: 8,  f: 15, fiber: 2.0, liver: 'neutral', tags: ['nonveg','highprotein'] },
  { id: 'fish_curry',    name: 'Fish Curry',           cat: 'curry', unit: 'cup', step: 1, cal: 200, p: 20, c: 6,  f: 11, fiber: 1.0, liver: 'good',    tags: ['nonveg','highprotein','omega3'] },
  { id: 'mutton_curry',  name: 'Mutton Curry',         cat: 'curry', unit: 'cup', step: 1, cal: 300, p: 22, c: 5,  f: 21, fiber: 1.0, liver: 'neutral', tags: ['nonveg','highprotein','fat'] },
  { id: 'prawn_curry',   name: 'Prawn Curry',          cat: 'curry', unit: 'cup', step: 1, cal: 210, p: 22, c: 7,  f: 11, fiber: 1.0, liver: 'good',    tags: ['nonveg','highprotein'] },

  /* ---------------- NUTS & DRY FRUITS ---------------- */
  { id: 'cashews',       name: 'Cashews',          cat: 'snack', unit: '30 g', step: 1, cal: 157, p: 5.0, c: 9,  f: 12,  fiber: 1.0, liver: 'good',    tags: ['nut','fat'] },
  { id: 'pistachios',    name: 'Pistachios',       cat: 'snack', unit: '30 g', step: 1, cal: 159, p: 6.0, c: 8,  f: 13,  fiber: 3.0, liver: 'good',    tags: ['nut','fat','highfiber'] },
  { id: 'hazelnuts',     name: 'Hazelnuts',        cat: 'snack', unit: '30 g', step: 1, cal: 188, p: 4.5, c: 5,  f: 18,  fiber: 2.9, liver: 'good',    tags: ['nut','fat'] },
  { id: 'brazil_nuts',   name: 'Brazil Nuts',      cat: 'snack', unit: '30 g', step: 1, cal: 196, p: 4.0, c: 4,  f: 20,  fiber: 2.3, liver: 'good',    tags: ['nut','fat'] },
  { id: 'pecans',        name: 'Pecans',           cat: 'snack', unit: '30 g', step: 1, cal: 207, p: 2.7, c: 4,  f: 21,  fiber: 2.9, liver: 'good',    tags: ['nut','fat'] },
  { id: 'mixed_nuts',    name: 'Mixed Nuts',       cat: 'snack', unit: '30 g', step: 1, cal: 173, p: 5.0, c: 6,  f: 15,  fiber: 2.5, liver: 'good',    tags: ['nut','fat'] },
  { id: 'sunflower_seed',name: 'Sunflower Seeds',  cat: 'snack', unit: '30 g', step: 1, cal: 175, p: 6.0, c: 6,  f: 15,  fiber: 2.6, liver: 'good',    tags: ['nut','fat'] },
  { id: 'sesame_seed',   name: 'Sesame Seeds',     cat: 'snack', unit: 'tbsp', step: 1, cal: 52,  p: 1.6, c: 2,  f: 4.5, fiber: 1.1, liver: 'good',    tags: ['nut','fat'] },
  { id: 'raisins',       name: 'Raisins',          cat: 'snack', unit: '30 g', step: 1, cal: 90,  p: 1.0, c: 22, f: 0.2, fiber: 1.0, liver: 'neutral', tags: ['dryfruit'] },
  { id: 'dates',         name: 'Dates',            cat: 'snack', unit: 'piece',step: 1, cal: 66,  p: 0.4, c: 18, f: 0,   fiber: 1.6, liver: 'neutral', tags: ['dryfruit'] },
  { id: 'dried_figs',    name: 'Dried Figs (Anjeer)',cat:'snack', unit: 'piece',step: 1, cal: 47,  p: 0.6, c: 12, f: 0.2, fiber: 1.9, liver: 'good',    tags: ['dryfruit','highfiber'] },
  { id: 'dried_apricot', name: 'Dried Apricots',   cat: 'snack', unit: '30 g', step: 1, cal: 72,  p: 1.0, c: 19, f: 0.1, fiber: 2.2, liver: 'neutral', tags: ['dryfruit','highfiber'] },
  { id: 'prunes',        name: 'Prunes',           cat: 'snack', unit: 'piece',step: 1, cal: 23,  p: 0.2, c: 6,  f: 0,   fiber: 0.7, liver: 'good',    tags: ['dryfruit'] },
  { id: 'dried_cranberry',name:'Dried Cranberries',cat: 'snack', unit: '30 g', step: 1, cal: 92,  p: 0,   c: 24, f: 0.4, fiber: 1.5, liver: 'neutral', tags: ['dryfruit','sugary'] },

  /* ---------------- MORE FRUITS ---------------- */
  { id: 'grapes',        name: 'Grapes',           cat: 'fruit', unit: 'cup',    step: 1, cal: 104, p: 1.1, c: 27, f: 0.2, fiber: 1.4, liver: 'good',    tags: [] },
  { id: 'pineapple',     name: 'Pineapple',        cat: 'fruit', unit: 'cup',    step: 1, cal: 82,  p: 0.9, c: 22, f: 0.2, fiber: 2.3, liver: 'good',    tags: [] },
  { id: 'pear',          name: 'Pear',             cat: 'fruit', unit: 'medium', step: 1, cal: 101, p: 0.6, c: 27, f: 0.2, fiber: 5.5, liver: 'good',    tags: ['highfiber'] },
  { id: 'kiwi',          name: 'Kiwi',             cat: 'fruit', unit: 'medium', step: 1, cal: 42,  p: 0.8, c: 10, f: 0.4, fiber: 2.1, liver: 'good',    tags: [] },
  { id: 'muskmelon',     name: 'Muskmelon',        cat: 'fruit', unit: 'cup',    step: 1, cal: 53,  p: 1.3, c: 13, f: 0.3, fiber: 1.4, liver: 'good',    tags: [] },
  { id: 'strawberry',    name: 'Strawberries',     cat: 'fruit', unit: 'cup',    step: 1, cal: 49,  p: 1.0, c: 12, f: 0.5, fiber: 3.0, liver: 'good',    tags: ['highfiber','antioxidant'] },
  { id: 'chikoo',        name: 'Sapota (Chikoo)',  cat: 'fruit', unit: 'medium', step: 1, cal: 94,  p: 0.5, c: 23, f: 1.1, fiber: 5.3, liver: 'neutral', tags: ['sugary','highfiber'] },
  { id: 'custard_apple', name: 'Custard Apple',    cat: 'fruit', unit: 'cup',    step: 1, cal: 150, p: 2.5, c: 36, f: 0.6, fiber: 7.0, liver: 'neutral', tags: ['sugary','highfiber'] },
  { id: 'plum',          name: 'Plum',             cat: 'fruit', unit: 'medium', step: 1, cal: 30,  p: 0.5, c: 8,  f: 0.2, fiber: 0.9, liver: 'good',    tags: [] },
  { id: 'peach',         name: 'Peach',            cat: 'fruit', unit: 'medium', step: 1, cal: 59,  p: 1.4, c: 14, f: 0.4, fiber: 2.3, liver: 'good',    tags: [] },
  { id: 'litchi',        name: 'Litchi',           cat: 'fruit', unit: 'cup',    step: 1, cal: 125, p: 1.6, c: 31, f: 0.8, fiber: 2.5, liver: 'neutral', tags: ['sugary'] },
  { id: 'dragon_fruit',  name: 'Dragon Fruit',     cat: 'fruit', unit: 'cup',    step: 1, cal: 102, p: 2.0, c: 22, f: 0,   fiber: 5.0, liver: 'good',    tags: ['highfiber'] },
  { id: 'sweet_lime',    name: 'Sweet Lime (Mosambi)',cat:'fruit',unit: 'medium',step: 1, cal: 50,  p: 1.0, c: 13, f: 0.2, fiber: 2.4, liver: 'good',    tags: [] },

  /* ---------------- SOUTH INDIAN / KANNADA RICE & ONE-POT ---------------- */
  { id: 'lemon_rice',   name: 'Lemon Rice (Chitranna)', cat: 'rice', unit: 'cup', step: 1, cal: 230, p: 4,  c: 40, f: 6,  fiber: 2.0, liver: 'neutral', tags: ['oil'] },
  { id: 'puliogare',    name: 'Puliyogare (Tamarind Rice)', cat: 'rice', unit: 'cup', step: 1, cal: 260, p: 5, c: 44, f: 7, fiber: 3.0, liver: 'neutral', tags: ['oil'] },
  { id: 'bisibele',     name: 'Bisi Bele Bath',     cat: 'rice', unit: 'cup', step: 1, cal: 280, p: 8,  c: 45, f: 8,  fiber: 5.0, liver: 'good',    tags: ['highfiber'] },
  { id: 'vangi_bath',   name: 'Vangi Bath',         cat: 'rice', unit: 'cup', step: 1, cal: 250, p: 5,  c: 42, f: 7,  fiber: 4.0, liver: 'neutral', tags: ['oil','highfiber'] },
  { id: 'tomato_rice',  name: 'Tomato Rice',        cat: 'rice', unit: 'cup', step: 1, cal: 240, p: 4,  c: 42, f: 6,  fiber: 2.5, liver: 'neutral', tags: ['oil'] },
  { id: 'coconut_rice', name: 'Coconut Rice',       cat: 'rice', unit: 'cup', step: 1, cal: 290, p: 5,  c: 40, f: 12, fiber: 3.0, liver: 'neutral', tags: ['fat'] },
  { id: 'curd_rice',    name: 'Curd Rice',          cat: 'rice', unit: 'cup', step: 1, cal: 200, p: 6,  c: 33, f: 5,  fiber: 1.0, liver: 'good',    tags: [] },
  { id: 'ghee_rice',    name: 'Ghee Rice',          cat: 'rice', unit: 'cup', step: 1, cal: 300, p: 5,  c: 45, f: 11, fiber: 1.5, liver: 'neutral', tags: ['ghee','fat'] },
  { id: 'veg_pulao',    name: 'Veg Pulao',          cat: 'rice', unit: 'cup', step: 1, cal: 260, p: 6,  c: 42, f: 8,  fiber: 4.0, liver: 'neutral', tags: ['oil','highfiber'] },
  { id: 'shavige',      name: 'Shavige (Rice Vermicelli)', cat: 'rice', unit: 'cup', step: 1, cal: 200, p: 4, c: 40, f: 3, fiber: 2.0, liver: 'neutral', tags: [] },
  { id: 'chicken_biryani', name: 'Chicken Biryani', cat: 'rice', unit: 'cup', step: 1, cal: 330, p: 16, c: 42, f: 11, fiber: 2.0, liver: 'neutral', tags: ['nonveg','highprotein','oil'] },
  { id: 'egg_rice',     name: 'Egg Rice',           cat: 'rice', unit: 'cup', step: 1, cal: 280, p: 11, c: 38, f: 9,  fiber: 1.5, liver: 'neutral', tags: ['nonveg','highprotein'] },

  /* ---------------- SOUTH INDIAN / KANNADA TIFFIN (breakfast) ---------------- */
  { id: 'rava_idli',    name: 'Rava Idli',          cat: 'breakfast', unit: 'piece', step: 1, cal: 75,  p: 2.5, c: 13, f: 1.5, fiber: 1.0, liver: 'neutral', tags: [] },
  { id: 'thatte_idli',  name: 'Thatte Idli',        cat: 'breakfast', unit: 'piece', step: 1, cal: 90,  p: 3.0, c: 18, f: 0.6, fiber: 1.2, liver: 'good',    tags: ['steamed'] },
  { id: 'khara_bath',   name: 'Khara Bath (Rava Bath)', cat: 'breakfast', unit: 'cup', step: 1, cal: 200, p: 4, c: 32, f: 6, fiber: 2.0, liver: 'neutral', tags: ['oil'] },
  { id: 'kesari_bath',  name: 'Kesari Bath',        cat: 'breakfast', unit: 'cup', step: 1, cal: 280, p: 4,  c: 45, f: 10, fiber: 1.0, liver: 'bad',     tags: ['sugary','ghee'] },
  { id: 'benne_dosa',   name: 'Benne Dosa',         cat: 'breakfast', unit: 'piece', step: 1, cal: 150, p: 3,  c: 24, f: 5,  fiber: 1.0, liver: 'neutral', tags: ['ghee'] },
  { id: 'mysore_dosa',  name: 'Mysore Masala Dosa', cat: 'breakfast', unit: 'piece', step: 1, cal: 280, p: 5,  c: 40, f: 10, fiber: 3.0, liver: 'neutral', tags: ['oil'] },
  { id: 'medu_vada',    name: 'Medu Vada',          cat: 'breakfast', unit: 'piece', step: 1, cal: 97,  p: 3,  c: 10, f: 5,  fiber: 1.5, liver: 'neutral', tags: ['fried'] },
  { id: 'maddur_vada',  name: 'Maddur Vada',        cat: 'breakfast', unit: 'piece', step: 1, cal: 130, p: 2.5,c: 15, f: 7,  fiber: 1.0, liver: 'neutral', tags: ['fried'] },
  { id: 'goli_baje',    name: 'Goli Baje (Mangalore Bajji)', cat: 'breakfast', unit: 'piece', step: 1, cal: 80, p: 1.5, c: 10, f: 4, fiber: 0.5, liver: 'neutral', tags: ['fried'] },
  { id: 'sabudana_khichdi', name: 'Sabudana Khichdi', cat: 'breakfast', unit: 'cup', step: 1, cal: 250, p: 4, c: 38, f: 9, fiber: 2.0, liver: 'neutral', tags: ['oil'] },

  /* ---------------- KANNADA ROTTIS / MILLET BREADS ---------------- */
  { id: 'ragi_rotti',   name: 'Ragi Rotti',         cat: 'carb', unit: 'piece', step: 1, cal: 120, p: 3,  c: 22, f: 3,  fiber: 4.0, liver: 'good', tags: ['wholegrain','highfiber'] },
  { id: 'akki_rotti',   name: 'Akki Rotti',         cat: 'carb', unit: 'piece', step: 1, cal: 140, p: 2.5,c: 26, f: 3.5,fiber: 2.0, liver: 'neutral', tags: [] },
  { id: 'jolada_rotti', name: 'Jolada Rotti (Jowar)', cat: 'carb', unit: 'piece', step: 1, cal: 120, p: 3, c: 24, f: 1, fiber: 3.5, liver: 'good', tags: ['wholegrain','highfiber'] },
  { id: 'ragi_mudde',   name: 'Ragi Mudde',         cat: 'carb', unit: 'ball', step: 1, cal: 130, p: 3,  c: 28, f: 1,  fiber: 4.0, liver: 'good', tags: ['wholegrain','highfiber'] },
  { id: 'bajra_roti',   name: 'Bajra Roti',         cat: 'carb', unit: 'piece', step: 1, cal: 110, p: 3,  c: 22, f: 1.5,fiber: 3.5, liver: 'good', tags: ['wholegrain','highfiber'] },
  { id: 'jowar_upma',   name: 'Jowar Upma',         cat: 'carb', unit: 'cup', step: 1, cal: 170, p: 4,  c: 30, f: 4,  fiber: 4.5, liver: 'good', tags: ['wholegrain','highfiber'] },

  /* ---------------- SOUTH INDIAN VEG CURRIES / SIDES ---------------- */
  { id: 'rasam',        name: 'Rasam',              cat: 'curry', unit: 'cup', step: 1, cal: 60,  p: 3,  c: 9,  f: 1.5, fiber: 2.0, liver: 'good', tags: ['veg','highfiber'] },
  { id: 'avial',        name: 'Avial',              cat: 'curry', unit: 'cup', step: 1, cal: 150, p: 4,  c: 12, f: 10, fiber: 4.0, liver: 'good', tags: ['veg','highfiber','fat'] },
  { id: 'kootu',        name: 'Kootu (Dal + Veg)',  cat: 'curry', unit: 'cup', step: 1, cal: 160, p: 7,  c: 18, f: 6,  fiber: 5.0, liver: 'good', tags: ['veg','highprotein','highfiber'] },
  { id: 'gojju',        name: 'Gojju',              cat: 'curry', unit: 'cup', step: 1, cal: 110, p: 2,  c: 18, f: 4,  fiber: 2.0, liver: 'neutral', tags: ['veg'] },
  { id: 'huli',         name: 'Huli (Sambar-style)',cat: 'curry', unit: 'cup', step: 1, cal: 110, p: 5,  c: 16, f: 3,  fiber: 4.0, liver: 'good', tags: ['veg','highfiber'] },
  { id: 'majjige_huli', name: 'Majjige Huli',       cat: 'curry', unit: 'cup', step: 1, cal: 120, p: 4,  c: 10, f: 7,  fiber: 3.0, liver: 'neutral', tags: ['veg'] },
  { id: 'palya',        name: 'Palya (Veg Stir-fry)', cat: 'veg', unit: 'cup', step: 1, cal: 90, p: 3, c: 10, f: 4, fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'kosambari',    name: 'Kosambari (Lentil Salad)', cat: 'veg', unit: 'cup', step: 1, cal: 90, p: 5, c: 12, f: 2, fiber: 4.0, liver: 'good', tags: ['highprotein','highfiber'] },

  /* ---------------- SOUTH INDIAN NON-VEG ---------------- */
  { id: 'chicken_ghee_roast', name: 'Chicken Ghee Roast', cat: 'curry', unit: 'cup', step: 1, cal: 320, p: 26, c: 6, f: 20, fiber: 1.0, liver: 'neutral', tags: ['nonveg','highprotein','ghee','fat'] },
  { id: 'chicken_sukka', name: 'Chicken Sukka',     cat: 'curry', unit: 'cup', step: 1, cal: 260, p: 27, c: 5,  f: 14, fiber: 2.0, liver: 'good',    tags: ['nonveg','highprotein'] },
  { id: 'chicken_chettinad', name: 'Chicken Chettinad', cat: 'curry', unit: 'cup', step: 1, cal: 290, p: 25, c: 8, f: 17, fiber: 2.0, liver: 'neutral', tags: ['nonveg','highprotein'] },
  { id: 'mutton_sukka', name: 'Mutton Sukka',       cat: 'curry', unit: 'cup', step: 1, cal: 300, p: 24, c: 4,  f: 21, fiber: 1.0, liver: 'neutral', tags: ['nonveg','highprotein','fat'] },
  { id: 'prawn_sukka',  name: 'Prawn Sukka',        cat: 'curry', unit: 'cup', step: 1, cal: 220, p: 23, c: 6,  f: 11, fiber: 1.0, liver: 'good',    tags: ['nonveg','highprotein'] },
  { id: 'fish_fry',     name: 'Fish Fry',           cat: 'protein', unit: 'piece', step: 1, cal: 200, p: 22, c: 5, f: 10, fiber: 0, liver: 'good', tags: ['nonveg','highprotein','omega3','fried'] },
  { id: 'egg_bhurji',   name: 'Egg Bhurji',         cat: 'protein', unit: 'cup', step: 1, cal: 200, p: 13, c: 4, f: 15, fiber: 1.0, liver: 'good', tags: ['nonveg','highprotein'] },
  { id: 'chicken_kebab',name: 'Chicken Kebab',      cat: 'protein', unit: '100 g', step: 1, cal: 175, p: 28, c: 3, f: 6, fiber: 0, liver: 'good', tags: ['nonveg','highprotein'] },

  /* ---------------- SHAVIGE (VERMICELLI) DISHES ---------------- */
  { id: 'shavige_upittu',    name: 'Shavige Upittu (Vermicelli Upma)', cat: 'rice', unit: 'cup', step: 1, cal: 210, p: 5, c: 38, f: 5, fiber: 2.5, liver: 'neutral', tags: ['oil'] },
  { id: 'shavige_chitranna', name: 'Shavige Chitranna (Lemon Vermicelli)', cat: 'rice', unit: 'cup', step: 1, cal: 220, p: 5, c: 40, f: 6, fiber: 2.5, liver: 'neutral', tags: ['oil'] },

  /* ---------------- SAARUS ---------------- */
  { id: 'bele_saaru',   name: 'Bele Saaru (Dal Saaru)',     cat: 'curry', unit: 'cup', step: 1, cal: 130, p: 7, c: 18, f: 3,   fiber: 4.0, liver: 'good', tags: ['veg','highprotein','highfiber'] },
  { id: 'soppu_saaru',  name: 'Soppu Saaru (Greens Saaru)', cat: 'curry', unit: 'cup', step: 1, cal: 90,  p: 5, c: 12, f: 2.5, fiber: 4.0, liver: 'good', tags: ['veg','highfiber'] },
  { id: 'bassaru',      name: 'Bas Saaru (Bassaru)',        cat: 'curry', unit: 'cup', step: 1, cal: 110, p: 6, c: 14, f: 3,   fiber: 4.0, liver: 'good', tags: ['veg','highfiber'] },
  { id: 'tomato_saaru', name: 'Tomato Saaru',               cat: 'curry', unit: 'cup', step: 1, cal: 70,  p: 3, c: 11, f: 2,   fiber: 2.5, liver: 'good', tags: ['veg'] },
  { id: 'pepper_saaru', name: 'Pepper Saaru (Menasina Saaru)', cat: 'curry', unit: 'cup', step: 1, cal: 65, p: 3, c: 10, f: 2, fiber: 2.5, liver: 'good', tags: ['veg'] },

  /* ---------------- PALYAS (VEGETABLE STIR-FRIES) ---------------- */
  { id: 'beetroot_palya',     name: 'Beetroot Palya',        cat: 'veg', unit: 'cup', step: 1, cal: 100, p: 2.5, c: 14, f: 4,   fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'carrot_palya',       name: 'Carrot Palya',          cat: 'veg', unit: 'cup', step: 1, cal: 95,  p: 2,   c: 13, f: 4,   fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'bittergourd_palya',  name: 'Bitter Gourd Palya (Hagalkayi)', cat: 'veg', unit: 'cup', step: 1, cal: 100, p: 3, c: 11, f: 6, fiber: 4.0, liver: 'good', tags: ['highfiber','liverstar'] },
  { id: 'beans_palya',        name: 'Beans Palya',           cat: 'veg', unit: 'cup', step: 1, cal: 90,  p: 3,   c: 10, f: 4,   fiber: 5.0, liver: 'good', tags: ['highfiber'] },
  { id: 'cabbage_palya',      name: 'Cabbage Palya',         cat: 'veg', unit: 'cup', step: 1, cal: 80,  p: 2.5, c: 9,  f: 4,   fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'capsicum_palya',     name: 'Capsicum Palya',        cat: 'veg', unit: 'cup', step: 1, cal: 90,  p: 2,   c: 10, f: 5,   fiber: 3.5, liver: 'good', tags: ['highfiber'] },
  { id: 'potato_palya',       name: 'Potato Palya (Aloo)',   cat: 'veg', unit: 'cup', step: 1, cal: 140, p: 3,   c: 24, f: 4,   fiber: 3.0, liver: 'neutral', tags: ['oil'] },
  { id: 'gobi_palya',         name: 'Cauliflower Palya',     cat: 'veg', unit: 'cup', step: 1, cal: 90,  p: 3,   c: 10, f: 4,   fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'snakegourd_palya',   name: 'Snake Gourd Palya',     cat: 'veg', unit: 'cup', step: 1, cal: 75,  p: 2,   c: 8,  f: 4,   fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'ridgegourd_palya',   name: 'Ridge Gourd Palya (Heerekayi)', cat: 'veg', unit: 'cup', step: 1, cal: 75, p: 2, c: 8, f: 4, fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'knolkhol_palya',     name: 'Knol Khol Palya',       cat: 'veg', unit: 'cup', step: 1, cal: 80,  p: 3,   c: 10, f: 3.5, fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'clusterbeans_palya', name: 'Cluster Beans Palya (Gorikai)', cat: 'veg', unit: 'cup', step: 1, cal: 100, p: 3.5, c: 12, f: 4, fiber: 6.0, liver: 'good', tags: ['highfiber'] },
  { id: 'brinjal_palya',      name: 'Brinjal Palya (Badanekayi)', cat: 'veg', unit: 'cup', step: 1, cal: 110, p: 2.5, c: 12, f: 6, fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'spinach_palya',      name: 'Palak Palya',           cat: 'veg', unit: 'cup', step: 1, cal: 80,  p: 4,   c: 8,  f: 4,   fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'tonde_palya',        name: 'Ivy Gourd Palya (Tonde Kayi)', cat: 'veg', unit: 'cup', step: 1, cal: 85, p: 2.5, c: 9, f: 4.5, fiber: 3.5, liver: 'good', tags: ['highfiber'] },
  { id: 'rawbanana_palya',    name: 'Raw Banana Palya',      cat: 'veg', unit: 'cup', step: 1, cal: 130, p: 2,   c: 24, f: 4,   fiber: 4.0, liver: 'neutral', tags: ['highfiber'] },
  { id: 'avarekai_palya',     name: 'Avarekai Palya (Field Beans)', cat: 'veg', unit: 'cup', step: 1, cal: 130, p: 7, c: 18, f: 4, fiber: 7.0, liver: 'good', tags: ['highprotein','highfiber'] },
  { id: 'chowchow_palya',     name: 'Chow Chow Palya',       cat: 'veg', unit: 'cup', step: 1, cal: 75,  p: 2,   c: 9,  f: 4,   fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'sweetcorn_palya',    name: 'Sweet Corn Palya',      cat: 'veg', unit: 'cup', step: 1, cal: 130, p: 4,   c: 22, f: 4,   fiber: 4.0, liver: 'neutral', tags: ['highfiber'] },
  { id: 'kumbalakayi_palya',  name: 'Ash Gourd Palya (Boodu Kumbalakayi)', cat: 'veg', unit: 'cup', step: 1, cal: 70, p: 2, c: 8, f: 4, fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'pumpkin_palya',      name: 'Pumpkin Palya (Sihi Kumbalakayi)', cat: 'veg', unit: 'cup', step: 1, cal: 90, p: 2, c: 14, f: 4, fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'sorekayi_palya',     name: 'Bottle Gourd Palya (Sorekayi)', cat: 'veg', unit: 'cup', step: 1, cal: 70, p: 1.5, c: 8, f: 4, fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'okra_palya',         name: 'Okra Palya (Bende)',    cat: 'veg', unit: 'cup', step: 1, cal: 100, p: 2.5, c: 10, f: 5, fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'radish_palya',       name: 'Radish Palya (Mullangi)', cat: 'veg', unit: 'cup', step: 1, cal: 70, p: 2, c: 8, f: 4, fiber: 3.0, liver: 'good', tags: ['highfiber'] },
  { id: 'yam_palya',          name: 'Yam Palya (Suvarnagadde)', cat: 'veg', unit: 'cup', step: 1, cal: 140, p: 2.5, c: 24, f: 4, fiber: 4.0, liver: 'neutral', tags: ['highfiber'] },
  { id: 'sweetpotato_palya',  name: 'Sweet Potato Palya (Genasu)', cat: 'veg', unit: 'cup', step: 1, cal: 140, p: 2, c: 26, f: 4, fiber: 4.0, liver: 'neutral', tags: ['highfiber'] },
  { id: 'colocasia_palya',    name: 'Colocasia Palya (Kesuvina Gadde)', cat: 'veg', unit: 'cup', step: 1, cal: 130, p: 2, c: 24, f: 4, fiber: 3.0, liver: 'neutral', tags: ['highfiber'] },
  { id: 'methi_palya',        name: 'Methi Greens Palya (Menthya Soppu)', cat: 'veg', unit: 'cup', step: 1, cal: 80, p: 4, c: 7, f: 4, fiber: 4.0, liver: 'good', tags: ['highfiber','liverstar'] },
  { id: 'dantu_palya',        name: 'Amaranth Greens Palya (Dantina Soppu)', cat: 'veg', unit: 'cup', step: 1, cal: 75, p: 4, c: 7, f: 4, fiber: 4.0, liver: 'good', tags: ['highfiber'] },
  { id: 'sprouts_palya',      name: 'Sprouts Palya (Usli)',  cat: 'veg', unit: 'cup', step: 1, cal: 130, p: 8, c: 16, f: 3, fiber: 6.0, liver: 'good', tags: ['highprotein','highfiber'] },
  { id: 'greenpeas_palya',    name: 'Green Peas Palya (Batani)', cat: 'veg', unit: 'cup', step: 1, cal: 130, p: 6, c: 18, f: 4, fiber: 6.0, liver: 'good', tags: ['highprotein','highfiber'] },
  { id: 'mixedveg_palya',     name: 'Mixed Veg Palya',       cat: 'veg', unit: 'cup', step: 1, cal: 95, p: 3, c: 12, f: 4, fiber: 4.0, liver: 'good', tags: ['highfiber'] },

  /* ---------------- KANNADA SWEETS / SAVOURY SNACKS ---------------- */
  { id: 'chakli',       name: 'Chakli',             cat: 'snack', unit: 'piece', step: 1, cal: 90,  p: 1.5, c: 10, f: 5,  fiber: 0.8, liver: 'bad', tags: ['fried'] },
  { id: 'kodubale',     name: 'Kodubale',           cat: 'snack', unit: 'piece', step: 1, cal: 95,  p: 1.5, c: 11, f: 5,  fiber: 0.8, liver: 'bad', tags: ['fried'] },
  { id: 'nippattu',     name: 'Nippattu',           cat: 'snack', unit: 'piece', step: 1, cal: 80,  p: 1.5, c: 9,  f: 4.5,fiber: 0.6, liver: 'bad', tags: ['fried'] },
  { id: 'khara_boondi', name: 'Khara Boondi',       cat: 'snack', unit: '30 g',  step: 1, cal: 160, p: 4,   c: 14, f: 10, fiber: 1.0, liver: 'bad', tags: ['fried'] },

  /* ---------------- TREATS / NEGATIVE FOODS ---------------- */
  { id: 'mysore_pak',  name: 'Mysore Pak',      cat: 'treat', unit: 'piece', step: 1, cal: 180, p: 2, c: 20, f: 11, fiber: 0, liver: 'bad', tags: ['sugary','ghee','treat'] },
  { id: 'holige',      name: 'Holige (Obbattu)', cat: 'treat', unit: 'piece', step: 1, cal: 200, p: 4, c: 38, f: 4,  fiber: 1.5, liver: 'bad', tags: ['sugary','treat'] },
  { id: 'chiroti',     name: 'Chiroti',         cat: 'treat', unit: 'piece', step: 1, cal: 150, p: 2, c: 20, f: 7,  fiber: 0.5, liver: 'bad', tags: ['sugary','fried','treat'] },
  { id: 'ice_cream',   name: 'Ice Cream',       cat: 'treat', unit: 'scoop', step: 1, cal: 207, p: 3.5, c: 24, f: 11, fiber: 0.7, liver: 'bad', tags: ['sugary','treat'] },
  { id: 'soft_drink',  name: 'Soft Drink',      cat: 'treat', unit: 'can',   step: 1, cal: 140, p: 0,   c: 39, f: 0,  fiber: 0,   liver: 'bad', tags: ['sugary','treat','soda'] },
  { id: 'cake',        name: 'Cake / Pastry',   cat: 'treat', unit: 'slice', step: 1, cal: 350, p: 4,   c: 50, f: 15, fiber: 1,   liver: 'bad', tags: ['sugary','bakery','treat'] },
  { id: 'samosa',      name: 'Samosa',          cat: 'treat', unit: 'piece', step: 1, cal: 260, p: 4,   c: 30, f: 14, fiber: 2,   liver: 'bad', tags: ['fried','bakery','treat'] },
  { id: 'biscuit',     name: 'Biscuits',        cat: 'treat', unit: '3 pcs', step: 1, cal: 150, p: 2,   c: 22, f: 6,  fiber: 0.5, liver: 'bad', tags: ['sugary','bakery'] },
  { id: 'fried_snack', name: 'Fried Snack',     cat: 'treat', unit: 'cup',   step: 1, cal: 300, p: 5,   c: 30, f: 18, fiber: 1.5, liver: 'bad', tags: ['fried','treat'] },
  { id: 'gulab_jamun', name: 'Gulab Jamun',     cat: 'treat', unit: 'piece', step: 1, cal: 150, p: 2,   c: 22, f: 6,  fiber: 0,   liver: 'bad', tags: ['sugary','treat'] },
  { id: 'sweets',      name: 'Indian Sweets',   cat: 'treat', unit: 'piece', step: 1, cal: 180, p: 3,   c: 28, f: 7,  fiber: 0,   liver: 'bad', tags: ['sugary','treat'] },

  /* ---------------- COOKING FATS (tracked) ---------------- */
  { id: 'ghee',        name: 'Ghee',            cat: 'fat', unit: 'tsp',  step: 1, cal: 45,  p: 0, c: 0, f: 5, fiber: 0, liver: 'neutral', tags: ['ghee','fat'] },
  { id: 'groundnut_oil',name:'Groundnut Oil',   cat: 'fat', unit: 'tsp',  step: 1, cal: 40,  p: 0, c: 0, f: 4.5, fiber: 0, liver: 'neutral', tags: ['oil','fat'] },
  { id: 'olive_oil',   name: 'Olive Oil',       cat: 'fat', unit: 'tsp',  step: 1, cal: 40,  p: 0, c: 0, f: 4.5, fiber: 0, liver: 'good', tags: ['oil','fat'] },
];

/* Quick lookup map */
const FOOD_MAP = FOOD_DB.reduce((m, f) => { m[f.id] = f; return m; }, {});

/* Day -> diet type rules (per user personalization) */
const DAY_DIET = {
  Monday:    'veg',
  Tuesday:   'nonveg',
  Wednesday: 'nonveg',
  Thursday:  'nonveg',
  Friday:    'veg',
  Saturday:  'veg',
  Sunday:    'nonveg',
};

/* ---------------------------------------------------------------------
   Serving weights (grams) for units that aren't already gram-based.
   Lets the UI show e.g. "1 cup ≈ 90 g". Units that embed a number
   (e.g. "100 g cooked", "30 g", "glass (250ml)") are parsed directly.
--------------------------------------------------------------------- */
const SERVING_GRAMS = {
  // breakfast
  idli: 35, mini_idli: 15, dosa: 80, masala_dosa: 150, set_dosa: 60, rava_dosa: 90, neer_dosa: 40,
  poha: 180, upma: 180, pongal: 200, chapati_bf: 45, idiyappam: 50, appam: 60, uttapam: 120,
  paratha: 70, methi_thepla: 60, ragi_dosa: 80, moong_chilla: 80, sambar: 200, coconut_chut: 15,
  // protein
  egg: 50, egg_white: 33, boiled_egg: 50, dal: 200, chana: 165, rajma: 175, curd_skip: 200,
  // carbs
  chapati: 45, phulka: 35, white_bread: 30, brown_bread: 30,
  // vegetables (cooked/standard cup)
  broccoli: 90, green_peas: 145, spinach: 30, beans: 125, carrot: 128, capsicum: 150, mushroom: 70,
  mixed_veg: 150, cauliflower: 100, cabbage: 90, bottle_gourd: 116, okra: 100, tomato: 180,
  cucumber: 120, beetroot: 136, lauki_sabzi: 150,
  // fruits
  banana: 118, apple: 182, orange: 130, papaya: 145, guava: 55, pomegranate: 174, berries: 145,
  watermelon: 152, mango: 165, grapes: 151, pineapple: 165, pear: 178, kiwi: 75, muskmelon: 160,
  strawberry: 152, chikoo: 90, custard_apple: 160, plum: 66, peach: 150, litchi: 190, dragon_fruit: 200, sweet_lime: 100,
  // snacks / seeds
  flaxseed: 10, chia: 12, sesame_seed: 9, makhana: 30, sprouts: 100, dates: 8, dried_figs: 20, prunes: 10,
  // drinks (ml)
  black_coffee: 240, coffee: 240, green_tea: 240, tea: 240, buttermilk: 240, lemon_water: 240, coconut_water: 240, protein_shake: 250,
  // curries (per cup/katori)
  veg_curry: 200, mixed_veg_curry: 200, veg_korma: 200, paneer_bm: 200, palak_paneer: 200, kadai_paneer: 200,
  matar_paneer: 200, chole: 200, rajma_curry: 200, dal_tadka: 200, dal_makhani: 200, aloo_gobi: 180,
  bhindi_masala: 150, baingan_bharta: 180, mushroom_masala: 180, sambar_curry: 200, kofta_curry: 200,
  soya_curry: 200, chk_curry_c: 200, butter_chicken: 200, chk_tikka_masala: 200, egg_curry: 200,
  fish_curry: 200, mutton_curry: 200, prawn_curry: 200,
  // treats
  ice_cream: 65, soft_drink: 330, cake: 80, samosa: 100, biscuit: 24, fried_snack: 40, gulab_jamun: 40, sweets: 40,
  // cooking fats
  ghee: 5, groundnut_oil: 5, olive_oil: 5,
  // rice & one-pot (cup ≈ 200 g)
  lemon_rice: 200, puliogare: 200, bisibele: 200, vangi_bath: 200, tomato_rice: 200,
  coconut_rice: 200, curd_rice: 200, ghee_rice: 200, veg_pulao: 200, shavige: 180,
  chicken_biryani: 220, egg_rice: 200,
  // kannada tiffin
  rava_idli: 40, thatte_idli: 60, khara_bath: 200, kesari_bath: 150, benne_dosa: 80,
  mysore_dosa: 160, medu_vada: 40, maddur_vada: 35, goli_baje: 25, sabudana_khichdi: 200,
  // rottis / millet breads
  ragi_rotti: 80, akki_rotti: 90, jolada_rotti: 60, ragi_mudde: 120, bajra_roti: 60, jowar_upma: 180,
  // south veg curries / sides
  rasam: 200, avial: 150, kootu: 180, gojju: 100, huli: 200, majjige_huli: 200, palya: 120, kosambari: 100,
  // south non-veg
  chicken_ghee_roast: 180, chicken_sukka: 180, chicken_chettinad: 180, mutton_sukka: 180,
  prawn_sukka: 150, fish_fry: 100, egg_bhurji: 120,
  // kannada snacks / sweets
  chakli: 25, kodubale: 25, nippattu: 25, mysore_pak: 30, holige: 60, chiroti: 40,
  // shavige & saarus (cup)
  shavige_upittu: 180, shavige_chitranna: 180,
  bele_saaru: 200, soppu_saaru: 200, bassaru: 200, tomato_saaru: 200, pepper_saaru: 200,
  // palyas (cup ≈ 120 g)
  beetroot_palya: 120, carrot_palya: 120, bittergourd_palya: 120, beans_palya: 120, cabbage_palya: 120,
  capsicum_palya: 120, potato_palya: 130, gobi_palya: 120, snakegourd_palya: 120, ridgegourd_palya: 120,
  knolkhol_palya: 120, clusterbeans_palya: 120, brinjal_palya: 120, spinach_palya: 120, tonde_palya: 120,
  rawbanana_palya: 130, avarekai_palya: 130, chowchow_palya: 120, sweetcorn_palya: 130,
  kumbalakayi_palya: 120, pumpkin_palya: 120, sorekayi_palya: 120, okra_palya: 120, radish_palya: 120,
  yam_palya: 130, sweetpotato_palya: 130, colocasia_palya: 130, methi_palya: 120, dantu_palya: 120,
  sprouts_palya: 130, greenpeas_palya: 130, mixedveg_palya: 120,
};

/* grams (or ml) in one serving unit of a food, or null if unknown */
function unitGrams(f) {
  const m = f.unit.match(/(\d+)\s*(?:g|ml)/);     // "100 g cooked", "30 g", "glass (250ml)"
  if (m) return +m[1];
  return SERVING_GRAMS[f.id] || null;
}
function unitIsLiquid(f) { return f.cat === 'drink' || /ml/.test(f.unit); }

/* Helpers exposed globally */
function getFood(id) { return FOOD_MAP[id]; }
function foodsByCat(cat) { return FOOD_DB.filter(f => f.cat === cat); }

/* Default breakfast options shown as cards */
const BREAKFAST_OPTIONS = ['idli','rava_idli','thatte_idli','dosa','set_dosa','rava_dosa','neer_dosa','benne_dosa','mysore_dosa','ragi_dosa','poha','upma','shavige_upittu','shavige_chitranna','khara_bath','kesari_bath','pongal','medu_vada','maddur_vada','goli_baje','sabudana_khichdi','ragi_rotti','akki_rotti','chapati_bf','brown_bread','oats'];
const LUNCH_PROTEIN   = ['chicken_br','paneer'];
const LUNCH_CARB      = ['rice','brown_rice','chapati','ragi_rotti','akki_rotti','jolada_rotti','ragi_mudde','bajra_roti','jowar_upma'];
const RICE_OPTIONS    = ['lemon_rice','puliogare','bisibele','vangi_bath','tomato_rice','coconut_rice','curd_rice','ghee_rice','veg_pulao','shavige','shavige_upittu','shavige_chitranna','chicken_biryani','egg_rice'];
const VEG_OPTIONS     = ['broccoli','green_peas','spinach','beans','carrot','capsicum','mushroom','mixed_veg','palya','kosambari','beetroot_palya','carrot_palya','bittergourd_palya','beans_palya','cabbage_palya','capsicum_palya','potato_palya','gobi_palya','snakegourd_palya','ridgegourd_palya','knolkhol_palya','clusterbeans_palya','brinjal_palya','spinach_palya','tonde_palya','rawbanana_palya','avarekai_palya','chowchow_palya','sweetcorn_palya','kumbalakayi_palya','pumpkin_palya','sorekayi_palya','okra_palya','radish_palya','yam_palya','sweetpotato_palya','colocasia_palya','methi_palya','dantu_palya','sprouts_palya','greenpeas_palya','mixedveg_palya'];
const PROTEIN_VEG     = ['milk','whey','paneer'];
const PROTEIN_NONVEG  = ['boiled_egg','chicken_br','egg_bhurji','milk','whey'];

/* Curries — split by diet so veg days only show veg curries */
const CURRY_VEG = ['veg_curry','mixed_veg_curry','veg_korma','paneer_bm','palak_paneer','kadai_paneer','matar_paneer','chole','rajma_curry','dal_tadka','dal_makhani','aloo_gobi','bhindi_masala','baingan_bharta','mushroom_masala','sambar_curry','kofta_curry','soya_curry','rasam','avial','kootu','gojju','huli','majjige_huli','bele_saaru','soppu_saaru','bassaru','tomato_saaru','pepper_saaru'];
const CURRY_NONVEG = ['chk_curry_c','butter_chicken','chk_tikka_masala','chicken_ghee_roast','chicken_sukka','chicken_chettinad','egg_curry','fish_curry','mutton_curry','mutton_sukka','prawn_curry','prawn_sukka'];

/* Snack builder groups */
const SNACK_FRUITS = ['banana','apple','orange','papaya','guava','pomegranate','berries','watermelon','grapes','pineapple','pear','kiwi','muskmelon','strawberry','mango','chikoo','custard_apple','plum','peach','litchi','dragon_fruit','sweet_lime'];
const SNACK_NUTS   = ['walnuts','almonds','cashews','pistachios','peanuts','hazelnuts','brazil_nuts','pecans','mixed_nuts','pumpkin_seed','sunflower_seed','flaxseed','chia','sesame_seed','raisins','dates','dried_figs','dried_apricot','prunes','dried_cranberry'];
const SNACK_DRINKS = ['black_coffee','coffee','green_tea','tea','buttermilk','lemon_water','coconut_water'];
const SNACK_OTHER  = ['milk','whey','protein_shake','makhana','sprouts','roasted_chana','dark_choc','chakli','kodubale','nippattu','khara_boondi'];
/* kept for backward compatibility */
const SNACK_OPTIONS = SNACK_FRUITS.concat(SNACK_NUTS, SNACK_DRINKS, SNACK_OTHER);

/* expose for non-module usage */
if (typeof window !== 'undefined') {
  window.FOOD_DB = FOOD_DB;
  window.FOOD_MAP = FOOD_MAP;
  window.DAY_DIET = DAY_DIET;
  window.getFood = getFood;
  window.foodsByCat = foodsByCat;
  window.SERVING_GRAMS = SERVING_GRAMS;
  window.unitGrams = unitGrams;
  window.unitIsLiquid = unitIsLiquid;
  window.BREAKFAST_OPTIONS = BREAKFAST_OPTIONS;
  window.LUNCH_PROTEIN = LUNCH_PROTEIN;
  window.LUNCH_CARB = LUNCH_CARB;
  window.VEG_OPTIONS = VEG_OPTIONS;
  window.SNACK_OPTIONS = SNACK_OPTIONS;
  window.PROTEIN_VEG = PROTEIN_VEG;
  window.PROTEIN_NONVEG = PROTEIN_NONVEG;
  window.CURRY_VEG = CURRY_VEG;
  window.CURRY_NONVEG = CURRY_NONVEG;
  window.RICE_OPTIONS = RICE_OPTIONS;
  window.SNACK_FRUITS = SNACK_FRUITS;
  window.SNACK_NUTS = SNACK_NUTS;
  window.SNACK_DRINKS = SNACK_DRINKS;
  window.SNACK_OTHER = SNACK_OTHER;
}
