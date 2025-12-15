const requiredEnvs = [
  'DATABASE_URL',
  'BOT_TOKEN', // Needed for auth validation
];

export function checkEnv() {
  const missing = requiredEnvs.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  BOT_TOKEN: process.env.BOT_TOKEN!,
};
