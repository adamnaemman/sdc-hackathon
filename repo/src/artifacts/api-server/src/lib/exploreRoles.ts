/**
 * EXPLORE BEYOND THE CATALOGUE
 * ============================
 * The curated five roles are the *verified* tier: real pathways, checked course
 * links, SDG tags. This endpoint is the second tier: the model may propose
 * occupations that are NOT in that catalogue, so a nurse or a graphic designer
 * is not told their only options are procurement roles.
 *
 * How it stays inside the rules ("must not invent jobs, courses or statistics"):
 *
 *   - No numbers. No salaries, growth rates, vacancy counts or dates are
 *     permitted, because we cannot source them for an arbitrary role.
 *   - No course names and no URLs. The model writes *topics* and one concrete
 *     first action; any link it tries to produce is stripped before it leaves
 *     the server.
 *   - Every proposal must name the official occupational reference a reader
 *     could use to verify the role exists (O*NET-SOC code, BLS OOH title,
 *     MASCO group). If it cannot name one, it must omit the role.
 *   - The UI labels the whole block as exploratory and unverified, and keeps it
 *     visually separate from the sourced plan.
 */

import { z } from "@workspace/api-zod";
import { logger } from "./logger";

export type ExploreProfile = {
  currentRole: string;
  industry: string;
  yearsExperience: number;
  skills: string[];
  competencies: string[];
  targetSectors: string[];
};

export type ExploredRole = {
  title: string;
  sector: string;
  reason: string;
  skillsToBuild: string[];
  firstStep: string;
  /** The public classification the reader can check, e.g. "BLS OOH — Registered Nurses". */
  occupationSource: string;
  confidence: "high" | "medium" | "low";
};

export type ExploreResult = {
  roles: ExploredRole[];
  note: string;
  model: string;
  generatedAt: string;
};

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TIMEOUT_MS = 40_000;

export class ExploreNotConfiguredError extends Error {
  constructor() {
    super("DEEPSEEK_API_KEY is not set");
    this.name = "ExploreNotConfiguredError";
  }
}

export class ExploreFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExploreFailedError";
  }
}

const SYSTEM_PROMPT = `You are a career-transition researcher for the Malaysian labour market, helping one person see occupations that fit them.

Rules, all mandatory:
- Propose at most 3 occupations. Fewer is better than a weak guess.
- The occupation must be a real, established occupation that appears in an official classification. For each, "occupationSource" MUST name the reference a reader could check, for example: "BLS OOH - Registered Nurses" or "O*NET-SOC 29-1141.00" or "MASCO 2020 - Nursing professionals". If you cannot name one confidently, omit that occupation entirely.
- NEVER include numbers: no salaries, no growth percentages, no vacancy counts, no dates.
- NEVER include course names, providers or links. Describe skills and a first step only.
- "reason" must cite the person's own skills or competencies by name and explain why they transfer.
- "firstStep" is one concrete action the person can take this week without paying for anything.
- "confidence" is "high" only when the occupation clearly exists and the overlap is strong.
- Output JSON only, no markdown.

Return exactly:
{"roles":[{"title":"","sector":"","reason":"","skillsToBuild":[],"firstStep":"","occupationSource":"","confidence":"medium"}],"note":""}`;

function stripLinks(value: string): string {
  return value
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/www\.\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const ModelOutputSchema = z.object({
  roles: z
    .array(
      z.object({
        title: z.coerce.string().catch(""),
        sector: z.coerce.string().catch(""),
        reason: z.coerce.string().catch(""),
        skillsToBuild: z.array(z.coerce.string()).catch([]),
        firstStep: z.coerce.string().catch(""),
        occupationSource: z.coerce.string().catch(""),
        confidence: z.coerce.string().catch("medium"),
      }),
    )
    .catch([]),
  note: z.coerce.string().catch(""),
});

export async function exploreRoles(profile: ExploreProfile, lang: "en" | "bm" = "en"): Promise<ExploreResult> {
  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) throw new ExploreNotConfiguredError();

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 1100,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            lang === "bm"
              ? `${SYSTEM_PROMPT}\n\nWrite every "reason", "firstStep" and "note" string in Bahasa Malaysia. Occupation titles and reference codes stay unchanged.`
              : SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `PERSON PROFILE\n${JSON.stringify(profile, null, 2)}\n\nPropose the JSON now.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    logger.error({ status: response.status, detail: detail.slice(0, 300) }, "Explore request failed");
    throw new ExploreFailedError(`Upstream model returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new ExploreFailedError("Upstream model returned an empty response");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    throw new ExploreFailedError("Upstream model did not return valid JSON");
  }

  const parsed = ModelOutputSchema.parse(parsedJson);

  const roles: ExploredRole[] = parsed.roles
    // An occupation without a checkable reference is exactly the thing the
    // domain rules forbid, so it is dropped rather than displayed.
    .filter((role) => role.title.trim() !== "" && role.occupationSource.trim().length >= 4)
    .slice(0, 3)
    .map((role) => {
      const confidence = role.confidence.trim().toLowerCase();
      return {
        title: stripLinks(role.title).slice(0, 80),
        sector: stripLinks(role.sector).slice(0, 60),
        reason: stripLinks(role.reason).slice(0, 400),
        skillsToBuild: role.skillsToBuild
          .map((skill) => stripLinks(skill).slice(0, 60))
          .filter(Boolean)
          .slice(0, 5),
        firstStep: stripLinks(role.firstStep).slice(0, 240),
        occupationSource: stripLinks(role.occupationSource).slice(0, 120),
        confidence: confidence === "high" || confidence === "low" ? confidence : "medium",
      };
    });

  return {
    roles,
    note: stripLinks(parsed.note).slice(0, 300),
    model: MODEL,
    generatedAt: new Date().toISOString(),
  };
}
