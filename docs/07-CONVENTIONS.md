# 07 · Conventions

## Tooling
- **yarn only.** Never run `npm install` (it would create a second lockfile).
- Add packages with `npx expo install <pkg>`.
- Before calling any task done: `npx tsc --noEmit` and `npx expo lint`.
- Expo changes every SDK. Check the versioned docs at `https://docs.expo.dev/versions/v57.0.0/` instead of relying on memory.
- Never create or edit `ios/` or `android/` by hand. Configure everything in `app.json` and config plugins.

## Code rules
1. TypeScript strict mode. Use no `any`; if you truly need an escape hatch, use `unknown` and narrow it.
2. **No hard-coded colors, sizes, or fonts.** Everything comes from `useTheme()`.
3. **Screens have no business logic.** They compose components and call hooks.
4. Components never import stores. They take props or use a hook.
5. `utils/` are **pure functions**: no React, no stores, no side effects. They're 100% unit-testable.
6. One component per file, ideally under ~150 lines. Split it when it grows.
7. Only `<Text>` from `components/ui` renders text. Never use React Native's `Text` directly in screens.
8. Only `<Pressable>` from `components/ui` handles taps, since it has the scale and haptic built in.
9. Icons come **only** from `@/constants/icons` (`icons.drop`, `Icon` type). Never `import { X } from 'phosphor-react-native'`: the barrel pulls in all 1,500+ icons. To add one, add a per-file import to the registry.
10. Store derived data with `useMemo` in hooks. Never persist derived data.
11. Dates are stored as `DayKey` strings (`YYYY-MM-DD`, local time). Never store Date objects.

## Naming
| Thing | Style | Example |
|---|---|---|
| Components | PascalCase file + export | `FeatureTile.tsx` |
| Hooks | camelCase with `use` | `useHabitStats.ts` |
| Stores | camelCase + `Store` | `habitStore.ts` → `useHabitStore` |
| Utils | camelCase | `streak.ts` → `currentStreak()` |
| Types | PascalCase | `Habit`, `DayKey` |
| Routes | lowercase (Expo Router) | `habit/[id].tsx` |
| Constants | camelCase file, UPPER_SNAKE values when primitive | `MAX_HABITS` |

## Imports
- Use the path alias `@/` → `src/` (set up in Phase 1). Example: `import { Card } from '@/components/ui/Card'`
- Order: react / react-native → expo / third-party → `@/` → relative

## Styling
- Use `StyleSheet.create` with values from the theme. For theme-dependent styles, use a small `makeStyles(theme)` pattern inside the component.
- The spacing scale only: 4, 8, 12, 16, 20, 24, 32, 40.
- Radius only from tokens.

## Git
- Branch per phase: `phase/1-foundation`, `phase/2-ui-kit`, …
- Commit messages: `feat: …`, `fix: …`, `chore: …`, `docs: …`, `refactor: …`
- Never commit secrets (`.env*` is git-ignored). The HF token lives only in the Supabase secrets.

## Secrets & config
| Value | Where |
|---|---|
| `HF_TOKEN`, `HF_CHAT_MODEL` | Supabase Edge Function secrets |
| AI proxy URL | `app.json → expo.extra.aiProxyUrl` |
| Nothing secret | ever inside the app bundle |
