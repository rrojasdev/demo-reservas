export const timeZone = 'America/Bogota';
export const port = Number(process.env.PORT ?? 3000);
export const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;
export const databasePath = process.env.DATABASE_PATH ?? 'db/padel.db';
export const isProduction = process.env.NODE_ENV === 'production';
