-- Supabase exposes the public schema through its Data API (anon/authenticated
-- roles). The app only connects through Prisma as the table owner, so enabling
-- RLS with no policies blocks the API roles without affecting the app.
ALTER TABLE "Organizer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MagicLinkToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Signup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SignupItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RateLimitHit" ENABLE ROW LEVEL SECURITY;
