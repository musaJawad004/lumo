-- Lumo: store app settings on the profile so they follow the user to every device.
-- Safe to run more than once.
--   language / theme   → existing columns
--   everything else    → preferences (haptics, reminders, sound, hide completed …)

alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;
