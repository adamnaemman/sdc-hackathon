/**
 * WIDER ROLE LIBRARY (O*NET)
 * ==========================
 * GET /api/library?skills=Procurement,Microsoft%20Excel
 *
 * The five curated roles have real pathways and verified course links. This
 * endpoint answers the other question: "what else could I do?" It searches 916
 * real occupations from the O*NET database (U.S. Department of Labor, CC BY 4.0)
 * and ranks them by how many of the person's skills appear in the occupation's
 * description or its listed software.
 *
 * Honesty rules:
 *  - Titles and descriptions are copied verbatim from O*NET; nothing is invented.
 *  - No statistics are produced. The number shown is "how many of your skills
 *    appear in this description", not a salary, growth or hiring probability.
 *  - These occupations have no curated pathway, and the UI says so.
 */

import { Router, type IRouter } from "express";
import occupations from "../data/occupations.json";

const router: IRouter = Router();

type Occupation = { code: string; title: string; description: string; tools: string[] };

/** Words too common to be evidence of anything. */
const STOP_WORDS = new Set([
  "and", "the", "for", "with", "from", "that", "this", "their", "other", "into",
  "such", "have", "may", "not", "are", "can", "all", "any", "use", "using",
  "work", "workers", "including", "systems", "system", "management", "support",
  "services", "knowledge", "ability", "skills", "skill", "job", "jobs",
]);

function tokenise(skills: string[]): string[] {
  const tokens = new Set<string>();
  for (const skill of skills) {
    for (const raw of skill.toLowerCase().split(/[^a-z0-9+]+/)) {
      const token = raw.trim();
      if (token.length >= 4 && !STOP_WORDS.has(token)) tokens.add(token);
    }
  }
  return [...tokens];
}

router.get("/library", (request, response) => {
  const rawSkills = String(request.query["skills"] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 30);

  const tokens = tokenise(rawSkills);

  if (tokens.length === 0) {
    response.json({
      total: occupations.length,
      source: {
        name: "O*NET 30.1 Database — U.S. Department of Labor",
        url: "https://www.onetonline.org/",
        licence: "CC BY 4.0",
        retrieved: "2026-10-23",
      },
      roles: [],
      matched: 0,
    });
    return;
  }

  const scored = (occupations as Occupation[])
    .map((occupation) => {
      const haystack = `${occupation.title} ${occupation.description} ${occupation.tools.join(" ")}`.toLowerCase();
      const hits = tokens.filter((token) => haystack.includes(token));
      return { occupation, hits };
    })
    .filter((entry) => entry.hits.length > 0)
    .sort((a, b) => b.hits.length - a.hits.length)
    .slice(0, 24)
    .map((entry) => ({
      code: entry.occupation.code,
      title: entry.occupation.title,
      description: entry.occupation.description,
      tools: entry.occupation.tools.slice(0, 4),
      matchedSkills: entry.hits.slice(0, 4),
      matchedCount: entry.hits.length,
      // A count, not a probability: "how many of your skills this description
      // mentions". Deliberately not called a fit score.
      strength: Math.min(100, 30 + entry.hits.length * 12),
    }));

  response.json({
    total: occupations.length,
    source: {
      name: "O*NET 30.1 Database — U.S. Department of Labor",
      url: "https://www.onetonline.org/",
      licence: "CC BY 4.0",
      retrieved: "2026-10-23",
    },
    matched: scored.length,
    roles: scored,
  });
});

export default router;
