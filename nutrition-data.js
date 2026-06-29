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

  /* ---------------- TREATS / NEGATIVE FOODS ---------------- */
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

/* Helpers exposed globally */
function getFood(id) { return FOOD_MAP[id]; }
function foodsByCat(cat) { return FOOD_DB.filter(f => f.cat === cat); }

/* Default breakfast options shown as cards */
const BREAKFAST_OPTIONS = ['idli','dosa','set_dosa','rava_dosa','neer_dosa','poha','upma','pongal','chapati_bf','brown_bread','oats','ragi_dosa'];
const LUNCH_PROTEIN   = ['chicken_br','paneer'];
const LUNCH_CARB      = ['rice','brown_rice','chapati'];
const VEG_OPTIONS     = ['broccoli','green_peas','spinach','beans','carrot','capsicum','mushroom','mixed_veg'];
const PROTEIN_VEG     = ['milk','whey','paneer'];
const PROTEIN_NONVEG  = ['boiled_egg','chicken_br','milk','whey'];

/* Curries — split by diet so veg days only show veg curries */
const CURRY_VEG = ['veg_curry','mixed_veg_curry','veg_korma','paneer_bm','palak_paneer','kadai_paneer','matar_paneer','chole','rajma_curry','dal_tadka','dal_makhani','aloo_gobi','bhindi_masala','baingan_bharta','mushroom_masala','sambar_curry','kofta_curry','soya_curry'];
const CURRY_NONVEG = ['chk_curry_c','butter_chicken','chk_tikka_masala','egg_curry','fish_curry','mutton_curry','prawn_curry'];

/* Snack builder groups */
const SNACK_FRUITS = ['banana','apple','orange','papaya','guava','pomegranate','berries','watermelon','grapes','pineapple','pear','kiwi','muskmelon','strawberry','mango','chikoo','custard_apple','plum','peach','litchi','dragon_fruit','sweet_lime'];
const SNACK_NUTS   = ['walnuts','almonds','cashews','pistachios','peanuts','hazelnuts','brazil_nuts','pecans','mixed_nuts','pumpkin_seed','sunflower_seed','flaxseed','chia','sesame_seed','raisins','dates','dried_figs','dried_apricot','prunes','dried_cranberry'];
const SNACK_DRINKS = ['black_coffee','coffee','green_tea','tea','buttermilk','lemon_water','coconut_water'];
const SNACK_OTHER  = ['milk','whey','protein_shake','makhana','sprouts','roasted_chana','dark_choc'];
/* kept for backward compatibility */
const SNACK_OPTIONS = SNACK_FRUITS.concat(SNACK_NUTS, SNACK_DRINKS, SNACK_OTHER);

/* expose for non-module usage */
if (typeof window !== 'undefined') {
  window.FOOD_DB = FOOD_DB;
  window.FOOD_MAP = FOOD_MAP;
  window.DAY_DIET = DAY_DIET;
  window.getFood = getFood;
  window.foodsByCat = foodsByCat;
  window.BREAKFAST_OPTIONS = BREAKFAST_OPTIONS;
  window.LUNCH_PROTEIN = LUNCH_PROTEIN;
  window.LUNCH_CARB = LUNCH_CARB;
  window.VEG_OPTIONS = VEG_OPTIONS;
  window.SNACK_OPTIONS = SNACK_OPTIONS;
  window.PROTEIN_VEG = PROTEIN_VEG;
  window.PROTEIN_NONVEG = PROTEIN_NONVEG;
  window.CURRY_VEG = CURRY_VEG;
  window.CURRY_NONVEG = CURRY_NONVEG;
  window.SNACK_FRUITS = SNACK_FRUITS;
  window.SNACK_NUTS = SNACK_NUTS;
  window.SNACK_DRINKS = SNACK_DRINKS;
  window.SNACK_OTHER = SNACK_OTHER;
}
