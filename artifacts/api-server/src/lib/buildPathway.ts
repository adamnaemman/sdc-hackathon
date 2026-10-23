/**
 * VERIFIED PATHWAY FOR ANY AI-PROPOSED ROLE
 * =========================================
 * The AI proposes occupations that are outside our curated catalogue. Those have
 * no pathway, which is the honest limitation we kept stating. This endpoint
 * removes most of that limitation without inventing anything:
 *
 *   The model may ONLY choose modules from a library of courses whose URLs we
 *   actually fetched and verified (Microsoft Learn, Khan Academy, Kaggle,
 *   MIT OpenCourseWare, OpenLearn). It decides which ones, in what order, and
 *   why — but the title, provider, hours and link always come from our library.
 *
 * So "verified pathway" means: every step resolves to a real course page we have
 * checked, chosen and sequenced by the model for this specific occupation.
 * If the library has nothing relevant, the model must say so instead of padding.
 */

import { z } from "@workspace/api-zod";
import { logger } from "./logger";

export type VerifiedModule = {
  id: string;
  title: string;
  skill: string;
  hours: number;
  provider: string;
  url: string;
  costNote: string;
};

export type PathwayStep = {
  moduleId: string;
  title: string;
  skill: string;
  hours: number;
  provider: string;
  url: string;
  costNote: string;
  order: number;
  why: string;
};

export type BuiltPathway = {
  roleTitle: string;
  steps: PathwayStep[];
  totalHours: number;
  note: string;
  model: string;
  generatedAt: string;
};

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TIMEOUT_MS = 40_000;

export class PathwayNotConfiguredError extends Error {
  constructor() {
    super("DEEPSEEK_API_KEY is not set");
    this.name = "PathwayNotConfiguredError";
  }
}

export class PathwayFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathwayFailedError";
  }
}

function systemPrompt(): string {
  return `You plan a short, realistic study route for one person moving toward a named occupation.

Rules, all mandatory:
- Choose between 3 and 5 modules, ONLY from the provided library. Never invent a module, course, provider or URL.
- Order them so that foundations come before anything that depends on them.
- "why" is one sentence, maximum 25 words, and must refer to something in the person's profile or to the occupation itself.
- If the library contains nothing relevant to this occupation, return an empty list and explain that in "note". Returning fewer modules is correct; padding with irrelevant courses is a failure.
- Output JSON only, no markdown.

Return exactly:
{"steps":[{"moduleId":"","order":1,"why":""}],"note":""}`;
}

const ModelOutputSchema = z.object({
  steps: z
    .array(
      z.object({
        moduleId: z.coerce.string().catch(""),
        order: z.coerce.number().catch(0),
        why: z.coerce.string().catch(""),
      }),
    )
    .catch([]),
  note: z.coerce.string().catch(""),
});

export async function buildPathway(
  roleTitle: string,
  skillsToBuild: string[],
  profileSummary: string,
  library: readonly VerifiedModule[],
): Promise<BuiltPathway> {
  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) throw new PathwayNotConfiguredError();

  const userPrompt = `OCCUPATION THE PERSON IS AIMING FOR
${roleTitle}

SKILLS THE MODEL SAID THEY WOULD NEED
${JSON.stringify(skillsToBuild)}

WHO THEY ARE NOW
${profileSummary}

VERIFIED MODULE LIBRARY (the only courses you may use)
${JSON.stringify(
    library.map((module) => ({
      moduleId: module.id,
      title: module.title,
      skill: module.skill,
      hours: module.hours,
      provider: module.provider,
    })),
    null,
    2,
  )}

Return the JSON now.`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error({ status: response.status, detail: detail.slice(0, 300) }, "Pathway request failed");
    throw new PathwayFailedError(`Upstream model returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new PathwayFailedError("Upstream model returned an empty response");
  }

  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new PathwayFailedError("Upstream model did not return valid JSON");
  }

  const parsed = ModelOutputSchema.parse(raw);
  const byId = new Map(library.map((module) => [module.id, module]));
  const seen = new Set<string>();

  const steps: PathwayStep[] = parsed.steps
    .filter((step) => byId.has(step.moduleId) && !seen.has(step.moduleId) && seen.add(step.moduleId))
    .map((step) => {
      const module = byId.get(step.moduleId)!;
      return {
        moduleId: module.id,
        title: module.title,
        skill: module.skill,
        hours: module.hours,
        provider: module.provider,
        url: module.url,
        costNote: module.costNote,
        order: step.order,
        why: step.why.trim().slice(0, 240),
      };
    })
    .sort((a, b) => (a.order === b.order ? a.hours - b.hours : a.order - b.order))
    .slice(0, 5)
    .map((step, index) => ({ ...step, order: index + 1 }));

  return {
    roleTitle: roleTitle.slice(0, 120),
    steps,
    totalHours: steps.reduce((sum, step) => sum + step.hours, 0),
    note: parsed.note.trim().slice(0, 300),
    model: MODEL,
    generatedAt: new Date().toISOString(),
  };
}
