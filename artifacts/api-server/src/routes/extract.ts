/**
 * EXTRACT ROUTES
 * ==============
 * POST /api/extract
 *
 * Body: { "text": "I've been a procurement assistant for 7 years..." }
 * 200:  { currentRole, yearsExperience, skills[], competencies[], summary, model, extractedAt }
 * 400:  input was empty or too long
 * 429:  too many requests from this address
 * 503:  the model is not configured or unreachable (the UI falls back to manual entry)
 *
 * Why a rate limit on a small demo endpoint: the model call costs real money on
 * the team's own DeepSeek account, and this URL is public. 20 requests per
 * 10 minutes per address is plenty for a judge to try it several times.
 */

import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import {
  extractProfile,
  ExtractionFailedError,
  ExtractionNotConfiguredError,
} from "../lib/extractProfile";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RequestSchema = z.object({
  text: z
    .string()
    .trim()
    .min(20, "Please describe your work in at least 20 characters.")
    .max(4000, "Please keep the description under 4000 characters."),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

const requestLog = new Map<string, number[]>();

/** Returns true when this caller has exceeded the window. */
function isRateLimited(callerKey: string, nowMs: number): boolean {
  const previous = requestLog.get(callerKey) ?? [];
  const withinWindow = previous.filter((timestamp) => nowMs - timestamp < WINDOW_MS);
  withinWindow.push(nowMs);
  requestLog.set(callerKey, withinWindow);

  // Keep the map from growing without bound on a long-running server.
  if (requestLog.size > 500) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => nowMs - timestamp >= WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  return withinWindow.length > MAX_REQUESTS_PER_WINDOW;
}

router.post("/extract", async (request, response) => {
  const nowMs = Date.now();
  const callerKey = request.ip ?? "unknown";

  if (isRateLimited(callerKey, nowMs)) {
    response.status(429).json({
      error: "rate_limited",
      message: "Too many extraction requests. Please wait a few minutes and try again.",
    });
    return;
  }

  const parsedBody = RequestSchema.safeParse(request.body);
  if (!parsedBody.success) {
    response.status(400).json({
      error: "invalid_input",
      message: parsedBody.error.issues[0]?.message ?? "Invalid input.",
    });
    return;
  }

  try {
    const profile = await extractProfile(parsedBody.data.text);
    response.json(profile);
  } catch (error) {
    if (error instanceof ExtractionNotConfiguredError) {
      logger.warn("POST /extract called but DEEPSEEK_API_KEY is not set");
      response.status(503).json({
        error: "not_configured",
        message: "AI extraction is not configured on this server yet.",
      });
      return;
    }

    if (error instanceof ExtractionFailedError) {
      logger.error({ err: error }, "POST /extract failed upstream");
      response.status(503).json({
        error: "upstream_unavailable",
        message: "The model could not be reached. You can still fill in your profile manually.",
      });
      return;
    }

    logger.error({ err: error }, "POST /extract failed unexpectedly");
    response.status(503).json({
      error: "unexpected",
      message: "Something went wrong during extraction. Please use manual entry.",
    });
  }
});

export default router;
