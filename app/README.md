# Mobile App

Expo React Native coffee checkout app with Redux, encrypted transaction persistence, and full payment flow.

## Architecture

The UI is built with `expo-router` screens. State lives in a Redux store that is
persisted (encrypted) via `redux-persist` + `expo-secure-store`. A thin API layer
talks to the backend using `EXPO_PUBLIC_API_URL`.

```mermaid
flowchart TB
  subgraph ui [UI layer]
    screens["Screens / navigation<br/>(expo-router)"]
  end

  subgraph state [State layer]
    store["Redux store<br/>(slices)"]
    persist["redux-persist<br/>+ expo-secure-store"]
    store --> persist
  end

  subgraph data [Data layer]
    apiClient["API client<br/>(EXPO_PUBLIC_API_URL)"]
  end

  screens --> store
  screens --> apiClient
  apiClient -->|"REST /api"| backend["NestJS API"]
```

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



18 test suites, 74 tests passed. Coverage is scoped to business logic in `src/modules`, `src/store`, and `src/formatters`.

![Mobile test coverage](../screenshots/app-test-cov.png)

## Features

- Product catalog with search, sort, and pagination
- Presigned document acceptance + credit card checkout
- Card validation (Luhn, expiry, CVV, Visa/Mastercard detection with logos)
- Encrypted transaction persistence via `expo-secure-store` + `redux-persist`
- Dedicated transaction status screen at `/transaction/status`
- Responsive layout with `MaxContentWidth` (800px) for tablets/desktop web

## Screenshots

| Screen | Description | Screenshot |
| ------ | ----------- | ---------- |
| Home | Product catalog with search and pagination | ![Home](../screenshots/app/home-1.png) |
| Home (search) | Filtered product list | ![Home search](../screenshots/app/home-2.png) |
| Home (sort) | Sorted product list | ![Home sort](../screenshots/app/home-3.png) |
| Product detail | Coffee details and checkout entry | ![Product detail](../screenshots/app/detail.png) |
| Presigned | Document acceptance before payment | ![Presigned](../screenshots/app/presigned.png) |
| Payment form | Credit card input and validation | ![Payment form](../screenshots/app/form.png) |
| Payment summary | Order review before confirming | ![Payment summary](../screenshots/app/payment-summary.png) |
| Payment pending | Transaction processing state | ![Payment pending](../screenshots/app/pay-pending.png) |
| Payment approved | Successful transaction | ![Payment approved](../screenshots/app/pay-approved.png) |
| Payment rejected | Failed transaction | ![Payment rejected](../screenshots/app/pay-rejected.png) |

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

## Documentation

- [Root project README](../README.md) — system architecture overview
- [Backend API README](../api/README.md) — endpoints consumed by this app

### Frameworks & tools

- [Expo (v57)](https://docs.expo.dev/versions/v57.0.0/) — versioned SDK docs
- [expo-router](https://docs.expo.dev/router/introduction/) — file-based navigation
- [React Native](https://reactnative.dev/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/) · [redux-persist](https://github.com/rt2zz/redux-persist)
- [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) — encrypted persistence
- [EAS Build](https://docs.expo.dev/build/introduction/) — cloud builds (see `eas.json`)
