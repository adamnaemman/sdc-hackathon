/**
 * Test client for POST /api/plan.
 *
 * Why this file exists: typing a 500-byte JSON blob into a browser terminal by
 * hand loses characters. This script reads `plan-payload.json` next to it and
 * POSTs it, so the only thing anyone has to type is:
 *
 *     node scripts/test-plan.mjs
 *
 * Optional: override the target with  PLAN_URL=http://localhost:8080/api/plan
 */

import { readFile } from "node:fs/promises";

const payloadUrl = new URL("./plan-payload.json", import.meta.url);
const targetUrl = process.env.PLAN_URL ?? "http://localhost:8080/api/plan";

const body = await readFile(payloadUrl, "utf8");

// Fail loudly if the payload file itself is malformed, before blaming the API.
try {
  JSON.parse(body);
} catch (error) {
  console.error("plan-payload.json is not valid JSON:", error.message);
  process.exit(1);
}

console.log(`POST ${targetUrl}`);
const startedAt = Date.now();

let response;
try {
  response = await fetch(targetUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
} catch (error) {
  console.error(`\nCould not reach the API: ${error.message}`);
  console.error("Is the server running?  PORT=8080 pnpm --filter @workspace/api-server run dev");
  process.exit(1);
}

const elapsed = Date.now() - startedAt;
const text = await response.text();

console.log(`HTTP ${response.status} in ${elapsed} ms\n`);

try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  // Express returns an HTML error page for malformed bodies / 404 routes.
  console.log(text.slice(0, 600));
}

if (!response.ok) {
  process.exit(1);
}
