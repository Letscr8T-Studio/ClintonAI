// Smoke test for a deployed Clinton AI: what an outsider can see should be exactly right.
// Usage: npm run deploy:verify -- https://tryclinton.com
// Read-only, except one unsigned webhook POST and one dispatcher POST without the secret
// (both must be refused). Exit code 1 if any check fails.
const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage: npm run deploy:verify -- https://tryclinton.com");
  process.exit(1);
}

const results = [];
async function check(name, run) {
  try {
    const problem = await run();
    results.push([problem ? "✗" : "✓", name, problem ?? ""]);
  } catch (error) {
    results.push(["✗", name, error instanceof Error ? error.message : String(error)]);
  }
}
const get = (path, init = {}) => fetch(base + path, { redirect: "manual", ...init });
const expect = (cond, message) => (cond ? null : message);

await check("home page loads with security headers", async () => {
  const res = await get("/");
  const h = res.headers;
  const csp = h.get("content-security-policy") ?? "";
  return (
    expect(res.status === 200, `status ${res.status}`) ??
    expect(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/.test(csp), "CSP missing or without a nonce") ??
    expect(!/unsafe-eval/.test(csp), "CSP allows eval (a dev setting reached production)") ??
    expect(/frame-ancestors 'none'/.test(csp), "CSP allows framing") ??
    expect((h.get("strict-transport-security") ?? "").includes("max-age="), "no HSTS") ??
    expect(h.get("x-content-type-options") === "nosniff", "no nosniff") ??
    expect(!h.get("x-powered-by"), "X-Powered-By is exposed")
  );
});
await check("a fresh CSP nonce per request", async () => {
  const [a, b] = await Promise.all([get("/"), get("/")]);
  return expect(
    a.headers.get("content-security-policy") !== b.headers.get("content-security-policy"),
    "same nonce twice",
  );
});
await check("robots and sitemap", async () => {
  const robots = await (await get("/robots.txt")).text();
  const sitemap = await (await get("/sitemap.xml")).text();
  return (
    expect(robots.includes("Disallow: /owner"), "robots.txt doesn't hide /owner") ??
    expect(sitemap.includes(`${base}/privacy`), "sitemap has no /privacy (is NEXT_PUBLIC_SITE_URL this URL?)")
  );
});
await check("privacy policy (with Google's Limited Use statement) and terms", async () => {
  const privacy = await get("/privacy");
  const terms = await get("/terms");
  return (
    expect(
      privacy.status === 200 && (await privacy.text()).includes("including the Limited Use requirements"),
      "privacy page wrong",
    ) ?? expect(terms.status === 200, `terms status ${terms.status}`)
  );
});
await check("sign-in page loads", async () => expect((await get("/login")).status === 200, "login not 200"));
await check("signed-in pages send visitors to sign in", async () => {
  for (const path of ["/dashboard", "/compose", "/owner/dashboard"]) {
    const res = await get(path);
    const to = res.headers.get("location") ?? "";
    if (![302, 303, 307, 308].includes(res.status) || !to.includes("/login"))
      return `${path}: ${res.status} → ${to}`;
  }
  return null;
});
await check("founders export refuses visitors", async () =>
  expect((await get("/api/owner/export")).status === 401, "export not 401"),
);
await check("dispatcher refuses calls without the secret", async () =>
  expect((await get("/api/cron/dispatch", { method: "POST" })).status === 401, "dispatcher not 401"),
);
await check("Tally webhook refuses unsigned calls", async () => {
  const res = await get("/api/webhooks/tally", { method: "POST", body: "{}" });
  if (res.status === 503) return "TALLY_SIGNING_SECRET isn't set in Vercel";
  return expect(res.status === 401, `status ${res.status}`);
});
await check("Likely opened pixel answers with an image", async () => {
  const res = await get(`/api/o/${"x".repeat(43)}`);
  return expect(
    res.status === 200 && res.headers.get("content-type") === "image/gif",
    `status ${res.status}`,
  );
});
await check("social preview image", async () => {
  const res = await get("/opengraph-image");
  return expect(
    res.status === 200 && (res.headers.get("content-type") ?? "").startsWith("image/"),
    `status ${res.status}`,
  );
});

for (const [mark, name, note] of results) console.log(`${mark} ${name}${note ? `: ${note}` : ""}`);
const failed = results.filter(([m]) => m === "✗").length;
console.log(failed ? `\n${failed} check(s) failed.` : `\nAll ${results.length} checks passed for ${base}.`);
process.exit(failed ? 1 : 0);
