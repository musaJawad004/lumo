# 06 · Roadmap

Each phase ends with: `npx tsc --noEmit` ✅ · `npx expo lint` ✅ · tested on iOS and Android in **both** themes ✅.

## Phase 0: Plan & setup ✅ (done)
- [x] Expo SDK 57 + TypeScript project created with yarn in `Projects/lumo`
- [x] All dependencies installed, `expo-doctor` 21/21
- [x] `app.json`: name Lumo, scheme `lumo`, automatic light/dark, typed routes
- [x] Folder skeleton under `src/`, `assets/images`, `server/`
- [x] Docs + UI kit

## Phase 1: Foundation ✅ (done)
- [x] Entry switched to Expo Router (`expo-router/entry`), starter `App.tsx` / `index.ts` removed
- [x] `tsconfig` path alias `@/*` → `src/*`
- [x] Theme tokens (`colors`, `typography`, `tokens`), `themes`, `ThemeProvider` + `useTheme`, `makeStyles`
- [x] Light / dark / system theme, persisted in `settingsStore` (expo-sqlite kv-store), synced to native `Appearance`
- [x] DM Sans loaded, splash held until ready (fades out)
- [x] Root layout: GestureHandler, SafeArea, StatusBar per theme, fade screen transitions
- [x] Motion: `FadeIn` (staggered entrance, respects Reduce Motion) + `ThemeFade` (crossfade on theme switch)
- [x] Pulled forward from Phase 2: `Text`, `Pressable` (scale + haptic), `Button`, `IconButton`, `Chip`, `Card`, `SearchBar`, `Segmented`, `GlassView`, `Screen`, `TopBar`, `SectionHeader`
- [x] Showcase screen at `src/app/index.tsx` (replaced by tabs in Phase 3)
- [x] Checks: tsc ✅ · expo lint ✅ · expo-doctor 21/21 ✅ · iOS + Android bundles build ✅

## Phase 2: UI kit + glass ✅ (done)
- [x] `Field` (label, icon, suffix, focus + error states), `Switch` (animated), `ListGroup` + `ListRow`, `Avatar` (photo or initials gradient)
- [x] `GlassSheet`: frosted bottom sheet with dimmed backdrop, slide-in, keyboard-aware, pinned footer
- [x] `GlassView` gained a `fill` override
- [x] Icon registry `src/constants/icons.ts` with per-icon imports + 29 habit icons → **bundle 10MB → 4.2MB**
- [x] `/dev/kit` route with every component, `/dev/sheet` transparent-modal sheet demo; `/` redirects to the kit
- [x] Checks: tsc ✅ · expo lint ✅ · expo-doctor 21/21 ✅ · iOS + Android bundles build ✅

## Phase 3: Navigation + Home (static) ✅ (done)
- [x] `(tabs)` layout with custom `GlassTabBar`: frosted bar, bounce on the active icon, raised indigo center Home button
- [x] Home: `TopBar` (live search filter), `HeroCarousel` (live "today" slide + 3 slides, glass CTA, swipe-tracking `PageDots`), `TileGrid` / `FeatureTile` (tap to log, animated progress + ✓ badge), `HabitCard` list (animated check-off)
- [x] Placeholder Habits / Coach / Stats (`EmptyState`) and an early Settings (theme, haptics, link to component kit)
- [x] `types/habit.ts`, `constants/habitColors.ts`, `constants/heroSlides.ts`, mock data in `constants/mockHabits.ts` (delete in Phase 4)
- [x] Switch uses indigo (brand) instead of green
- [x] Dev build: `expo-dev-client` installed, bundle ID `com.glixentech.lumo`, runs on the iPhone 16 Pro Max simulator

## Phase 4: Habit core ✅ (done, plus a full Supabase backend)
Accounts (email, Google), profile with photo upload, local-first stores + offline outbox sync, settings that follow the account, backend-managed starter habits, 10 languages with RTL.

## Phase 5: Detail + streaks ✅ (done)
- [x] Habit detail screen: progress ring with logging, current/best streak, last-30-days rate, 15-week heatmap, schedule/reminder/since info
- [x] Schedules: every day or specific weekdays (+ weekly reminders per scheduled day)
- [x] Fair streak rules: rest days skipped, unfinished today never breaks a streak
- [x] Archive / restore habits (Habits tab shows an Archived section)

## Phase 6: Stats + tests ✅ (done)
- [x] Stats screen: week/month, streak tiles, daily chart, best weekday, per-habit rates (tap → detail)
- [x] Jest (jest-expo): 61 tests across dates, schedules, streaks/stats, outbox, translations (all 10 locales share every key and placeholder), validation, mappers

## Phase 7: AI ⛔ (removed from scope)

## Phase 8: Polish ✅ (mostly done)
- [x] 3.5 s animated splash, logo/app icon, native tab bar (Liquid Glass on iOS 26), glass UI, skeleton loaders, pull-to-refresh
- [x] Reminders (silent), settings, account management, password reset by code or link
- [ ] Android device pass (emulators available: run `npx expo run:android`)
- [ ] Accessibility pass with VoiceOver / TalkBack and large text

## Phase 9: Ship 🟡 (started)
- [x] `eas.json` with development / preview / production profiles, versions (1.0.0, build 1), export-compliance flag
- [x] Privacy policy + terms + landing page on GitHub Pages
- [x] Store listing draft: `docs/store/listing.md`
- [ ] `npx eas-cli@latest login` + `init` (needs your Expo account), then preview builds
- [ ] Real email sender (SMTP) in Supabase, then turn "Confirm email" back on
- [ ] Publish the Google OAuth app (Google Cloud → Audience → Publish) with the privacy URL
- [ ] App Store Connect / Play Console listings, screenshots, privacy answers
- [ ] TestFlight + Play internal testing, then submit

## Later
Widgets · drag to reorder · habit notes · Sign in with Apple (required by Apple if Google sign-in ships on iOS) · native one-tap Google sign-in
