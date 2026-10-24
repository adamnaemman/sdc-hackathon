/**
 * TREND ROUTES
 * ============
 * Exposes the trend snapshot as JSON.
 *
 *   GET /api/trends            -> cached snapshot (refresh at most every 6h)
 *   GET /api/trends?refresh=1  -> force a fresh fetch from the public source
 *
 * This is a read-only endpoint. It deliberately has no database: the source of
 * truth is the public job feed, and the snapshot carries its own source URL and
 * fetch timestamp so the UI can prove where the numbers came from.
 */

import { Router, type IRouter } from "express";
import { roles } from "./workforce";
import { getTrends } from "../lib/trends";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/trends", async (request, response) => {
  const force = request.query["refresh"] === "1";

  try {
    const snapshot = await getTrends(roles, { force });
    response.json(snapshot);
  } catch (error) {
    // 503 = "we depend on an upstream service and it is unavailable".
    // The UI shows its cached/marked-stale state instead of pretending to be live.
    logger.error({ err: error }, "GET /trends failed");
    response.status(503).json({
      error: "Trend source unavailable",
      message: "The public job feed could not be reached. Try again shortly.",
    });
  }
});

export default router;
