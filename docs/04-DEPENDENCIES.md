# 04 · Dependencies

All installed with **`npx expo install`**, which picks SDK 57-compatible versions and uses yarn because a `yarn.lock` is present.
`npx expo-doctor` → **21/21 checks passed**.

> Rule: always add packages with `npx expo install <pkg>`, not `yarn add`, so versions stay matched to the SDK.

## Core
| Package | Version | Why |
|---|---|---|
| `expo` | ~57.0.26 | SDK |
| `react` | 19.2.3 | |
| `react-native` | 0.86.3 | |
| `typescript` (dev) | ~6.0.3 | Strict typing |

## Navigation
| Package | Version | Why |
|---|---|---|
| `expo-router` | ~57.0.24 | File-based routing in `src/app/`, typed routes |
| `react-native-screens` | ~4.26.0 | Native screens (router peer) |
| `react-native-safe-area-context` | ~5.7.0 | Notch and home indicator insets |
| `expo-linking` | ~57.0.11 | Deep links (`lumo://`) |
| `expo-constants` | ~57.0.20 | Runtime config (router peer, AI proxy URL) |
| `expo-status-bar` | ~57.0.1 | Status bar style per theme |

## UI, glass & visuals
| Package | Version | Why |
|---|---|---|
| `expo-blur` | ~57.0.3 | Glass blur (tab bar, sheets, CTA) |
| `expo-glass-effect` | ~57.0.4 | Native Liquid Glass on **iOS 26+** (iOS only; otherwise blur fallback) |
| `expo-linear-gradient` | ~57.0.2 | Hero and AI summary gradients |
| `expo-image` | ~57.0.5 | Fast, cached images |
| `react-native-svg` | 15.15.4 | Rings, heatmap, charts (also a Phosphor peer) |
| `phosphor-react-native` | ^3.0.6 | Icon set (light / fill / bold weights) |
| `@expo-google-fonts/dm-sans` | ^0.4.2 | DM Sans |
| `expo-font` | ~57.0.4 | Font loading |
| `expo-splash-screen` | ~57.0.9 | Hold splash until fonts and stores are ready |
| `expo-system-ui` | ~57.0.4 | Root background color per theme (no white flash) |

## Animation & gestures
| Package | Version | Why |
|---|---|---|
| `react-native-reanimated` | 4.5.1 | Ring fill, press scale, carousel dots |
| `react-native-worklets` | 0.10.1 | **Required peer** for Reanimated 4 (Babel plugin auto-configured) |
| `react-native-gesture-handler` | ~2.32.0 | Long press, swipe actions |
| `expo-haptics` | ~57.0.3 | Tap feedback |

## State & data
| Package | Version | Why |
|---|---|---|
| `zustand` | ^5.0.15 | Small stores + `persist` middleware |
| `expo-sqlite` | ~57.0.3 | `expo-sqlite/kv-store` for persistent storage (AsyncStorage API + sync reads). Works in Expo Go |
| `date-fns` | ^4.4.0 | Day keys, week ranges, streak math |
| `expo-crypto` | ~57.0.3 | `randomUUID()` for IDs |

## Device features
| Package | Version | Why |
|---|---|---|
| `expo-notifications` | ~57.0.21 | Local habit reminders |
| `expo-file-system` | ~57.0.7 | Write export JSON |
| `expo-sharing` | ~57.0.22 | Share sheet for export |

**Config plugins added to `app.json`:** expo-router, expo-image, expo-font, expo-splash-screen, expo-sqlite, expo-sharing.

---

## Changes from the earlier plan
| Was | Now | Reason |
|---|---|---|
| `react-native-mmkv` | `expo-sqlite/kv-store` | MMKV needs a custom dev build. kv-store works in **Expo Go**, so you can test on your phone instantly |
| lucide icons | `phosphor-react-native` | Light and fill weights match the reference design |
| `app/` | `src/app/` | Expo SDK 57 convention |

## Expo Go compatibility
Every package is included in Expo Go, so **no dev build is needed during development**.
- We only use **local** notifications, which work in Expo Go (remote push doesn't).
- Liquid Glass only shows on iOS 26+ devices. Everything else uses the blur fallback.

## To add later (not installed yet)
| When | Package | For |
|---|---|---|
| Phase 6 | `jest-expo`, `@testing-library/react-native` | Tests |
| Phase 9 | `eas-cli` (via `npx eas-cli@latest`) | Builds and store submission |
| v1.x | `@supabase/supabase-js` | Accounts and sync |
