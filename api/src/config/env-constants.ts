export const envConstants = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  wompi: {
    baseUrl: process.env.WOMPI_API_URL,
    publicKey: process.env.WOMPI_PUBLIC_KEY,
    privateKey: process.env.WOMPI_PRIVATE_KEY,
    eventsKey: process.env.WOMPI_EVENTS_KEY,
    integrityKey: process.env.WOMPI_INTEGRITY_KEY,
  },
  unSplash: {
    baseUrl: process.env.UNSPLASH_API_URL,
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
  },
};
