# Fatty Liver Nutrition Tracker Pro

An Apple-inspired, offline-first **PWA** that acts as an intelligent nutrition
planner — built to **reverse fatty liver**, **lower LDL**, and **build/maintain
muscle**. Pure HTML + CSS + Vanilla JS. No frameworks, no backend, no login.

## Features
- **Dashboard** – live Liver Score ring, macro cards (cal/protein/carbs/fat/fiber), water tracker.
- **Day selector** – auto-detects today; veg/non-veg rules (Mon/Fri/Sat veg, Tue/Wed/Thu/Sun non-veg) with manual override.
- **Meal builders** – breakfast, protein, lunch, snacks with ~100+ Indian foods and tap-to-set quantities.
- **Smart dinner engine** – auto-generates dinner from what you've eaten + remaining targets + gym/football, re-balancing carbs & protein.
- **Liver Health Score** – +/- scoring with a tappable breakdown.
- **Blood report tracker** – ALT, AST, LDL, HDL, TC, TG, Vit D, B12, HbA1c, weight, waist + trends & improvement %.
- **Weekly / monthly analytics** – canvas charts (no libraries).
- **Calendar** – colour-coded days, tap to inspect any day.
- **Shopping list** – auto-estimated weekly groceries.
- **Coaching notifications** – context-aware suggestions.
- **Export / Import** JSON backups. Everything saved in LocalStorage.
- **Dark + light + auto** themes, glassmorphism, large touch targets.

## Run locally
Any static server works, e.g.:
```bash
python -m http.server 8080
```
Then open <http://localhost:8080>.

## Deploy to GitHub Pages
1. Push the contents of this `FattyLiverTracker/` folder to a repo.
2. Settings → Pages → deploy from branch (root or `/docs`).
3. Open the Pages URL on iPhone Safari → **Share → Add to Home Screen** to install as an app.

> Paths are relative, so it works from a project sub-path like `https://user.github.io/repo/`.

## File map
| File | Role |
|------|------|
| `index.html` | App shell & layout |
| `styles.css` | Apple-style UI, dark/light, glass |
| `nutrition-data.js` | ~150 Indian foods + day/diet rules |
| `storage.js` | LocalStorage persistence + export/import |
| `meal-engine.js` | Totals, liver score, smart dinner, shopping, coaching |
| `charts.js` | Canvas line/bar/ring charts |
| `blood-report.js` | Blood markers, ranges, improvement % |
| `script.js` | View controller / UI logic |
| `manifest.json`, `service-worker.js` | PWA install + offline |
| `assets/` | App icons |
