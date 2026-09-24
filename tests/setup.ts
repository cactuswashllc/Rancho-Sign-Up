// Point every test at the dedicated test database (never the dev DB).
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/signups_test";
process.env.ADMIN_EMAILS = "admin@example.com";
process.env.APP_URL = "http://localhost:3000";
delete process.env.RESEND_API_KEY;
delete process.env.VERCEL_ENV;
