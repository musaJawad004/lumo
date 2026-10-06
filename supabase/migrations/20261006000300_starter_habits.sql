-- Lumo: starter habits, managed from the backend. Safe to run more than once.
--
--  • public.starter_habits  = the catalogue. Edit it in Supabase → Table Editor.
--      auto_add = true  → copied into every NEW account at sign-up
--      active   = false → hidden everywhere (no need to delete)
--      translations / unit_translations → name per language code ({"ar": "…", "es": "…"}); English in name/unit
--  • The app also shows active rows as one-tap "Quick start" suggestions when a user has no habits.

create table if not exists public.starter_habits (
  id                 text primary key,
  name               text not null,
  translations       jsonb not null default '{}'::jsonb,
  icon               text not null,
  color              text not null,
  time_of_day        text not null default 'morning' check (time_of_day in ('morning', 'workload', 'night')),
  target             integer not null default 1 check (target between 1 and 999),
  unit               text,
  unit_translations  jsonb not null default '{}'::jsonb,
  sort_order         integer not null default 0,
  auto_add           boolean not null default false,
  active             boolean not null default true
);

alter table public.starter_habits enable row level security;

drop policy if exists "starter habits: readable when active" on public.starter_habits;
create policy "starter habits: readable when active"
  on public.starter_habits for select
  to authenticated
  using (active);

insert into public.starter_habits
  (id, name, translations, icon, color, time_of_day, target, unit, unit_translations, sort_order, auto_add)
values
  ('water', 'Drink water', '{"ar": "اشرب الماء", "es": "Beber agua", "fr": "Boire de l’eau", "pt": "Beber água", "de": "Wasser trinken", "tr": "Su iç", "hi": "पानी पिएँ", "ur": "پانی پئیں", "id": "Minum air"}'::jsonb, 'drop', 'blue', 'morning', 8, 'glasses', '{"ar": "أكواب", "es": "vasos", "fr": "verres", "pt": "copos", "de": "Gläser", "tr": "bardak", "hi": "गिलास", "ur": "گلاس", "id": "gelas"}'::jsonb, 0, true),
  ('meditate', 'Meditate', '{"ar": "تأمّل", "es": "Meditar", "fr": "Méditer", "pt": "Meditar", "de": "Meditieren", "tr": "Meditasyon yap", "hi": "ध्यान करें", "ur": "مراقبہ کریں", "id": "Meditasi"}'::jsonb, 'flowerLotus', 'teal', 'morning', 1, null, '{}'::jsonb, 1, true),
  ('workout', 'Work out', '{"ar": "تمرّن", "es": "Hacer ejercicio", "fr": "Faire du sport", "pt": "Treinar", "de": "Trainieren", "tr": "Spor yap", "hi": "कसरत करें", "ur": "ورزش کریں", "id": "Olahraga"}'::jsonb, 'barbell', 'orange', 'morning', 1, null, '{}'::jsonb, 2, false),
  ('walk', 'Take a walk', '{"ar": "تمشَّ قليلًا", "es": "Salir a caminar", "fr": "Marcher", "pt": "Caminhar", "de": "Spazieren gehen", "tr": "Yürüyüşe çık", "hi": "टहलें", "ur": "چہل قدمی کریں", "id": "Jalan kaki"}'::jsonb, 'personSimpleWalk', 'green', 'workload', 1, null, '{}'::jsonb, 3, true),
  ('read', 'Read 10 pages', '{"ar": "اقرأ 10 صفحات", "es": "Leer 10 páginas", "fr": "Lire 10 pages", "pt": "Ler 10 páginas", "de": "10 Seiten lesen", "tr": "10 sayfa oku", "hi": "10 पेज पढ़ें", "ur": "10 صفحات پڑھیں", "id": "Baca 10 halaman"}'::jsonb, 'bookOpen', 'violet', 'workload', 1, null, '{}'::jsonb, 4, true),
  ('journal', 'Journal', '{"ar": "اكتب يومياتك", "es": "Escribir un diario", "fr": "Tenir un journal", "pt": "Escrever um diário", "de": "Tagebuch schreiben", "tr": "Günlük yaz", "hi": "डायरी लिखें", "ur": "ڈائری لکھیں", "id": "Menulis jurnal"}'::jsonb, 'notebook', 'pink', 'night', 1, null, '{}'::jsonb, 5, false),
  ('nophone', 'No phone in bed', '{"ar": "لا هاتف في السرير", "es": "Sin móvil en la cama", "fr": "Pas de téléphone au lit", "pt": "Sem celular na cama", "de": "Kein Handy im Bett", "tr": "Yatakta telefon yok", "hi": "बिस्तर पर फ़ोन नहीं", "ur": "بستر پر فون نہیں", "id": "Tanpa ponsel di kasur"}'::jsonb, 'deviceMobileSlash', 'indigo', 'night', 1, null, '{}'::jsonb, 6, false),
  ('sleep', 'Sleep by 11 pm', '{"ar": "نم قبل 11 مساءً", "es": "Dormir antes de las 11", "fr": "Dormir avant 23 h", "pt": "Dormir antes das 23h", "de": "Vor 23 Uhr schlafen", "tr": "23:00’te uyu", "hi": "रात 11 बजे तक सोएँ", "ur": "رات 11 بجے تک سوئیں", "id": "Tidur sebelum jam 11"}'::jsonb, 'moonStars', 'indigo', 'night', 1, null, '{}'::jsonb, 7, true)
on conflict (id) do update set
  name = excluded.name,
  translations = excluded.translations,
  icon = excluded.icon,
  color = excluded.color,
  time_of_day = excluded.time_of_day,
  target = excluded.target,
  unit = excluded.unit,
  unit_translations = excluded.unit_translations,
  sort_order = excluded.sort_order,
  auto_add = excluded.auto_add;

-- New user → profile (name/photo from sign-up or Google) + the auto_add starter habits,
-- named in the language the app sent at sign-up (falls back to English).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  lang text := coalesce(nullif(new.raw_user_meta_data ->> 'language', ''), 'en');
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ), 40),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  insert into public.habits (user_id, name, icon, color, time_of_day, target, unit, sort_order)
  select
    new.id,
    coalesce(nullif(s.translations ->> lang, ''), s.name),
    s.icon,
    s.color,
    s.time_of_day,
    s.target,
    coalesce(nullif(s.unit_translations ->> lang, ''), s.unit),
    s.sort_order
  from public.starter_habits s
  where s.auto_add and s.active
  order by s.sort_order;

  return new;
end;
$$;
