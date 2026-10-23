/**
 * EXPLORE ROUTES
 * ==============
 * POST /api/explore
 *
 * Body: { "profile": { currentRole, industry, yearsExperience, skills[],
 *                      competencies[], targetSectors[] } }
 *
 * Returns up to three occupations that are NOT in the curated catalogue, each
 * with a checkable occupational reference and no invented numbers or links.
 * The UI labels them as exploratory; the sourced plan remains the default.
 */

import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import { exploreRoles, ExploreFailedError, ExploreNotConfiguredError } from "../lib/exploreRoles";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ExploreRequestSchema = z.object({
  profile: z.object({
    currentRole: z.string().max(200).catch(""),
    industry: z.string().max(200).catch(""),
    yearsExperience: z.coerce.number().catch(0),
    skills: z.array(z.string().max(80)).max(30).catch([]),
    competencies: z.array(z.string().max(80)).max(30).catch([]),
    targetSectors: z.array(z.string().max(80)).max(20).catch([]),
  }),
  lang: z.enum(["en", "bm"]).catch("en"),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;
const requestLog = new Map<string, number[]>();

function isRateLimited(callerKey: string, nowMs: number): boolean {
  const previous = requestLog.get(callerKey) ?? [];
  const withinWindow = previous.filter((timestamp) => nowMs - timestamp < WINDOW_MS);
  withinWindow.push(nowMs);
  requestLog.set(callerKey, withinWindow);

  if (requestLog.size > 500) {
    for (const [key, timestamps] of requestLog) {
      if (timestamps.every((timestamp) => nowMs - timestamp >= WINDOW_MS)) requestLog.delete(key);
    }
  }

  return withinWindow.length > MAX_REQUESTS_PER_WINDOW;
}

router.post("/explore", async (request, response) => {
  const callerKey = request.ip ?? "unknown";
  if (isRateLimited(callerKey, Date.now())) {
    response.status(429).json({ error: "rate_limited", message: "Too many explore requests. Please wait a few minutes." });
    return;
  }

  const parsedBody = ExploreRequestSchema.safeParse(request.body);
  if (!parsedBody.success) {
    response.status(400).json({ error: "invalid_input", message: "Invalid profile." });
    return;
  }

  const { profile } = parsedBody.data;
  if (profile.skills.length === 0 && profile.competencies.length === 0 && profile.currentRole.trim() === "") {
    response.status(400).json({
      error: "empty_profile",
      message: "Add a current role, a skill or a competency first.",
    });
    return;
  }

  try {
    const result = await exploreRoles({
      currentRole: profile.currentRole,
      industry: profile.industry,
      yearsExperience: Math.max(0, Math.min(60, profile.yearsExperience)),
      skills: profile.skills,
      competencies: profile.competencies,
      targetSectors: profile.targetSectors,
    }, parsedBody.data.lang);
    response.json(result);
  } catch (error) {
    if (error instanceof ExploreNotConfiguredError) {
      response.status(503).json({ error: "not_configured", message: "Exploration is not configured on this server yet." });
      return;
    }
    if (error instanceof ExploreFailedError) {
      logger.error({ err: error }, "POST /explore failed upstream");
      response.status(503).json({ error: "upstream_unavailable", message: "The model could not be reached." });
      return;
    }
    logger.error({ err: error }, "POST /explore failed unexpectedly");
    response.status(503).json({ error: "unexpected", message: "Something went wrong while exploring roles." });
  }
});

export default router;
