# 03 · Design System

**Style:** minimal + glass. Visual reference: `docs/design/ui-kit.html` (open it in a browser).

## Colors

### Brand (Blue)
| Token | Light | Dark | Use |
|---|---|---|---|
| `primary` | `#2F6BFF` | `#2F6BFF` | Buttons, active states, rings |
| `primaryDark` | `#1E54E6` | `#1E54E6` | Pressed state |
| `primarySoft` | `#EAF1FF` | `#16234A` | Chip and soft button fill |
| `primaryLine` | `#C7DAFF` | `#2A3F7A` | Chip and soft button border |
| `heroGradient` | `#1F5BFF → #4C8DFF` | same | Hero banner, AI summary card |

### Surfaces
| Token | Light | Dark |
|---|---|---|
| `background` | `#F2F2F4` | `#0B0C0F` |
| `screen` | `#FAFAFB` | `#0F1114` |
| `surface` (cards) | `#FFFFFF` | `#16181C` |
| `tile` | `#F5F6F8` | `#1C1F24` |
| `border` | `#ECEDF0` | `#25282E` |

### Text & icons
| Token | Light | Dark |
|---|---|---|
| `text` | `#1C1C1E` | `#F5F5F7` |
| `textBody` | `#3A3A3C` | `#D1D1D6` |
| `textMuted` | `#8E8E93` | `#8E8E93` |
| `iconLine` | `#7C7C82` | `#A1A1A6` |
| `iconMuted` | `#A1A1A6` | `#6E6E73` |

### Status
`success #22C55E` · `streak #FF8A00` (flames only) · `danger #FF3B30` · `ai #8B5CF6` (AI accent only)

### Habit colors (user picks one per habit)
Blue `#2F6BFF` · Green `#22C55E` · Orange `#FF8A00` · Violet `#8B5CF6` · Pink `#EC4899` · Teal `#14B8A6`

---

## Typography: DM Sans
Package `@expo-google-fonts/dm-sans` (Regular 400, Medium 500, SemiBold 600). **Never use 700+.** Tight negative tracking on headings keeps it clean.

| Variant | Size / line height | Weight · tracking | Use |
|---|---|---|---|
| `display` | 32 / 38 | 600 · −0.8 | Splash wordmark |
| `h1` | 26 / 32 | 600 · −0.6 | Screen titles, greeting |
| `h2` | 18 / 24 | 600 · −0.3 | Section titles (Morning, Your streak) |
| `title` | 16 / 22 | 500 · −0.2 | Card titles |
| `name` | 16 / 22 | 400 · −0.1 | Row titles |
| `bodyStrong` | 15 / 20 | 500 · −0.1 | Emphasis |
| `body` | 14 / 20 | 400 | Muted descriptions |
| `label` | 15 / 20 | 400 · −0.1 | Habit rows, tiles |
| `chip` | 12 / 16 | 500 | Chips, active labels |
| `caption` | 12 / 16 | 400 | Counts, weekdays |
| `overline` | 11 / 14 | 500 · +0.8, uppercase | Group labels (APPEARANCE) |

Stats numbers use `tabular` so they don't shift as values change.

## Spacing, radius, sizes
- **Spacing scale:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40
- Screen padding **16** · tile gap **12** · section gap **24** · card padding **16**
- **Radius:** input 14 · tile/card 18 · hero 20 · sheet 28 · pill 999
- **Sizes:** search 44h · round header button 44 · tile ~108h · tile icon 36 · tab icon 26 · center button 72 (inner 46) · min touch target 44

## Shadows
- `card`: iOS `#000 / 0.06 / r12 / y4`, Android `elevation 2`
- `hero`: `primary / 0.28 / r20 / y8`, Android `elevation 6`
- Keep shadows soft. The contrast between the gray background and white cards does most of the work.

---

## Glass
One component, `<GlassView>`, decides how to render:

| Platform | Rendering |
|---|---|
| iOS 26+ | `expo-glass-effect` GlassView (native Liquid Glass) |
| iOS < 26 | `expo-blur` BlurView + tint overlay |
| Android | `expo-blur` with lower intensity + a more opaque overlay (better performance) |

| Element | Recipe |
|---|---|
| ~~Tab bar~~ (replaced by the dock) | blur 40 · white 60% (dark `#1C1F24` 60%) · 1px top border white 80% (dark 12%) |
| Center Home button | glass ring (primarySoft 65%) + solid primary rounded square (r15) |
| Hero CTA "Start Now" | white 15% · 1px white 50% border · blur 20 |
| Bottom sheets | blur 60 · white 78% (dark glassFill) · radius 28 · grab handle |
| Coach composer | same as tab bar, pill shape |

**Glass rules:** use it on floating elements only, always add a 1px light border, keep to 2 glass layers or fewer per screen, and never put glass on cards.

---

## Icons: Phosphor (`phosphor-react-native`)
- **Content and tiles:** `weight="light"`, color `iconLine`, size 36 (tiles) or 22 (rows)
- **Tab bar:** `weight="fill"`, color `iconMuted`, size 26. The active tab is `primary`
- **Header:** `light`, size 22 · **Checks:** `bold`
- Use only icons listed in `constants/icons.ts` so the set stays consistent

## Motion & feedback
- Press: scale to **0.97** over 120ms, plus a selection haptic
- Log a habit: light impact. Reaching the target: success haptic + ring fill animation (Reanimated, 400ms)
- Hero carousel: snap paging with an animated width on the dots (active dot 24px)
- Respect **Reduce Motion** by turning off non-essential animations

## Accessibility
- Every pressable has an `accessibilityLabel` and `accessibilityRole`
- Support Dynamic Type up to 1.3× (`maxFontSizeMultiplier`)
- Text contrast is AA or better on both themes
- Never use color as the only signal (completed states also show a ✓)

---

## Components spec (build order)

| Component | Key props | Notes |
|---|---|---|
| `Text` | `variant`, `color?` | Only way to render text |
| `Pressable` | `onPress`, `haptic?` | Scale + haptic baked in |
| `Button` | `variant: primary\|soft\|glass\|ai`, `size`, `icon?` | Pill shape |
| `IconButton` | `icon`, `badge?` | 44 round white + shadow |
| `Chip` | `tone: primary\|orange\|green`, `icon?` | |
| `Card` | `children`, `padded?` | surface + r18 + card shadow |
| `SearchBar` | `value`, `onChange` | 44 pill |
| `GlassView` | `intensity`, `tint`, `style` | Platform fallback logic |
| `GlassTabBar` | tab bar props | Center raised button |
| `HeroCarousel` | `slides` | Gradient + art + glass CTA + dots |
| `FeatureTile` | `habit`, `progress`, `onPress`, `onLongPress` | Mini progress bar + ✓ badge |
| `HabitCard` | `habit`, `done`, `onToggle` | Same style as the reference's Q&A cards |
| `ProgressRing` | `progress`, `size`, `stroke` | react-native-svg + Reanimated |
| `Heatmap` | `data`, `weeks=15` | 7 rows × 15 cols, opacity levels |
| `WeekBars` | `values[7]` | Highlights the best day |

---

## Dock (bottom navigation)
Floating black pill (`dock #0B0B0E`, dark mode `#1E2026` + hairline border), 72pt tall, 20pt side margin, soft drop shadow.
Slots: Home · Stats · **＋ New habit** · Coach · Profile. Inactive items are dark circles (`dockItem`) with `dockIcon` gray regular icons; a **blue circle springs** to the active tab, whose icon turns white and filled.

## Logo & splash
- **Mark:** a white progress ring, 3/4 complete, with a glowing dot in the gap: "the next small step". Source: `docs/design/logo.svg` (1024 viewBox, ring r=250 stroke 92, dot r=46 at 335,335).
- **Badge:** blue gradient `#4C8DFF → #1A4FE8` with a soft top-left shine.
- **Assets:** `assets/icon.png` (opaque, iOS), `android-icon-*` (adaptive, mark at 62% for the safe zone), `splash-icon.png` (rounded badge), `favicon.png`.
- **Splash:** native splash shows the badge at 120pt on the screen color; `AnimatedSplash` takes over with an identical frame: the ring closes as the dot is absorbed → badge pulse + halo → lift while "Lumo" rises in → fade into the app (~2s, Reduce Motion = quick fade).
