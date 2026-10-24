/**
 * BUILD PLAN (the "mega prompt")
 * ==============================
 * Takes the ENTIRE user input from the profile form...
 *
 *   { currentRole, industry, yearsExperience, skills[], competencies[],
 *     targetSectors[], weeklyHours }   +   mode ("Moderate" | "Aggressive")
 *
 * ...plus the app's own catalogue (3 roles, 12 learning modules), and asks the
 * model to conclude:
 *
 *   1. which role fits this person best and why,
 *   2. how all three roles rank for them, with the honest skill gaps,
 *   3. an ordered learning pathway built ONLY from the curated modules.
 *
 * WHY THE CATALOGUE IS IN THE PROMPT
 * The domain rules say: "Every recommendation must cite a source, and the
 * system must not invent jobs, courses or statistics." So the model is given a
 * closed world to choose from. After it answers, every role id and module id is
 * checked against the catalogue and anything unknown is thrown away. The model
 * may sequence and explain; it may not invent.
 */

import { z } from "@workspace/api-zod";
import { logger } from "./logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PlanProfile = {
  currentRole: string;
  industry: string;
  yearsExperience: number;
  skills: string[];
  competencies: string[];
  targetSectors: string[];
  weeklyHours: number;
};

export type PlanModule = {
  id: string;
  title: string;
  skill: string;
  hours: number;
  prerequisites: readonly string[];
  provider: string;
  costNote: string;
};

export type PlanRole = {
  id: string;
  title: string;
  sector: string;
  summary: string;
  requiredSkills: readonly string[];
  transferableSkills: readonly string[];
  sdgTargets: readonly string[];
  outlook: string;
  disruptionExposure: number;
  learningPathway: readonly PlanModule[];
};

export type PlanRankingEntry = {
  roleId: string;
  roleTitle: string;
  /** The model's fit judgement. */
  fit: number;
  /** The app's deterministic score, shown next to it so any disagreement is visible. */
  appEstimate: number;
  reason: string;
  gaps: string[];
  sdgTargets: string[];
};

export type PlanPathwayStep = {
  moduleId: string;
  title: string;
  order: number;
  hours: number;
  why: string;
};

export type BuiltPlan = {
  recommendedRoleId: string;
  recommendedRoleTitle: string;
  headline: string;
  ranking: PlanRankingEntry[];
  pathway: PlanPathwayStep[];
  nextAction: string;
  caveat: string;
  model: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TIMEOUT_MS = 45_000;

export class PlanNotConfiguredError extends Error {
  constructor() {
    super("DEEPSEEK_API_KEY is not set");
    this.name = "PlanNotConfiguredError";
  }
}

export class PlanFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlanFailedError";
  }
}

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `You are a career-transition planner for the Malaysian workforce. You receive ONE person's profile and a fixed catalogue of roles and learning modules. You must conclude which role fits them best and what they should learn next.

Absolute rules:
- Output JSON only, no prose and no markdown.
- recommendedRoleId MUST be one of the provided role ids.
- Every pathway moduleId MUST come from the recommended role's learningPathway. Never invent a module, course, provider or URL.
- Never invent statistics, salaries, job counts or dates. You may only use numbers that appear in the input (years of experience, weekly hours, module hours).
- Reasons must cite the person's OWN skills or competencies by name. If they have none in common, say so plainly.
- Respect prerequisites: a module that depends on another should not be placed first.
- Fit is an integer 0-100 and must reflect THIS person's profile as a whole, including their stated current role, industry and target sectors.
- The provided deterministic scores are a sanity check computed from skills only. They do not see the person's stated role, industry or goals. If the profile supports a different ordering, follow the profile and explain the disagreement in the reason.
- Tone: direct, warm, no hype. This person is making a life decision.

Return exactly this shape:
{"recommendedRoleId":"","headline":"","ranking":[{"roleId":"","fit":0,"reason":"","gaps":[],"sdgTargets":[]}],"pathway":[{"moduleId":"","order":1,"why":""}],"nextAction":"","caveat":""}`;
}

function buildUserPrompt(
  profile: PlanProfile,
  mode: "Moderate" | "Aggressive",
  candidates: Array<{ roleId: string; score: number }>,
  roles: readonly PlanRole[],
): string {
  const catalogue = roles.map((role) => ({
    id: role.id,
    title: role.title,
    sector: role.sector,
    summary: role.summary,
    requiredSkills: role.requiredSkills,
    transferableSkills: role.transferableSkills,
    sdgTargets: role.sdgTargets,
    outlook: role.outlook,
    disruptionExposure: role.disruptionExposure,
    learningPathway: role.learningPathway.map((module) => ({
      id: module.id,
      title: module.title,
      skill: module.skill,
      hours: module.hours,
      prerequisites: module.prerequisites,
      provider: module.provider,
      costNote: module.costNote,
    })),
  }));

  return `PERSON PROFILE
${JSON.stringify(profile, null, 2)}

PLANNING SCENARIO
mode: ${mode}
${mode === "Aggressive"
    ? "Aggressive assumes an 18-month runway: prioritise speed, the shortest credible path to a new role."
    : "Moderate assumes a 4-year runway: prioritise durable foundations and depth."}
weekly learning hours available: ${profile.weeklyHours}

DETERMINISTIC FIT SCORES (already computed by the app; treat as a strong prior)
${JSON.stringify(candidates, null, 2)}

ROLE AND MODULE CATALOGUE (the only roles and modules you may use)
${JSON.stringify(catalogue, null, 2)}

Produce the JSON now.`;
}

// ---------------------------------------------------------------------------
// Lenient parsing + strict cleaning against the catalogue
// ---------------------------------------------------------------------------

const ModelOutputSchema = z.object({
  recommendedRoleId: z.coerce.string().catch(""),
  headline: z.coerce.string().catch(""),
  ranking: z
    .array(
      z.object({
        roleId: z.coerce.string().catch(""),
        fit: z.coerce.number().catch(0),
        reason: z.coerce.string().catch(""),
        gaps: z.array(z.coerce.string()).catch([]),
        sdgTargets: z.array(z.coerce.string()).catch([]),
      }),
    )
    .catch([]),
  pathway: z
    .array(
      z.object({
        moduleId: z.coerce.string().catch(""),
        order: z.coerce.number().catch(0),
        why: z.coerce.string().catch(""),
      }),
    )
    .catch([]),
  nextAction: z.coerce.string().catch(""),
  caveat: z.coerce.string().catch(""),
});

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function buildPlan(
  profile: PlanProfile,
  mode: "Moderate" | "Aggressive",
  candidates: Array<{ roleId: string; score: number }>,
  roles: readonly PlanRole[],
): Promise<BuiltPlan> {
  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) {
    throw new PlanNotConfiguredError();
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(profile, mode, candidates, roles) },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error({ status: response.status, detail: detail.slice(0, 300) }, "Plan request failed");
    throw new PlanFailedError(`Upstream model returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new PlanFailedError("Upstream model returned an empty response");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new PlanFailedError("Upstream model did not return valid JSON");
  }

  const parsed = ModelOutputSchema.parse(raw);

  // --- Clean against the catalogue -----------------------------------------
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const scoreById = new Map(candidates.map((candidate) => [candidate.roleId, candidate.score]));

  const ranking = parsed.ranking
    .filter((entry) => roleById.has(entry.roleId))
    .map((entry) => {
      const role = roleById.get(entry.roleId)!;
      const prior = scoreById.get(entry.roleId) ?? 50;
      return {
        roleId: role.id,
        roleTitle: role.title,
        // The model now owns the ranking. We keep its number inside a sane
        // range, and we send the app's own estimate alongside it so the UI can
        // show where the two disagree instead of hiding it.
        fit: clamp(Math.round(entry.fit), 15, 98),
        appEstimate: clamp(Math.round(prior), 0, 100),
        reason: entry.reason.trim().slice(0, 400),
        gaps: entry.gaps.slice(0, 6).map((gap) => gap.trim().slice(0, 80)).filter(Boolean),
        sdgTargets: role.sdgTargets.slice(0, 4),
      };
    })
    .sort((a, b) => b.fit - a.fit);

  const recommended =
    roleById.get(parsed.recommendedRoleId) ??
    (ranking.length > 0 ? roleById.get(ranking[0].roleId) : undefined);

  if (!recommended) {
    throw new PlanFailedError("Model did not return any role that exists in the catalogue");
  }

  // Pathway: only modules that belong to the recommended role, de-duplicated,
  // sorted by the model's order, then by hours for stability.
  const moduleById = new Map(recommended.learningPathway.map((module) => [module.id, module]));
  const seen = new Set<string>();
  const pathway: PlanPathwayStep[] = parsed.pathway
    .filter((step) => moduleById.has(step.moduleId) && !seen.has(step.moduleId) && seen.add(step.moduleId))
    .map((step) => {
      const module = moduleById.get(step.moduleId)!;
      return {
        moduleId: module.id,
        title: module.title,
        order: step.order,
        hours: module.hours,
        why: step.why.trim().slice(0, 300),
      };
    })
    .sort((a, b) => (a.order === b.order ? a.hours - b.hours : a.order - b.order))
    .map((step, index) => ({ ...step, order: index + 1 }));

  return {
    recommendedRoleId: recommended.id,
    recommendedRoleTitle: recommended.title,
    headline: parsed.headline.trim().slice(0, 240),
    ranking,
    pathway,
    nextAction: parsed.nextAction.trim().slice(0, 240),
    caveat: parsed.caveat.trim().slice(0, 300),
    model: MODEL,
    generatedAt: new Date().toISOString(),
  };
}
