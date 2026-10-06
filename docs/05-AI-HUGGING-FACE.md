> **Status: shelved.** The AI Coach was removed from the app on 2026-10-06. This doc is kept for reference if it comes back.

# 05 · AI with Hugging Face

## What AI does in Lumo
| Feature | Where | Input | Output |
|---|---|---|---|
| **Coach chat** | Coach tab | User message + short stats context | Friendly reply (≤ 120 words), optional habit suggestions |
| **Habit suggestions** | New Habit sheet "✨ Suggest with AI" and Coach | A goal ("sleep better") | JSON list of 3 to 5 habits (name, icon, target, unit, frequency, reminder) |
| **Weekly summary** | Stats screen card | Last 7 days of per-habit completion | 2 to 3 sentences: one win, one weak spot, one tip |
| **Hero / onboarding art** | Build time only | Prompt in the Lumo style | PNGs saved in `assets/images/hero/` |

AI is **optional**. If it's turned off in Settings or there's no internet, the Coach shows a calm empty state and everything else still works.

---

## Architecture

```
App (services/ai.ts)
   │  POST https://<proxy>/coach   { type: 'chat'|'suggest'|'summary', payload, deviceId }
   ▼
Supabase Edge Function  server/functions/coach
   │  • holds HF_TOKEN (secret env var)
   │  • validates input + size limits
   │  • rate limits per deviceId (e.g. 30 chat / day, 5 suggest / day)
   │  • adds the system prompt (the app never sends its own)
   │  • calls Hugging Face, validates JSON output
   ▼
Hugging Face Inference Providers (OpenAI-compatible chat completions router)
```

### Security rules
1. **The HF token never goes in the app bundle.** Anyone can extract strings from an app.
2. The proxy URL is set in `app.json → extra.aiProxyUrl` and read with `expo-constants`.
3. The system prompts live **only on the server**, so they can be changed without an app update.
4. Send only what's needed: habit names and completion numbers. No personal info.
5. Show a one-time notice in the Coach saying messages are processed by an AI service.

### Why Supabase Edge Functions?
It has a free tier, secrets management, and Deno/TypeScript. It also gives us an easy path to accounts and sync later (v1.x), since it's the same platform. A Cloudflare Worker is a fine alternative.

---

## Models
Pick these at the start of Phase 7, because model availability on Inference Providers changes.

| Task | Model type | Selection criteria |
|---|---|---|
| Chat + summary | Small/medium instruct LLM (Qwen or Llama instruct family) | Fast (< 3s), cheap, good at short friendly text |
| Suggestions | Same model in **JSON mode / structured output** | Reliably returns valid JSON |
| Hero art | Text-to-image (FLUX-class) | Run once, offline, and commit the PNGs |

Keep the model ID in a server env var (`HF_CHAT_MODEL`) so it can be swapped without a release.

---

## Prompts (draft, stored server-side)

**Coach system prompt**
> You are Lumo, a calm, encouraging habit coach. Keep replies under 120 words, warm and practical. Never shame. Suggest at most 3 small, specific habits. When suggesting habits, also return them in the `suggestions` JSON field. You are not a doctor; for medical issues, suggest seeing a professional.

**Suggestion output schema**
```json
{ "suggestions": [
  { "name": "Drink water on waking", "icon": "drop", "target": 1, "unit": "glass",
    "frequency": { "type": "daily" }, "reminder": { "hour": 7, "minute": 0 } }
]}
```
The server checks that `icon` is in the allowed icon list and falls back to `sparkle` if it isn't.

**Weekly summary prompt input**
```json
{ "week": "2026-10-05", "habits": [ { "name": "Read", "done": 4, "due": 7 } ], "bestDay": "Thu" }
```

---

## App-side behavior
- `coachStore` keeps the last 50 messages on the device.
- The weekly summary is cached per week key and only refetched once a new week starts.
- 15s timeout. On error, show a friendly bubble with a "Try again" button.
- A typing indicator (three animated dots) shows while waiting.
- Suggestion cards have a "+" button that calls `habitStore.add()` directly, plus haptic success feedback.

## Hero art generation (one-time)
Style prompt base: *"soft minimal 3D illustration, indigo and lavender gradient light, glassy translucent shapes, clean white background glow, calm, premium, no text"*.
Subjects: a glowing flame (streak), a sunrise over a calm horizon (morning), a stack of books (reading), a water drop (hydration), a crescent moon (sleep).
Export at 1024px, compress, and save to `assets/images/hero/`.

## Cost control
- Rate limits per device on the proxy
- Short context: send stats, not full history
- Cache summaries
- Later: Lumo Pro raises the limits
