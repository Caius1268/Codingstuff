# Web Gamified Lesson (HTML/CSS/JS)

A zero-dependency web app that delivers a Roblox-like gamified lesson experience in the browser. Includes quiz lessons, XP/coins, shop (cosmetics), daily rewards with streaks, local persistence, and a sleek responsive UI.

## Run
- Open `index.html` in any modern browser.
- No build step, no backend required.

## Features
- Multiple-choice lessons with explanations
- XP and Coins for correct answers + completion bonus
- Daily reward with streaks and increasing coins
- Shop with cosmetics (themes, confetti, SFX)
- Local persistence via `localStorage`
- Responsive, mobile-friendly UI

## Files
- `index.html`: App shell and layout
- `styles.css`: Theme variables and modern styling
- `app.js`: Question bank, state management, rewards, shop, UI rendering, effects

## Customize
- Questions: Edit the `QuestionBank` array in `app.js`
- Rewards: Tweak the `Rewards` object in `app.js`
- Shop: Adjust `Shop` items/prices in `app.js`
- Theme: Override CSS variables in `styles.css` (e.g., `--accent`)

## Notes
- Data is saved per-browser using `localStorage`. Clearing site data resets progress.
- For real leaderboards or shared progress, add a backend API and swap persistence accordingly.