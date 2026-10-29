// Registers where pg_cron should send the Smart Delay "wake up" call, and the secret it sends.
// Local:   npm run db:dispatcher            (reads .env.local; the app runs on the host, port 3000)
// Hosted:  run once with SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / CRON_SECRET for that project and
//          DISPATCH_URL=https://tryclinton.com/api/cron/dispatch
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET } = process.env;
// From inside Docker, the host machine is host.docker.internal.
const DISPATCH_URL = process.env.DISPATCH_URL ?? "http://host.docker.internal:3000/api/cron/dispatch";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !CRON_SECRET) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or CRON_SECRET.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { error } = await supabase.rpc("configure_dispatcher", { p_url: DISPATCH_URL, p_secret: CRON_SECRET });
if (error) {
  console.error("Could not configure the dispatcher:", error.message);
  process.exit(1);
}
console.log(`Dispatcher configured: pg_cron will call ${DISPATCH_URL} every 20 seconds.`);
