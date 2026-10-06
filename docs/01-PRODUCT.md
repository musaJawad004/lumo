# 01 · Product

## Vision
Lumo makes building habits feel calm instead of stressful. Every completed habit adds a little "glow". The app looks minimal and premium, with no clutter and no guilt. It works fully offline. An optional AI coach helps users when they get stuck.

**Tagline:** *Small habits. Steady glow.*

## Target user
- Ages 18 to 35 who want to build 3 to 8 simple daily habits (water, reading, workouts, prayer, sleep, meditation)
- People who have tried habit apps before and found them noisy or complicated
- Users on both iOS and Android, in light and dark mode

## Core principles
1. **Logging takes one tap.** Checking off a habit from Home is a single tap.
2. **Offline first.** Everything except AI works with no internet and no account.
3. **Calm, not naggy.** Gentle reminders, no shaming, and a missed day doesn't erase your history.
4. **Minimal.** If a feature adds clutter, cut it.

---

## Features

### MVP (v1.0)
| Feature | Details |
|---|---|
| **Habits** | Create, edit, archive, and delete habits. Each has a name, icon, color, frequency, target and unit, and an optional reminder |
| **Frequency** | Daily · specific weekdays · X times per week |
| **Targets** | Yes/no habits ("Walk") or count habits ("8 glasses", "20 pages") |
| **Today view** | A 3×2 quick tile grid plus a list of today's habits, with tap to log |
| **Streaks** | Current and best streak per habit, plus an overall "perfect days" streak |
| **Habit detail** | Progress ring, stats (current, best, completion %), 15-week heatmap, history edit |
| **Stats** | Weekly and monthly completion chart, a per-habit breakdown, and the best day of the week |
| **Reminders** | Local notifications per habit, set to the user's chosen time |
| ~~AI Coach~~ | Removed from scope (2026-10-06) |
| **Theme** | Light, dark, or follow the system |
| **Onboarding** | 3 slides, then pick starter habits from templates |
| **Settings** | Name, theme, language (10, incl. RTL Arabic/Urdu), haptics, daily reminder + time, reset, about |

### Later (v1.x+)
- Home screen widgets (iOS and Android)
- Accounts and cloud sync (Supabase)
- Journal and mood log
- Habit challenges and friend accountability
- Apple Health and Google Fit auto-logging (steps, sleep)
- Lumo Pro (subscription for unlimited AI)

### Out of scope (v1)
Social feed, leaderboards, web app, Apple Watch.

---

## Screens

| Route | Screen | Purpose |
|---|---|---|
| `/onboarding` | Onboarding | Welcome slides, then pick starter habits |
| `/(tabs)/` | **Home** | Greeting, hero carousel, quick tiles, today's habits |
| `/(tabs)/habits` | Habits | All habits, with search, reorder, and archived habits |
| `/(tabs)/coach` | AI Coach | Chat with suggested habits you can add in one tap |
| `/(tabs)/stats` | Stats | Charts, per-habit breakdown, AI weekly summary |
| `/(tabs)/settings` | Settings | Preferences and data |
| `/habit/new` | New Habit | Glass bottom sheet form (modal) |
| `/habit/[id]` | Habit Detail | Ring, stats, heatmap, history |
| `/habit/[id]/edit` | Edit Habit | Same form as New Habit, pre-filled |

**Tab bar:** Habits · Coach · **( Home )** · Stats · Settings. Home is the raised center glass button.

---

## Key user flows

**First launch**
`Onboarding slides → pick 3+ templates (or skip) → request notification permission → Home`

**Daily logging (the main loop)**
`Open app → Home → tap a tile` → value +1 (or marked done) → haptic + ring animation → the streak updates.
A long press on a tile opens Habit Detail.

**Create habit**
`Center "+" tile or Habits → New Habit sheet → name, icon, color, frequency, target, reminder → Create` → it appears on Home.
Optional: **"✨ Suggest with AI"** fills in the form from a goal.

**AI coach**
`Coach tab → type a message or tap a suggestion chip → AI replies` → suggestion cards appear with a "+" button that adds the habit instantly.

**Weekly summary**
Every Monday (or when the user opens Stats), Lumo asks the AI to summarize last week. The result is cached until the next week.

---

## Success metrics
- Day-7 retention ≥ 35%
- Users log on average ≥ 5 days per week
- Median time to log a habit is under 2 seconds from opening the app
- Crash-free sessions ≥ 99.5%
