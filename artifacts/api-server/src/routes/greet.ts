/**
 * GET /api/greet?lang=en|bm
 * One short line from the guide character. Cached server-side for ten minutes.
 */

import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import { getGreeting } from "../lib/greeting";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const QuerySchema = z.object({ lang: z.enum(["en", "bm"]).catch("en") });

router.get("/greet", async (request, response) => {
  const parsed = QuerySchema.safeParse(request.query);
  const lang = parsed.success ? parsed.data.lang : "en";

  try {
    response.json(await getGreeting(lang));
  } catch (error) {
    logger.error({ err: error }, "GET /greet failed");
    response.status(503).json({ error: "unavailable", message: "The guide is quiet right now." });
  }
});

export default router;
