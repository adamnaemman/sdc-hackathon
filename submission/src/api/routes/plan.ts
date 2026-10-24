/**
 * PLAN ROUTES
 * ===========
 * POST /api/plan
 *
 * Body: the whole profile form + the planning scenario + the app's current
 *       deterministic fit scores.
 *
 *   {
 *     "profile": { "currentRole": "...", "industry": "...", "yearsExperience": 7,
 *                  "skills": [...], "competencies": [...],
 *                  "targetSectors": [...], "weeklyHours": 6 },
 *     "mode": "Moderate" | "Aggressive",
 *     "candidates": [{ "roleId": "ai-operations", "score": 82 }, ...]
 *   }
 *
 * 200: the recommendation, the ranking with reasons and gaps, the ordered
 *      pathway, and the model's own caveat.
 * 400: malformed input.
 * 429: too many requests from this address.
 * 503: model not configured or unreachable — the UI keeps the deterministic view.
 */

import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import { roles } from "./workforce";
import { buildPlan, PlanFailedError, PlanNotConfiguredError } from "../lib/buildPlan";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PlanRequestSchema = z.object({
  profile: z.object({
    currentRole: z.string().max(200).catch(""),
    industry: z.string().max(200).catch(""),
    yearsExperience: z.coerce.number().catch(0),
    skills: z.array(z.string().max(80)).max(30).catch([]),
    competencies: z.array(z.string().max(80)).max(30).catch([]),
    targetSectors: z.array(z.string().max(80)).max(20).catch([]),
    weeklyHours: z.coerce.number().catch(6),
  }),
  mode: z.enum(["Moderate", "Aggressive"]).catch("Moderate"),
  candidates: z
    .array(z.object({ roleId: z.string(), score: z.coerce.number() }))
    .max(10)
    .optional(),
});

// Same policy as /api/extract: the model call costs the team real money and
// this URL is public. Deliberately simple; see extract.ts for the rationale.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestLog = new Map<string, number[]>();

function isRateLimited(callerKey: string, nowMs: number): boolean {
  const previous = requestLog.get(callerKey) ?? [];
  const withinWindow = previous.filter((timestamp) => nowMs - timestamp < WINDOW_MS);
  withinWindow.push(nowMs);
  requestLog.set(callerKey, withinWindow);

  if (requestLog.size > 500) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => nowMs - timestamp >= WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  return withinWindow.length > MAX_REQUESTS_PER_WINDOW;
}

router.post("/plan", async (request, response) => {
  const callerKey = request.ip ?? "unknown";
  if (isRateLimited(callerKey, Date.now())) {
    response.status(429).json({
      error: "rate_limited",
      message: "Too many plan requests. Please wait a few minutes.",
    });
    return;
  }

  const parsedBody = PlanRequestSchema.safeParse(request.body);
  if (!parsedBody.success) {
    response.status(400).json({
      error: "invalid_input",
      message: parsedBody.error.issues[0]?.message ?? "Invalid profile.",
    });
    return;
  }

  const { profile, mode } = parsedBody.data;

  // A prompt with no skills and no role is not a plan request, it is an empty
  // form. Reject it so the user gets a clear message instead of a generic plan.
  if (profile.skills.length === 0 && profile.competencies.length === 0 && profile.currentRole.trim() === "") {
    response.status(400).json({
      error: "empty_profile",
      message: "Add at least a current role, one skill, or one competency first.",
    });
    return;
  }

  // Fall back to neutral priors if the client did not send its scores, so the
  // model always receives the same shape of input.
  const candidates =
    parsedBody.data.candidates && parsedBody.data.candidates.length > 0
      ? parsedBody.data.candidates
      : roles.map((role) => ({ roleId: role.id, score: 50 }));

  try {
    const plan = await buildPlan(
      {
        currentRole: profile.currentRole,
        industry: profile.industry,
        yearsExperience: Math.max(0, Math.min(60, profile.yearsExperience)),
        skills: profile.skills,
        competencies: profile.competencies,
        targetSectors: profile.targetSectors,
        weeklyHours: Math.max(1, Math.min(40, profile.weeklyHours)),
      },
      mode,
      candidates,
      roles,
    );

    response.json(plan);
  } catch (error) {
    if (error instanceof PlanNotConfiguredError) {
      logger.warn("POST /plan called but DEEPSEEK_API_KEY is not set");
      response.status(503).json({
        error: "not_configured",
        message: "AI planning is not configured on this server yet.",
      });
      return;
    }

    if (error instanceof PlanFailedError) {
      logger.error({ err: error }, "POST /plan failed upstream");
      response.status(503).json({
        error: "upstream_unavailable",
        message: "The planner could not be reached. Your deterministic results are still available.",
      });
      return;
    }

    logger.error({ err: error }, "POST /plan failed unexpectedly");
    response.status(503).json({
      error: "unexpected",
      message: "Something went wrong while building the plan.",
    });
  }
});

export default router;
