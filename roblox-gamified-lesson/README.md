# Roblox Gamified Lesson (Starter Kit)

A complete, ready-to-import starter kit for a gamified lesson experience in Roblox. Includes quiz lessons, XP/coins, shop, daily rewards, leaderboards, data saving, and mobile-friendly UI.

## Features
- Quiz-based lessons with multiple choice questions
- XP and Coins rewards with streak bonuses
- Persistent data (coins, xp, owned items, daily streak)
- Shop: buy cosmetic trails and a speed boost
- Leaderstats for Coins and XP
- Daily reward with streak multiplier
- Safe client-server remotes (rate limits & validation)
- Mobile/PC-friendly UI

## Folder Structure
Place these scripts into Roblox Studio services as noted:

- ReplicatedStorage
  - `QuestionBank` (ModuleScript)
  - `LessonManager` (ModuleScript)
- ServerStorage
  - `ShopItems` (ModuleScript)
- ServerScriptService
  - `Setup.server` (Script)
  - `DataService.server` (Script)
  - `LessonService.server` (Script)
  - `RewardService.server` (Script)
  - `ShopService.server` (Script)
- StarterPlayer > StarterPlayerScripts
  - `ClientMain.client` (LocalScript)

## Import Steps
1. Open Roblox Studio and your place.
2. Create the following containers:
   - In `ReplicatedStorage`: create a `Folder` named `Remotes` (optional, `Setup.server` creates it if missing).
   - In `ServerStorage`: none required; the `ShopItems` ModuleScript goes directly under `ServerStorage`.
3. Create ModuleScripts/Scripts with the exact names above and paste contents from this repository files.
4. Press Play. The UI will appear with Lessons, Shop, and Daily tabs.

## How it works
- Client requests lessons, starts one, and sends answers.
- Server validates answers (no trusting the client), awards XP/coins, persists data.
- Shop purchases are validated server-side, items applied on spawn.
- Daily reward claim is validated and persisted with last-claim timestamp and streak.

## Customizing
- Add/edit questions in `ReplicatedStorage/QuestionBank`.
- Adjust reward values and streak multipliers in `ServerScriptService/RewardService.server`.
- Configure shop items and prices in `ServerStorage/ShopItems`.

## Notes
- DataStore requires Studio API access. In Studio, enable API services: Home > Game Settings > Security > Enable Studio Access to API Services.
- Avoid changing remote names; they are created by `Setup.server`.
- This kit is for learning; harden further for production games.