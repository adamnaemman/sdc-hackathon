import app from "./app";
import { logger } from "./lib/logger";

// The Replit artifact runner supplies PORT when it starts this service. It is
// defaulted here so the API can also be started from a plain shell, a CI
// runner, or another host without `PORT=... pnpm dev` every time.
const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
