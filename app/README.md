# Mobile App

Expo React Native coffee checkout app with Redux, encrypted transaction persistence, and full payment flow.

## Requirements

- Node.js 24+
- Expo CLI
- Backend API running (see `../api/README.md`)

## Setup

```bash
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` in `.env`:

- ios:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

- android:

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

Use your machine LAN IP instead of `localhost` when testing on a physical device.

## Run

```bash
npm start
npm run android
npm run ios
```

## Tests

```bash
npm test
npm run test:cov
```

### Coverage results

| Metric     | Coverage |
| ---------- | -------- |
| Statements | 97.83%   |
| Branches   | 84.21%   |
| Functions  | 100%     |
| Lines      | 97.79%   |

Coverage is scoped to business logic in `src/modules`, `src/store`, and `src/formatters`.

## Features

- Product catalog with search, sort, and pagination
- Presigned document acceptance + credit card checkout
- Card validation (Luhn, expiry, CVV, Visa/Mastercard detection with logos)
- Encrypted transaction persistence via `expo-secure-store` + `redux-persist`
- Dedicated transaction status screen at `/transaction/status`
- Responsive layout with `MaxContentWidth` (800px) for tablets/desktop web

## Build APK

### Local build

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## Project scripts

| Script             | Description                    |
| ------------------ | ------------------------------ |
| `npm start`        | Start Expo dev server          |
| `npm run android`  | Run on Android emulator/device |
| `npm run ios`      | Run on iOS simulator/device    |
| `npm test`         | Run Jest unit tests            |
| `npm run test:cov` | Run tests with coverage report |
| `npm run lint`     | Run ESLint                     |
