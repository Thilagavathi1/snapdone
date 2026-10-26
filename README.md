# SnapDone

**Turn screenshots into done.** Pick a screenshot of a bill, booking, ticket or schedule. SnapDone reads it on your phone, has a local Gemma model pull out the details, and after you confirm, creates a reminder, calendar event or task. No account, no cloud and no API keys. Screenshots never leave the device.

Built for the [DEV Hacktoberfest Open-Source AI Challenge, Week 3: "Slow and Steady"](https://dev.to/challenges/hacktoberfest-week3-2026-10-19).

## How it works

```
Screenshot ──► ML Kit OCR ──► Gemma 3 1B (llama.cpp) ──► Zod validation ──► Review ──► Reminder / Event / Task
   (photos)     on device      on device, JSON-constrained    strict schema     you confirm    expo-notifications / expo-calendar
```

1. **OCR on device.** Google ML Kit reads the text. SnapDone rebuilds it row by row from the text block positions, so a schedule card's date, title and time stay together.
2. **Local LLM.** Gemma 3 1B instruct (Q4_K_M GGUF, 806 MB, downloaded once) runs through [llama.rn](https://github.com/mybigday/llama.rn). Its output is constrained by a JSON schema.
3. **Strict validation.** Every answer is parsed and checked with Zod. If the output is invalid or missing, the app shows **Needs review** and switches to manual entry. It never guesses silently.
4. **You confirm.** Nothing is created until you tap the button. Reminders schedule local notifications (the day before and on the day). Events go to your calendar. Everything is saved in a local SQLite history.

## Tech

Expo SDK 58 · React Native 0.88 · TypeScript · Expo Router · Zustand · expo-sqlite · expo-notifications · expo-calendar · expo-image-picker · Reanimated · Zod · llama.rn · ML Kit text recognition

```
src/
  app/          Expo Router screens
  features/     onboarding, capture, review, actions, history, settings
  services/     ocr/, ai/ (prompt, schema, Gemma, mock), calendar/, notifications/, database/
  store/        Zustand stores
  components/   shared UI
```

The OCR and AI services sit behind small interfaces (`OcrService`, `LocalModel`), so the model can be swapped or mocked. **Demo mode** in Settings swaps in a mock OCR and model so the flow runs anywhere.

## Run it

Needs a development build. On-device OCR and llama.rn are native modules, so they don't run in Expo Go.

```bash
yarn install
npx expo run:android      # Android first; arm64 device recommended
```

On first launch, tap **Download** on the Home screen to fetch the Gemma model (806 MB, once). After that, everything works in airplane mode.

## Honest limitations

- Gemma 3 1B is small. It handles bills and single events well. On busy multi-item screenshots, it picks one item, and a text-based fallback fills in a date or time it missed.
- Speed depends on the phone. On a mid-range MediaTek Dimensity 700, one extraction takes several seconds to tens of seconds on the CPU.
- Gemma is open-weight under Google's Gemma Terms of Use. ML Kit is free and on-device but not open source.

## License

MIT
