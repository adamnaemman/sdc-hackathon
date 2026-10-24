/**
 * Smoke test for a running API.
 *
 *   pnpm --filter @workspace/api-server run dev      # in another terminal
 *   node tests/smoke.mjs
 *   API_URL=https://aura-workforce.replit.app node tests/smoke.mjs
 *
 * It checks shapes, not business logic: that the contract the client relies on is
 * actually being served. Exit code is non-zero if anything fails.
 */

const BASE = (process.env.API_URL ?? "http://localhost:8080").replace(/\/$/, "");

let failures = 0;

async function check(name, run) {
  try {
    await run();
    console.log(`  ok    ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL  ${name} — ${error.message}`);
  }
}

async function get(path) {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${path}`);
  return response.json();
}

console.log(`smoke: ${BASE}`);

await check("health endpoint reports ok", async () => {
  const body = await get("/api/healthz");
  if (body.status !== "ok") throw new Error(`unexpected status: ${JSON.stringify(body)}`);
});

await check("workforce roles are served", async () => {
  const body = await get("/api/workforce/roles");
  if (!Array.isArray(body) || body.length < 5) throw new Error("expected at least five roles");
  const role = body[0];
  for (const field of ["id", "title", "requiredSkills", "learningPathway"]) {
    if (!(field in role)) throw new Error(`role is missing ${field}`);
  }
});

await check("market signals carry a source", async () => {
  const body = await get("/api/workforce/signals");
  if (!Array.isArray(body) || body.length < 6) throw new Error("expected at least six signals");
  for (const signal of body) {
    if (!signal.sourceName || !signal.sourceUrl) throw new Error(`signal ${signal.id} has no source`);
  }
});

await check("live trend snapshot has a sample", async () => {
  const body = await get("/api/trends");
  if (typeof body.sampleSize !== "number" || body.sampleSize <= 0) throw new Error("empty sample");
  if (!Array.isArray(body.topSkills) || body.topSkills.length === 0) throw new Error("no top skills");
  if (!body.sourceUrl || !body.fetchedAt) throw new Error("snapshot is not dated");
});

await check("occupation library answers a skill query", async () => {
  const body = await get("/api/library?skills=SQL");
  if (!body || typeof body !== "object") throw new Error("unexpected library payload");
});

console.log(failures === 0 ? "all checks passed" : `${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
