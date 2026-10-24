/**
 * POST /api/help
 * Body: { question: string, lang?: 'en' | 'bm' }
 *
 * The in-app help assistant. Answers are constrained to the help text in
 * lib/helpAssistant.ts — it describes how the app works, never what jobs exist.
 */

import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import { answerHelpQuestion } from "../lib/helpAssistant";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RequestSchema = z.object({
  question: z.string().trim().min(2).max(400),
  lang: z.enum(["en", "bm"]).catch("en"),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 30;
const requestLog = new Map<string, number[]>();

function isRateLimited(callerKey: string, nowMs: number): boolean {
  const previous = (requestLog.get(callerKey) ?? []).filter((timestamp) => nowMs - timestamp < WINDOW_MS);
  previous.push(nowMs);
  requestLog.set(callerKey, previous);

  if (requestLog.size > 500) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => nowMs - timestamp >= WINDOW_MS)) requestLog.delete(key);
    }
  }

  return previous.length > MAX_REQUESTS;
}

router.post("/help", async (request, response) => {
  if (isRateLimited(request.ip ?? "unknown", Date.now())) {
    response.status(429).json({ error: "rate_limited", message: "Too many questions. Please wait a few minutes." });
    return;
  }

  const parsed = RequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "invalid_input", message: "A question is required." });
    return;
  }

  try {
    const result = await answerHelpQuestion(parsed.data.question, parsed.data.lang);
    response.json(result);
  } catch (error) {
    logger.error({ err: error }, "POST /help failed");
    response.status(503).json({ error: "unavailable", message: "The assistant could not answer just now." });
  }
});

export default router;
