# SpeakEasy USA

A warm, mobile-first travel companion for Korean speakers visiting the United States. Select what you want to say in Korean, hear natural English, or show a large English sentence to another person. No microphone, quizzes, account, or backend is needed.

## Run

Use Node.js 24 (Node 20.19+ is supported).

```sh
cd /workspace/MomisLearningEnglish
npm ci --cache /workspace/.npm-cache --no-audit --no-fund
npm run dev -- --port 5173 --strictPort
```

## Validate

```sh
npm test
npm run build
npm run test:e2e
```

Browser tests cover desktop and mobile, sentence building, simulated speech API calls, phrase display, favorites persistence, every destination, and all five conversations. The cloud environment includes Chromium at `/usr/bin/chromium`, which the Playwright configuration uses. For another machine, adjust the browser executable or use a Playwright-installed browser.

## Features

- Nine destinations: airport, immigration, café, restaurant, shopping, souvenirs, hotel, transportation, emergency help.
- Café order builder with temperature, size, milk, extras, and takeaway choices.
- Restaurant table, reservation name, meal, requests, problems, payment, and takeaway flows.
- Immigration purpose, stay length, accommodation, and common officer questions.
- Shopping item, size, and gift choices.
- Listening phrases and interactive conversations for immigration, café, restaurant, hotel, and shopping.
- Normal/slow American English browser text-to-speech, large phrase display, and local favorites grouped by destination.
- Locally bundled fonts, custom SVG illustrations, responsive layouts, keyboard-accessible dialogs, and reduced-motion support.

Favorites stay in the current browser's local storage and do not sync between devices. Speech availability and sound depend on the browser/device and installed English voices; automated tests verify the speech requests, not audible playback. Use the large display when speech is unavailable. Emergency calling uses the device's telephone handler. Immigration answers should reflect the traveler's actual circumstances.

Production output is in `dist/`; deploy it to any static web host. This prototype has not been deployed and does not promise full offline operation.
