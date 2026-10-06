# Lumo backend (Supabase)

## One-time setup
1. Create a project at https://supabase.com/dashboard.
2. **SQL Editor → New query** → paste `migrations/20261006000000_init.sql` → **Run**.
   This creates `profiles`, `habits`, `habit_logs`, the public `avatars` storage bucket,
   Row Level Security (every user only sees their own rows) and the `delete_account()` function.
3. **Project Settings → API**: copy the Project URL and the publishable (anon) key into `lumo/.env`
   (see `.env.example`). Never put the `service_role` key in the app.
4. **Authentication → URL Configuration → Redirect URLs** → add `lumo://**`
   (Google sign-in, email confirmation and password-reset links return to the app through it).
5. Optional for development: **Authentication → Sign In / Providers → Email** → turn off
   "Confirm email" to sign up without opening a confirmation email.
6. Google sign-in: follow `docs/GOOGLE_SIGN_IN.txt`.
7. Restart the dev server so the new env vars are bundled.

## Sessions
- Stored on the device (expo-sqlite localStorage); users stay signed in across launches.
- Access tokens refresh automatically while the app is open (paused in the background).
- PKCE flow: Google / email links come back to `lumo://auth-callback` with a one-time code.
- "Sign out of all devices" revokes every refresh token; other phones are signed out on their next refresh.

## Data model
| Table | What | Key |
|---|---|---|
| `profiles` | display name, avatar URL (auto-created on sign-up) | `id` = auth user id |
| `habits` | name, icon, color, time of day, target/unit, reminder | `id` (uuid, created on device) |
| `habit_logs` | progress per habit per day | `(habit_id, day)` |
| `starter_habits` | catalogue of starter habits (names in 10 languages); `auto_add` rows are copied into every new account by the `handle_new_user` trigger, all active rows show as Quick start suggestions | `id` |
| storage `avatars` | profile photos at `avatars/<user id>/…` | public read, owner write |

## How the app syncs
Local-first: every change updates the on-device store instantly and is queued in an outbox
(`src/store/outboxStore.ts`) that `src/services/sync.ts` sends to Supabase. Offline changes
are sent when the app comes back to the foreground. On sign-in the app downloads habits and
the last 180 days of logs.

## Managing starter habits (no app update needed)
Supabase → **Table Editor** → `starter_habits`:
- **auto_add = true** → added to every *new* account at sign-up (existing users are not changed)
- **active = false** → hidden from sign-up and from Quick start
- **translations / unit_translations** → JSON like `{"ar": "اشرب الماء", "es": "Beber agua"}`; English goes in `name` / `unit`
- **sort_order** → order on screen; **time_of_day** → `morning`, `workload` or `night`
- **icon** must be one of the app's habit icons (e.g. `drop`, `bookOpen`, `barbell`, `moonStars`); unknown icons show a sparkle
