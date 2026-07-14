# Credit Card Payment Checkout

Monorepo for a coffee shop credit card payment checkout experience.

- `app/` — Expo React Native mobile app (Redux, encrypted transaction storage, Jest tests)
- `api/` — NestJS backend API (hexagonal architecture, Postgres, payment gateway integration)

## Architecture

High-level view of the system and how each component communicates.

```mermaid
flowchart TB
  subgraph client [Client]
    mobileApp["Expo React Native app<br/>(Redux + expo-router)"]
  end

  subgraph aws [AWS us-east-1]
    eb["Elastic Beanstalk<br/>(Docker single-instance)"]
    api["NestJS API<br/>/api + /docs"]
    rds["RDS PostgreSQL<br/>db.t4g.micro"]
    eb --> api
    api -->|"TypeORM (5432, SSL)"| rds
  end

  subgraph external [External services]
    gateway["Payment Gateway<br/>(Wompi sandbox)"]
    unsplash["Unsplash API<br/>(product images)"]
  end

  mobileApp -->|"REST over HTTP/HTTPS /api"| eb
  api -->|"card tokenization + payments"| gateway
  api -->|"seed product catalog"| unsplash
```

Request flow for a purchase:

```mermaid
sequenceDiagram
  participant U as Mobile app
  participant A as NestJS API
  participant P as Payment Gateway
  participant D as PostgreSQL

  U->>A: GET /api/products
  A->>D: query catalog
  U->>A: POST /api/transactions/init-transaction
  A->>D: create PENDING transaction
  U->>A: POST /api/transactions/finish-transaction
  A->>P: process card payment
  P-->>A: APPROVED / REJECTED
  A->>D: update transaction status
  A-->>U: transaction result
```

## Mobile app screenshots

| Screen           | Description                                | Screenshot                                              |
| ---------------- | ------------------------------------------ | ------------------------------------------------------- |
| Home             | Product catalog with search and pagination | ![Home](screenshots/app/home-1.png)                     |
| Home (search)    | Filtered product list                      | ![Home search](screenshots/app/home-2.png)              |
| Home (sort)      | Sorted product list                        | ![Home sort](screenshots/app/home-3.png)                |
| Product detail   | Coffee details and checkout entry          | ![Product detail](screenshots/app/detail.png)           |
| Presigned        | Document acceptance before payment         | ![Presigned](screenshots/app/presigned.png)             |
| Payment form     | Credit card input and validation           | ![Payment form](screenshots/app/form.png)               |
| Payment summary  | Order review before confirming             | ![Payment summary](screenshots/app/payment-summary.png) |
| Payment pending  | Transaction processing state               | ![Payment pending](screenshots/app/pay-pending.png)     |
| Payment approved | Successful transaction                     | ![Payment approved](screenshots/app/pay-approved.png)   |
| Payment rejected | Failed transaction                         | ![Payment rejected](screenshots/app/pay-rejected.png)   |

## Quick start

### 1. Backend API

```bash
cd api
cp .env.example .env
docker compose up -d postgres
npm install
npm run migration:run
npm run start:dev
```

API: `http://localhost:3000/api`  
Swagger: `http://localhost:3000/docs`

### 2. Mobile app

```bash
cd app
cp .env.example .env
# Set EXPO_PUBLIC_API_URL=http://<your-ip>:3000/api for physical devices
npm install
npm start
```

## Test coverage

### Mobile (`app/`)

```bash
cd app
npm test
npm run test:cov
```

![Mobile test coverage](screenshots/app-test-cov.png)

### Backend (`api/`)

```bash
cd api
npm test
npm run test:cov
```


![API test coverage](screenshots/api-test-cov.png)

## Docker (full stack)

```bash
cd api
docker compose up --build
```

## Android APK build

For a local APK (requires Android SDK):

```bash
cd app
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

The release APK is generated at `android/app/build/outputs/apk/release/`.

## Project structure

```
credit_card_payment_checkout/
├── app/          # Expo mobile app
├── api/          # NestJS API
└── README.md
```

## Environment variables

See `api/.env.example` and `app/.env.example`.

Payment gateway credentials use neutral `PAYMENT_GATEWAY_*` variable names.

## Documentation

### Project docs

- [Backend API README](api/README.md) — setup, endpoints, AWS deploy
- [Mobile app README](app/README.md) — setup, features, APK build
- [APK builds README](builds/README.md) — local release build steps
- Live Swagger / OpenAPI: `http://payment-checkout-api-dev.eba-bpgvahsh.us-east-1.elasticbeanstalk.com/docs`

### External references

- [NestJS](https://docs.nestjs.com/) · [TypeORM](https://typeorm.io/) · [PostgreSQL](https://www.postgresql.org/docs/)
- [Expo (v57)](https://docs.expo.dev/versions/v57.0.0/) · [React Native](https://reactnative.dev/docs/getting-started) · [expo-router](https://docs.expo.dev/router/introduction/) · [Redux Toolkit](https://redux-toolkit.js.org/)
- [Wompi payment gateway](https://docs.wompi.co/) · [Unsplash API](https://unsplash.com/documentation)
- [AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/) · [Amazon RDS for PostgreSQL](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
