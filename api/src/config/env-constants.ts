export const envConstants = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  paymentGateway: {
    baseUrl: process.env.PAYMENT_GATEWAY_API_URL,
    publicKey: process.env.PAYMENT_GATEWAY_PUBLIC_KEY,
    privateKey: process.env.PAYMENT_GATEWAY_PRIVATE_KEY,
    eventsKey: process.env.PAYMENT_GATEWAY_EVENTS_KEY,
    integrityKey: process.env.PAYMENT_GATEWAY_INTEGRITY_KEY,
  },
  unSplash: {
    baseUrl: process.env.UNSPLASH_API_URL,
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
  },
};
