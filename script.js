/**
 * Fatty Liver Nutrition Tracker Pro v2.0
 * Architecture: Modular Vanilla JS pattern
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

// --- FOOD DATABASE (Subset for milestone 1) ---
const foodDB = {
  idli: { name: 'Idli (2 pieces)', macros: { calories: 120, protein: 4, carbs: 26, fat: 0.5, fiber: 2 } },
  chicken_breast: { name: 'Chicken Breast (150g)', macros: { calories: 247, protein: 46, carbs: 0, fat: 5, fiber: 0 } },
  broccoli: { name: 'Broccoli (100g)', macros: { calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6 } },
  whey: { name: 'Whey Protein (1 scoop)', macros: { calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 } }
};

// --- LOGIC: MEAL ENGINE ---
function logMeal() {
  const foodKey = document.getElementById('foodSelect').value;
  const food = foodDB[foodKey];
  
  appState.current.calories += food.macros.calories;
  appState.current.protein += food.macros.protein;
  appState.current.carbs += food.macros.carbs;
  appState.current.fat += food.macros.fat;
  
  // Smart rule triggers
  if(foodKey === 'broccoli') updateLiverScore(5);
  
  analyzeMealsAndRecommend();
  saveState();
}

function logActivity(type) {
  const scores = { 'gym': 10, 'football': 10, 'water': 10, 'sugar': -15 };
  updateLiverScore(scores[type] || 0);
  saveState();
}

function updateLiverScore(change) {
  appState.current.liverScore += change;
  if(appState.current.liverScore > 100) appState.current.liverScore = 100;
  if(appState.current.liverScore < 0) appState.current.liverScore = 0;
}

// --- SMART NUTRITION ENGINE ---
function analyzeMealsAndRecommend() {
  const remCalories = appState.targets.calories - appState.current.calories;
  const remProtein = appState.targets.protein - appState.current.protein;
  const remCarbs = appState.targets.carbs - appState.current.carbs;
  
  const notificationBox = document.getElementById('engineNotification');
  
  if (remCarbs < 30 && remProtein > 40) {
    notificationBox.textContent = "Carbs are running low! Skip rice at dinner. Focus purely on Chicken/Paneer and green vegetables.";
  } else if (remProtein <= 10) {
    notificationBox.textContent = "Excellent protein intake today! Dinner can be lighter. Focus on fiber (Broccoli/Peas).";
  } else {
    notificationBox.textContent = `You need ${Math.max(0, Math.round(remProtein))}g more protein today. A 150g portion of Chicken Breast is recommended.`;
  }
}

// --- UI UPDATER ---
function updateUI() {
  // Update Macros
  const macros = ['calories', 'protein', 'carbs', 'fat'];
  
  macros.forEach(macro => {
    const current = Math.round(appState.current[macro]);
    const target = appState.targets[macro];
    const percentage = Math.min((current / target) * 100, 100);
    
    // Update text formatting
    const unit = macro === 'calories' ? '' : 'g';
    const elementId = macro === 'calories' ? 'calValue' : `${macro}Value`;
    document.getElementById(elementId).textContent = `${current} / ${target}${unit}`;
    
    // Update Progress Bars
    const fillId = macro === 'calories' ? 'calFill' : `${macro}Fill`;
    const fillEl = document.getElementById(fillId);
    fillEl.style.width = `${percentage}%`;
    
    // Danger color if exceeding limits
    if (current > target) fillEl.style.background = 'var(--red)';
    else fillEl.style.background = 'var(--primary-color)';
  });

  // Update Liver Score Ring
  const score = appState.current.liverScore;
  document.getElementById('liverScoreValue').textContent = score;
  
  const circle = document.querySelector('.progress-ring__circle');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  
  if (score >= 90) circle.style.stroke = 'var(--green)';
  else if (score >= 70) circle.style.stroke = 'var(--yellow)';
  else circle.style.stroke = 'var(--red)';
}

// --- INITIALIZATION ---
function initApp() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  document.getElementById('currentDay').textContent = days[today];
  
  // Set Diet Rules based on user specification
  const isVegDay = [1, 5, 6].includes(today); // Mon, Fri, Sat
  document.getElementById('dietType').textContent = isVegDay 
    ? "Vegetarian Day (No Chicken/Eggs)" 
    : "Non-Vegetarian (Chicken Allowed)";
  
  updateUI();
  analyzeMealsAndRecommend();
}

window.addEventListener('DOMContentLoaded', initApp);