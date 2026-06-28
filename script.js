/**
 * Fatty Liver Nutrition Tracker Pro v2.0
 * Architecture: Clean Vanilla JS Lifecycle Management
 */

// 1. Structural Targets & Profiles
const targets = { calories: 2000, protein: 140, carbs: 170, fat: 55, fiber: 35, water: 3500 };

const defaultState = {
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
  liverScore: 100,
  loggedActivities: [],
  loggedFoods: []
};

let appState = JSON.parse(localStorage.getItem('liver_tracker_state')) || { ...defaultState };

// 2. Specialized Database Matrix
const foodDatabase = {
  breakfast: [
    { id: 'idli', name: 'Idli (per piece)', calories: 60, protein: 2, carbs: 13, fat: 0.2, fiber: 1.0, tags: ['veg'] },
    { id: 'dosa', name: 'Plain Dosa (1 medium)', calories: 135, protein: 3, carbs: 22, fat: 3.5, fiber: 1.2, tags: ['veg'] },
    { id: 'set_dosa', name: 'Set Dosa (1 serving of 3)', calories: 360, protein: 7.5, carbs: 58, fat: 9, fiber: 3.2, tags: ['veg'] },
    { id: 'rava_dosa', name: 'Rava Dosa (1 medium)', calories: 180, protein: 4, carbs: 25, fat: 7, fiber: 2.0, tags: ['veg'] },
    { id: 'poha', name: 'Poha (1 medium bowl)', calories: 180, protein: 3.5, carbs: 35, fat: 2.5, fiber: 2.0, tags: ['veg'] },
    { id: 'upma', name: 'Upma (1 medium bowl)', calories: 210, protein: 5.0, carbs: 38, fat: 4, fiber: 2.8, tags: ['veg'] },
    { id: 'oats', name: 'Oats with Milk', calories: 260, protein: 12, carbs: 42, fat: 4.5, fiber: 6.0, tags: ['veg', 'superfood'] },
    { id: 'brown_bread', name: 'Brown Bread (2 slices)', calories: 150, protein: 6, carbs: 28, fat: 1.6, fiber: 4.0, tags: ['veg'] },
    { id: 'egg_white', name: 'Egg White (1 large)', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0, tags: ['non-veg'] },
    { id: 'whole_egg', name: 'Whole Boiled Egg', calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, tags: ['non-veg'] },
    { id: 'whey', name: 'Whey Protein (1 scoop)', calories: 110, protein: 25, carbs: 1, fat: 0.5, fiber: 0, tags: ['veg', 'superfood'] }
  ],
  lunch: [
    { id: 'chicken_150', name: 'Chicken Breast (150g)', calories: 247, protein: 46, carbs: 0, fat: 5.4, fiber: 0, tags: ['non-veg'] },
    { id: 'paneer_100', name: 'Low-Fat Paneer (100g)', calories: 180, protein: 18, carbs: 2, fat: 10, fiber: 0, tags: ['veg'] },
    { id: 'rice_150', name: 'Cooked Rice (150g)', calories: 195, protein: 4, carbs: 42, fat: 0.4, fiber: 0.6, tags: ['veg'] },
    { id: 'chapati', name: 'Chapati (1 piece)', calories: 85, protein: 3, carbs: 18, fat: 0.5, fiber: 2.5, tags: ['veg'] },
    { id: 'broccoli', name: 'Steamed Broccoli (100g)', calories: 35, protein: 2.4, carbs: 7, fat: 0.4, fiber: 3.3, tags: ['veg', 'superfood'] },
    { id: 'peas', name: 'Green Peas (100g)', calories: 80, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1, tags: ['veg', 'superfood'] }
  ],
  dinner: [
    { id: 'chicken_200', name: 'Chicken Breast (200g)', calories: 330, protein: 62, carbs: 0, fat: 7.2, fiber: 0, tags: ['non-veg'] },
    { id: 'paneer_150', name: 'Low-Fat Paneer (150g)', calories: 270, protein: 27, carbs: 3, fat: 15, fiber: 0, tags: ['veg'] },
    { id: 'rice_100', name: 'Cooked Rice (100g)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, tags: ['veg'] },
    { id: 'chapati', name: 'Chapati (1 piece)', calories: 85, protein: 3, carbs: 18, fat: 0.5, fiber: 2.5, tags: ['veg'] },
    { id: 'broccoli_din', name: 'Steamed Broccoli (100g)', calories: 35, protein: 2.4, carbs: 7, fat: 0.4, fiber: 3.3, tags: ['veg', 'superfood'] }
  ],
  snacks: [
    { id: 'banana', name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3, fiber: 3.0, tags: ['veg'] },
    { id: 'apple', name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, tags: ['veg', 'superfood'] },
    { id: 'walnuts', name: 'Walnuts (28g)', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, fiber: 1.9, tags: ['veg', 'superfood'] },
    { id: 'flaxseed', name: 'Ground Flaxseed (1 tbsp)', calories: 37, protein: 1.3, carbs: 2, fat: 3, fiber: 1.9, tags: ['veg', 'superfood'] }
  ]
};

// 3. Smart Recalculation Engine
function processNutritionCalculations() {
  const remCarbs = targets.carbs - appState.carbs;
  const remProtein = targets.protein - appState.protein;
  const noteBox = document.getElementById('engineNotification');
  
  const todayIndex = new Date().getDay();
  const isVegDay = [1, 5, 6].includes(todayIndex);

  if (appState.calories === 0) {
    noteBox.textContent = isVegDay 
      ? "Today is a Vegetarian Protocol day. Maximize protein via Whey isolate and low-fat paneer starting from breakfast."
      : "Non-Vegetarian day active. Focus on egg whites and clean chicken portions to manage fat while hitting your muscle target.";
    return;
  }

  if (remCarbs < 35 && remProtein > 30) {
    noteBox.textContent = "⚠️ Carb limits reaching capacity. Smart Engine action: Dropping rice suggestions from subsequent meals. Focus fully on high-protein bases and clean fiber.";
  } else if (remProtein <= 15) {
    noteBox.textContent = "✅ Premium protein targets achieved for muscle maintenance. Subsequent meals can be adjusted to light configurations.";
  } else {
    noteBox.textContent = `Target Balance: You require ${Math.max(0, Math.round(remProtein))}g more protein. Prioritizing lean structural allocations.`;
  }
}

// 4. Liver Score Core Logic
function evaluateLiverScore() {
  let initial = 100;
  
  appState.loggedActivities.forEach(act => {
    if (act === 'gym' || act === 'football' || act === 'water') initial += 10;
    if (act === 'sugar') initial -= 15;
  });

  if (appState.fiber < 15 && appState.calories > 500) initial -= 10;
  
  appState.liverScore = Math.min(100, Math.max(0, initial));
}

// 5. App Core Controllers
function populateFoodDropdown() {
  const period = document.getElementById('mealPeriod').value;
  const selectEl = document.getElementById('foodSelect');
  selectEl.innerHTML = '';

  const todayIndex = new Date().getDay();
  const isVegDay = [1, 5, 6].includes(todayIndex);

  foodDatabase[period].forEach(food => {
    if (isVegDay && food.tags.includes('non-veg')) return; // Filter options on Veg days
    const opt = document.createElement('option');
    opt.value = food.id;
    opt.textContent = food.name;
    selectEl.appendChild(opt);
  });
}

function handleLogFood() {
  const period = document.getElementById('mealPeriod').value;
  const foodId = document.getElementById('foodSelect').value;
  const qty = parseInt(document.getElementById('foodQty').value) || 1;
  
  if (!foodId) return;

  const matchItem = foodDatabase[period].find(f => f.id === foodId);
  
  appState.calories += (matchItem.calories * qty);
  appState.protein += (matchItem.protein * qty);
  appState.carbs += (matchItem.carbs * qty);
  appState.fat += (matchItem.fat * qty);
  appState.fiber += (matchItem.fiber * qty);
  
  localStorage.setItem('liver_tracker_state', JSON.stringify(appState));
  
  triggerToast(`Added ${qty}x ${matchItem.name}`);
  document.getElementById('foodQty').value = 1; // Reset stepper
  renderDashboard();
}

function handleLogActivity(activityType) {
  appState.loggedActivities.push(activityType);
  evaluateLiverScore();
  localStorage.setItem('liver_tracker_state', JSON.stringify(appState));
  triggerToast(`Logged Habit: ${activityType.toUpperCase()}`);
  renderDashboard();
}

// 6. UI Render Layer
function renderDashboard() {
  const categories = ['calories', 'protein', 'carbs', 'fat', 'fiber'];
  
  categories.forEach(cat => {
    const valueEl = document.getElementById(`${cat}Value`);
    const fillEl = document.getElementById(`${cat}Fill`);
    
    const current = Math.round(appState[cat]);
    const target = targets[cat];
    const unit = cat === 'calories' ? '' : 'g';
    
    valueEl.textContent = `${current} / ${target}${unit}`;
    const pct = Math.min((current / target) * 100, 100);
    fillEl.style.width = `${pct}%`;
    
    if (current > target && cat !== 'protein' && cat !== 'fiber') {
      fillEl.style.background = 'var(--red)';
    } else {
      fillEl.style.background = 'var(--primary-color)';
    }
  });

  // Circle Update
  document.getElementById('liverScoreValue').textContent = appState.liverScore;
  const circle = document.querySelector('.progress-ring__circle');
  const dashoffset = 364.4 - (appState.liverScore / 100) * 364.4;
  circle.style.strokeDashoffset = dashoffset;

  if (appState.liverScore >= 85) circle.style.stroke = 'var(--green)';
  else if (appState.liverScore >= 65) circle.style.stroke = 'var(--yellow)';
  else circle.style.stroke = 'var(--red)';

  processNutritionCalculations();
}

function triggerToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

// 7. Initial Binding
function bindAppLifecycle() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIdx = new Date().getDay();
  document.getElementById('currentDay').textContent = days[todayIdx];
  
  const isVegDay = [1, 5, 6].includes(todayIdx);
  document.getElementById('dietType').textContent = isVegDay ? "Vegetarian Protocol" : "Non-Vegetarian Day";

  // Event Listeners
  document.getElementById('mealPeriod').addEventListener('change', populateFoodDropdown);
  document.getElementById('logFoodBtn').addEventListener('click', handleLogFood);
  
  document.querySelectorAll('.btn-activity').forEach(btn => {
    btn.addEventListener('click', (e) => {
      handleLogActivity(e.currentTarget.getAttribute('data-activity'));
    });
  });

  // Stepper Controller Setup
  document.getElementById('stepUp').addEventListener('click', () => {
    const input = document.getElementById('foodQty');
    if (input.value < 10) input.value = parseInt(input.value) + 1;
  });
  document.getElementById('stepDown').addEventListener('click', () => {
    const input = document.getElementById('foodQty');
    if (input.value > 1) input.value = parseInt(input.value) - 1;
  });

  // Init Data Display
  populateFoodDropdown();
  evaluateLiverScore();
  renderDashboard();
}

window.addEventListener('DOMContentLoaded', bindAppLifecycle);