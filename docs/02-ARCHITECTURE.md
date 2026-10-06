# 02 · Architecture

## 1. Layers

```
┌──────────────────────────────────────────────┐
│  Routes / Screens        src/app/            │  layout + composition only
├──────────────────────────────────────────────┤
│  Components              src/components/     │  pure UI, styled from theme tokens
├──────────────────────────────────────────────┤
│  Hooks                   src/hooks/          │  connect UI ↔ stores, derived data
├──────────────────────────────────────────────┤
│  Stores (Zustand)        src/store/          │  state + actions
├──────────────────────────────────────────────┤
│  Services                src/services/       │  storage, notifications, AI client, export
├──────────────────────────────────────────────┤
│  Utils (pure functions)  src/utils/          │  streaks, dates, stats math
└──────────────────────────────────────────────┘
                     │ (AI only, HTTPS)
                     ▼
        server/functions/coach  (proxy, holds HF token)
                     ▼
        Hugging Face Inference Providers
```

**Dependency rule:** each layer only imports from layers **below** it.
Screens → components/hooks. Hooks → stores/utils. Stores → services/utils. Utils → nothing (pure).
Components never import stores directly. They receive props or use a hook.

---

## 2. Folder structure

```
lumo/
├── src/
│   ├── app/                         # Expo Router: every file is a route
│   │   ├── _layout.tsx              # Root: fonts, ThemeProvider, GestureHandler, SafeArea, splash, onboarding gate
│   │   ├── onboarding.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx          # Tabs + custom <GlassTabBar/>
│   │   │   ├── index.tsx            # Home
│   │   │   ├── habits.tsx
│   │   │   ├── coach.tsx
│   │   │   ├── stats.tsx
│   │   │   └── settings.tsx
│   │   └── habit/
│   │       ├── new.tsx              # presentation: formSheet / modal
│   │       ├── [id].tsx             # Detail
│   │       └── [id]/edit.tsx
│   │
│   ├── components/
│   │   ├── ui/          Text, Button, IconButton, Chip, Card, SearchBar, Avatar,
│   │   │                Segmented, Switch, ListRow, Field, Pressable (scale + haptic)
│   │   ├── glass/       GlassView (blur ↔ liquid glass fallback), GlassButton,
│   │   │                GlassTabBar, GlassSheet
│   │   ├── layout/      Screen (safe area + padding + scroll), TopBar, SectionHeader
│   │   ├── home/        HeroCarousel, HeroSlide, PageDots, FeatureTile, TileGrid, HabitCard
│   │   ├── habit/       ProgressRing, StreakBadge, StatBox, Heatmap, IconPicker,
│   │   │                ColorPicker, FrequencyPicker, HabitForm
│   │   ├── stats/       WeekBars, HabitBreakdownRow, SummaryCard
│   │   ├── coach/       MessageBubble, SuggestionCard, Composer, PromptChips
│   │   └── motion/      FadeIn (staggered entrance), ThemeFade (theme crossfade)
│   │
│   ├── theme/
│   │   ├── colors.ts          # light + dark palettes (Indigo)
│   │   ├── typography.ts      # DM Sans text variants
│   │   ├── spacing.ts         # 4-pt scale
│   │   ├── radius.ts
│   │   ├── shadows.ts         # iOS shadow + Android elevation
│   │   ├── glass.ts           # blur intensity / tint per platform
│   │   ├── index.ts           # builds Theme object
│   │   └── ThemeProvider.tsx  # useTheme(), follows settings + system scheme
│   │
│   ├── store/
│   │   ├── habitStore.ts      # habits CRUD, reorder, archive
│   │   ├── logStore.ts        # daily values per habit
│   │   ├── settingsStore.ts   # theme, haptics, ai, weekStart, onboarding done
│   │   ├── coachStore.ts      # chat messages, cached weekly summary
│   │   └── persist.ts         # Zustand persist adapter → expo-sqlite/kv-store
│   │
│   ├── hooks/
│   │   ├── useHabits.ts            # active habits, sorted
│   │   ├── useTodayHabits.ts       # habits due today + progress
│   │   ├── useHabitStats.ts        # streak, best, rate, heatmap data for one habit
│   │   ├── useWeeklyStats.ts
│   │   ├── useLogHabit.ts          # log + haptic
│   │   └── useCoach.ts             # send message, suggestions, summary
│   │
│   ├── services/
│   │   ├── storage.ts         # kv-store wrapper
│   │   ├── notifications.ts   # permission, schedule/cancel per habit
│   │   ├── ai.ts              # HTTPS client → proxy (never Hugging Face directly)
│   │   ├── haptics.ts
│   │   └── export.ts          # JSON export via expo-file-system + expo-sharing
│   │
│   ├── utils/
│   │   ├── dates.ts           # dayKey(), isDue(), week ranges (date-fns)
│   │   ├── streak.ts          # currentStreak(), bestStreak()
│   │   ├── stats.ts           # completionRate(), bestWeekday()
│   │   └── id.ts              # expo-crypto randomUUID
│   │
│   ├── constants/
│   │   ├── templates.ts       # starter habits (Water, Read, Walk, …)
│   │   ├── icons.ts           # allowed Phosphor icon names
│   │   ├── habitColors.ts     # 6 habit colors
│   │   └── heroSlides.ts
│   │
│   └── types/
│       ├── habit.ts · log.ts · settings.ts · coach.ts
│
├── assets/images/{hero,onboarding}/  # AI-generated hero art (see doc 05)
├── server/functions/coach/           # AI proxy (Supabase Edge Function)
├── docs/                             # these docs + design/ui-kit.html
└── app.json · package.json · tsconfig.json
```

---

## 3. Data model

```ts
type HabitId = string;            // uuid
type DayKey  = string;            // 'YYYY-MM-DD' in the user's local time

interface Habit {
  id: HabitId;
  name: string;
  icon: IconName;                 // from constants/icons.ts
  color: HabitColor;              // from constants/habitColors.ts
  frequency:
    | { type: 'daily' }
    | { type: 'weekdays'; days: number[] }      // 0 = Sun … 6 = Sat
    | { type: 'timesPerWeek'; count: number };
  target: number;                 // 1 = yes/no habit
  unit?: string;                  // 'glasses', 'pages', 'min'
  reminder?: { hour: number; minute: number; notificationIds?: string[] };
  order: number;
  archived: boolean;
  createdAt: string;              // ISO
}

// logs[habitId][dayKey] = value   (missing key = 0)
type Logs = Record<HabitId, Record<DayKey, number>>;

interface Settings {
  theme: 'system' | 'light' | 'dark';
  haptics: boolean;
  aiEnabled: boolean;
  weekStartsOn: 0 | 1;
  onboardingDone: boolean;
  userName?: string;
}

interface ChatMessage {
  id: string; role: 'user' | 'assistant'; text: string;
  suggestions?: HabitSuggestion[]; createdAt: string;
}
```

**Why a nested map for logs?** Reading or writing a habit on a given day takes O(1). Even 10 habits × 3 years is only about 11k numbers, which is tiny.

**Derived data is never stored.** Streaks, rates, and heatmaps are computed by `utils/` and memoized in hooks.

---

## 4. State & persistence
- **One Zustand store per domain:** habits, logs, settings, coach.
- Each store uses `persist` middleware with a storage adapter (`store/persist.ts`) backed by **`expo-sqlite/kv-store`**. This is the same API as AsyncStorage, it has sync reads for instant hydration, and it works in Expo Go.
- Every store has a `version` and a `migrate` function so data can be updated when the shape changes.
- **Hydration gate:** the root layout keeps the splash screen visible until fonts are loaded and all stores have hydrated, so the UI never shows empty data.
- **Upgrade path:** if logs grow large or cloud sync is added, move `logStore` to real `expo-sqlite` tables. The hooks API stays the same.

---

## 5. Navigation map
```
Root Stack (_layout)
├── onboarding                (shown only if !onboardingDone)
├── (tabs)  ── Tabs with GlassTabBar
│     ├── habits
│     ├── coach
│     ├── index  (Home, center button)
│     ├── stats
│     └── settings
├── habit/new          (formSheet modal, glass)
├── habit/[id]         (push)
└── habit/[id]/edit    (formSheet modal)
```
Typed routes are enabled (`experiments.typedRoutes`). Deep link scheme: `lumo://`.

## 6. Data flow example: tapping a tile
```
FeatureTile onPress
  → useLogHabit(habitId).increment()
      → logStore.increment(habitId, today)      (state + persisted)
      → haptics.light()   (or success() if target reached)
  → useTodayHabits re-derives progress → tile + hero ring re-render
  → useHabitStats recomputes streak (memoized)
```

## 7. Notifications
- Ask for permission at the end of onboarding, or the first time a reminder is set.
- Each habit's reminder becomes a **repeating local notification** (daily or per weekday).
- When a habit is edited or deleted, cancel its old notification IDs and reschedule.
- Tapping a notification deep-links to `lumo://habit/<id>`.

## 8. Theming
`ThemeProvider` reads `settings.theme` + the system color scheme and exposes
`useTheme() → { colors, type, space, radius, shadow, glass, isDark }`. Components never import raw hex values.

## 9. Error handling
- AI calls: 15s timeout, friendly error bubble, retry button. The app never blocks on AI.
- Storage: catch persist errors and log them. Data in memory stays usable.
- A root error boundary shows a calm "Something went wrong" screen with a reload option.

## 10. Testing
- **Unit tests (Jest)** for `utils/` covering streaks, due dates, and stats, including edge cases like DST, week boundaries, and timesPerWeek.
- **Store tests** for actions (add, log, archive).
- Manual QA checklist per phase (see Roadmap).
