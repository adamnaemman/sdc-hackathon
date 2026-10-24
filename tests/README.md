# Tests

A single smoke test, because the interesting behaviour lives behind a language
model and cannot be asserted deterministically without mocking it — and a mocked
test would prove nothing about the product.

```bash
# terminal 1
pnpm --filter @workspace/api-server run dev

# terminal 2
node tests/smoke.mjs

# or point it at the deployment
API_URL=https://aura-workforce.replit.app node tests/smoke.mjs
```

It asserts that the API serves the shapes the client depends on: health, the five
curated roles, six sourced signals, and a dated trend snapshot. Exit code is
non-zero on failure, so it can gate a deploy.

What is deliberately **not** tested here: prompt quality, model determinism, and
fit scores. Those are validated at runtime by schema checks and by discarding
unknown identifiers — see `src/artifacts/api-server/src/lib/`.
