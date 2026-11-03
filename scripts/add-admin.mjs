// Gives an existing Clinton AI user access to the founders console (/owner).
// They must have signed in to the product once (so the account exists). On their next visit to
// /owner they set up an authenticator app; after that every visit needs its code.
// Local:   npm run admin:add -- you@example.com            (reads .env.local)
// Hosted:  run with SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for that project.
// Remove:  npm run admin:add -- you@example.com --remove
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const [email, flag] = process.argv.slice(2);
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !email) {
  console.error(
    "Usage: npm run admin:add -- you@example.com [--remove]  (needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
let user = null;
for (let page = 1; !user; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw error;
  user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
  if (data.users.length < 1000) break;
}
if (!user) {
  console.error(`No account for ${email}. Sign in to Clinton AI with it once, then run this again.`);
  process.exit(1);
}

const { error } =
  flag === "--remove"
    ? await supabase.from("admins").delete().eq("user_id", user.id)
    : await supabase
        .from("admins")
        .upsert({ user_id: user.id, note: `added ${new Date().toISOString().slice(0, 10)}` });
if (error) {
  console.error("Could not update admins:", error.message);
  process.exit(1);
}
console.log(
  flag === "--remove"
    ? `${email} can no longer open the founders console.`
    : `${email} can now open /owner (after setting up an authenticator app).`,
);
