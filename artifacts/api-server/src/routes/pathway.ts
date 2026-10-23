/**
 * PATHWAY ROUTES
 * ==============
 * POST /api/pathway
 *
 * Body: { roleTitle, skillsToBuild[], profileSummary }
 *
 * Returns an ordered study plan for ANY occupation the model proposed earlier.
 * Every step resolves to a course URL we verified in advance; the model only
 * chooses and sequences from that library. This is what lets an AI-proposed role
 * have a real pathway instead of "no pathway yet".
 */

import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import { roles } from "./workforce";
import { buildPathway, PathwayFailedError, PathwayNotConfiguredError, type VerifiedModule } from "../lib/buildPathway";
import { generalModules } from "../data/generalModules";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/** Flatten the curated pathways into one de-duplicated library of verified courses. */
const library: VerifiedModule[] = [];
const seenUrls = new Set<string>();
for (const role of roles) {
  for (const module of role.learningPathway) {
    if (seenUrls.has(module.url)) continue;
    seenUrls.add(module.url);
    library.push({
      id: module.id,
      title: module.title,
      skill: module.skill,
      hours: module.hours,
      provider: module.provider,
      url: module.url,
      costNote: module.costNote,
    });
  }
}

// General courses (design, project, data) are appended so an AI-proposed
// occupation outside the curated roles still has somewhere real to go.
for (const module of generalModules) {
  if (seenUrls.has(module.url)) continue;
  seenUrls.add(module.url);
  library.push(module);
}

const RequestSchema = z.object({
  roleTitle: z.string().trim().min(2).max(120),
  skillsToBuild: z.array(z.string().max(80)).max(8).catch([]),
  profileSummary: z.string().max(600).catch(""),
});

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
      if (timestamps.every((timestamp) => nowMs - timestamp >= WINDOW_MS)) requestLog.delete(key);
    }
  }

  return withinWindow.length > MAX_REQUESTS_PER_WINDOW;
}

router.post("/pathway", async (request, response) => {
  if (isRateLimited(request.ip ?? "unknown", Date.now())) {
    response.status(429).json({ error: "rate_limited", message: "Too many pathway requests. Please wait a few minutes." });
    return;
  }

  const parsedBody = RequestSchema.safeParse(request.body);
  if (!parsedBody.success) {
    response.status(400).json({ error: "invalid_input", message: "A role title is required." });
    return;
  }

  try {
    const pathway = await buildPathway(
      parsedBody.data.roleTitle,
      parsedBody.data.skillsToBuild,
      parsedBody.data.profileSummary,
      library,
    );
    response.json(pathway);
  } catch (error) {
    if (error instanceof PathwayNotConfiguredError) {
      response.status(503).json({ error: "not_configured", message: "Pathway generation is not configured." });
      return;
    }
    if (error instanceof PathwayFailedError) {
      logger.error({ err: error }, "POST /pathway failed upstream");
      response.status(503).json({ error: "upstream_unavailable", message: "The planner could not be reached." });
      return;
    }
    logger.error({ err: error }, "POST /pathway failed unexpectedly");
    response.status(503).json({ error: "unexpected", message: "Something went wrong while building the pathway." });
  }
});

export default router;
