/**
 * Fatty Liver Nutrition Tracker Pro v2.0
 */

// --- STATE MANAGEMENT & STORAGE ---
const defaultUser = {
  profile: { age: 28, weight: 69, gender: 'male' },
  targets: { calories: 2000, protein: 140, carbs: 170, fat: 55, fiber: 35 },
  current: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, liverScore: 100 },
  history: []
};

let appState = JSON.parse(localStorage.getItem('fattyLiverState')) || defaultUser;

function saveState() {
  localStorage.setItem('fattyLiverState', JSON.stringify(appState));
  updateUI();
}

// --- EXPANDED FOOD DATABASE ---
const foodDB = {
  idli: { name: 'Idli', macros: { calories: 60, protein: 2, carbs: 13, fat: 0.2, fiber: 1 } },
  dosa: { name: 'Plain Dosa', macros: { calories: 130, protein: 3, carbs: 20, fat: 4, fiber: 1.5 } },
  set_dosa: { name: 'Set Dosa', macros: { calories: 250, protein: 5, carbs: 40, fat: 8, fiber: 3 } },
  rava_dosa: { name: 'Rava Dosa', macros: { calories: 180, protein: 4, carbs: 25, fat: 7, fiber: 2 } },
  poha: { name: 'Poha', macros: { calories: 220, protein: 4, carbs: 40, fat: 5, fiber: 2 } },
  upma: { name: 'Upma', macros: { calories: 200, protein: 5, carbs: 30, fat: 6, fiber: 2.5 } },
  oats: { name: 'Oats', macros: { calories: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4 } },
  brown_bread: { name: 'Brown Bread', macros: { calories: 140, protein: 6, carbs: 26, fat: 1.5, fiber: 4 } },
  eggs: { name: 'Boiled Egg', macros: { calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0 } },
  whey: { name: 'Whey Protein', macros: { calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 } },
  broccoli: { name: 'Broccoli', macros: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6 } }
};

// --- LOGIC: MEAL & ACTIVITY ENGINE ---
function logBreakfast() {
  const foodKey = document.getElementById('breakfastSelect').value;
  const qty = parseFloat(document.getElementById('breakfastQty').value) || 1;
  const food = foodDB[foodKey];
  
  appState.current.calories += (food.macros.calories * qty);
  appState.current.protein += (food.macros.protein * qty);
  appState.current.carbs += (food.macros.carbs * qty);
  appState.current.fat += (food.macros.fat * qty);
  appState.current.fiber += (food.macros.fiber * qty);
  
  analyzeMealsAndRecommend();
  saveState();
  showToast(`Logged ${qty}x ${food.name}`);
}

function processActivity(type) {
  const scores = { 'gym': 10, 'football': 10, 'water': 10, 'sugar': -15 };
  
  if (scores[type]) {
    appState.current.liverScore += scores[type];
    if(appState.current.liverScore > 100) appState.current.liverScore = 100;
    if(appState.current.liverScore < 0) appState.current.liverScore = 0;
    
    saveState();
    
    const message = type === 'sugar' ? 'Liver Score Decreased (-15)' : `Activity Logged! (+10)`;
    showToast(message);
  }
}

// --- SMART NUTRITION ENGINE ---
function analyzeMealsAndRecommend() {
  const remCalories = appState.targets.calories - appState.current.calories;
  const remProtein = appState.targets.protein - appState.current.protein;
  const remCarbs = appState.targets.carbs - appState.current.carbs;
  
  const notificationBox = document.getElementById('engineNotification');
  
  if (remCarbs < 30 && remProtein > 40) {
    notificationBox.textContent = "Carbs are running low! Skip rice at lunch/dinner. Focus purely on Chicken/Paneer and green vegetables.";
  } else if (remProtein <= 10) {
    notificationBox.textContent = "Excellent protein intake today! Dinner can be lighter. Focus on fiber (Broccoli/Peas).";
  } else if (appState.current.calories > 0) {
    notificationBox.textContent = `You need ${Math.max(0, Math.round(remProtein))}g more protein today. Automatically prioritizing protein for your next meal.`;
  } else {
    notificationBox.textContent = "Good morning! Stick to eggs or whey with your breakfast to hit your 140g protein target efficiently.";
  }
}

// --- UI HELPERS ---
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

function updateUI() {
  const macros = ['calories', 'protein', 'carbs', 'fat'];
  
  macros.forEach(macro => {
    const current = Math.round(appState.current[macro]);
    const target = appState.targets[macro];
    const percentage = Math.min((current / target) * 100, 100);
    
    const unit = macro === 'calories' ? '' : 'g';
    const elementId = macro === 'calories' ? 'calValue' : `${macro}Value`;
    document.getElementById(elementId).textContent = `${current} / ${target}${unit}`;
    
    const fillId = macro === 'calories' ? 'calFill' : `${macro}Fill`;
    const fillEl = document.getElementById(fillId);
    fillEl.style.width = `${percentage}%`;
    
    if (current > target) fillEl.style.background = 'var(--red)';
    else fillEl.style.background = 'var(--primary-color)';
  });

  // Update Liver Score
  const score = Math.round(appState.current.liverScore);
  document.getElementById('liverScoreValue').textContent = score;
  
  const circle = document.querySelector('.progress-ring__circle');
  if(circle) {
      const radius = circle.r.baseVal.value;
      const circumference = radius * 2 * Math.PI;
      const offset = circumference - (score / 100) * circumference;
      circle.style.strokeDashoffset = offset;
      
      if (score >= 90) circle.style.stroke = 'var(--green)';
      else if (score >= 70) circle.style.stroke = 'var(--yellow)';
      else circle.style.stroke = 'var(--red)';
  }
}

// --- INITIALIZATION ---
function initApp() {
  // 1. Set Date & Protocol
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  document.getElementById('currentDay').textContent = days[today];
  
  const isVegDay = [1, 5, 6].includes(today); 
  document.getElementById('dietType').textContent = isVegDay 
    ? "Vegetarian Day (No Chicken/Eggs)" 
    : "Non-Vegetarian (Chicken Allowed)";

  // 2. Bind Event Listeners Securely
  document.querySelectorAll('.btn-activity').forEach(button => {
    button.addEventListener('click', (e) => {
      const activityType = e.target.getAttribute('data-activity');
      processActivity(activityType);
    });
  });

  document.getElementById('logBreakfastBtn').addEventListener('click', logBreakfast);

  // 3. Initial Render
  updateUI();
  analyzeMealsAndRecommend();
}

// Ensure DOM is fully loaded before binding events
window.addEventListener('DOMContentLoaded', initApp);