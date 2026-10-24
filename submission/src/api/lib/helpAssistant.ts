/**
 * ASK AURA — grounded help assistant
 * ==================================
 * A user asks how the app works; the model answers using ONLY the help entries
 * below. That constraint is the whole point: a generic chatbot would happily
 * invent a feature we do not have, which contradicts everything this project
 * claims. If the help text does not cover the question, the assistant says so and
 * names the checkpoint to look at.
 *
 * If the model is unavailable, a keyword match over the same entries answers
 * instead — so the panel never dies, it just becomes dumber.
 */

import { logger } from "./logger";

export type HelpEntry = {
  id: string;
  title: string;
  body: string;
};

export const HELP_KB: HelpEntry[] = [
  {
    id: "overview",
    title: "What AURA-Workforce is",
    body: "A career-transition planner in one scrolling page with four checkpoints: 01 Market signals, 02 Your profile, 03 Future roles, 04 Learning path. You fill in a profile once; the AI uses it to propose roles and a study plan. It is not a job board and it does not apply for jobs.",
  },
  {
    id: "signals",
    title: "Checkpoint 01 — Market signals",
    body: "Shows live demand from public job postings: the most requested skills over the last four weeks as a line chart, plus six sourced labour-market signals. Every figure shows its source, fetch time and sample size. The chart measures direction of demand in a global feed, not Malaysian vacancy counts, and is not a forecast for an individual. Press Refresh to refetch.",
  },
  {
    id: "profile",
    title: "Checkpoint 02 — Your profile",
    body: "Enter your current role, industry, years of experience and skills, then press Apply. The AI expands what you wrote into concrete skills and tools you can tick. Tools are pre-ticked because they are factual; soft skills are left for you to decide. Weekly hours are used later to schedule the study plan. Nothing is sent anywhere except the AI call.",
  },
  {
    id: "roles",
    title: "Checkpoint 03 — Future roles",
    body: "The AI proposes up to three occupations from your profile, each outside our curated catalogue, with its reasoning, the skills to build, a first step, and an occupational reference (for example O*NET-SOC or MASCO) you can check yourself. No salary, growth figure or course link is shown for these because we could not source one.",
  },
  {
    id: "pathway",
    title: "Checkpoint 04 — Learning path",
    body: "Press Build verified pathway on a role card. The planner may only choose courses from our verified library, so every step has a real URL, hours and a reason. The plan is scheduled against the weekly hours you entered. If the library has no course for that occupation, it returns study topics with search links instead of inventing a course.",
  },
  {
    id: "empty",
    title: "Why a pathway is empty",
    body: "Two cases. Either our verified library has no course for that occupation yet — in which case you get topics with search links — or the AI call failed, which shows an error message in checkpoint 04. A pathway is never padded with irrelevant courses.",
  },
  {
    id: "privacy",
    title: "Your data",
    body: "There is no account, no database and no CV upload. The profile lives in this browser tab and is discarded when you close it. The only outbound calls are to our own API, which forwards the profile text to the language model.",
  },
  {
    id: "limits",
    title: "What the AI may not do",
    body: "It may not invent a job, a course, a provider or a statistic. Every role and module identifier it returns is validated against our catalogue server-side and unknown ones are discarded. Fit scores are shown next to a deterministic estimate so disagreement is visible.",
  },
  {
    id: "sources",
    title: "Where the data comes from",
    body: "O*NET 30.1 occupational database (CC BY 4.0), Arbeitnow public job board API for live postings, U.S. Bureau of Labor Statistics Occupational Outlook Handbook, and the World Economic Forum Future of Jobs 2025 report for context.",
  },
  {
    id: "settings",
    title: "Language, theme and about",
    body: "The header has an EN/BM switch and a light/dark switch; both are remembered in this browser. The About page (sidebar) covers the team, sources, what the project refuses to do, and the tech stack.",
  },
];

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TIMEOUT_MS = 25_000;

export type HelpAnswer = {
  answer: string;
  topics: string[];
  model: string;
  fallback: boolean;
};

function systemPrompt(lang: "en" | "bm"): string {
  return `You are the in-app help assistant for AURA-Workforce, a career-transition planner.

Rules, all mandatory:
- Answer ONLY from the HELP CONTENT provided. Do not describe features that are not in it.
- Maximum 70 words. Two short sentences is ideal.
- If the help content does not cover the question, say plainly that you do not have that information, and name the checkpoint where the person can look.
- Never invent a job title, course, provider, statistic or URL.
- ${lang === "bm" ? "Answer in Bahasa Malaysia." : "Answer in English."}
- Output JSON only: {"answer":"","topics":["id"]}`;
}

function keywordAnswer(question: string, lang: "en" | "bm"): HelpAnswer {
  const words = question.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  let best: { entry: HelpEntry; score: number } | null = null;

  for (const entry of HELP_KB) {
    const haystack = `${entry.title} ${entry.body}`.toLowerCase();
    const score = words.reduce((total, word) => (haystack.includes(word) ? total + 1 : total), 0);
    if (!best || score > best.score) best = { entry, score };
  }

  if (best && best.score > 0) {
    return {
      answer: best.entry.body,
      topics: [best.entry.id],
      model: "keyword-fallback",
      fallback: true,
    };
  }

  return {
    answer:
      lang === "bm"
        ? "Saya tidak mempunyai maklumat itu. Cuba tanya tentang checkpoint 01 hingga 04, privasi, atau sumber data."
        : "I do not have that information. Try asking about checkpoints 01 to 04, privacy, or where the data comes from.",
    topics: [],
    model: "keyword-fallback",
    fallback: true,
  };
}

export async function answerHelpQuestion(
  question: string,
  lang: "en" | "bm",
): Promise<HelpAnswer> {
  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) return keywordAnswer(question, lang);

  const helpContent = HELP_KB.map((entry) => `[${entry.id}] ${entry.title}\n${entry.body}`).join("\n\n");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt(lang) },
          { role: "user", content: `HELP CONTENT\n${helpContent}\n\nQUESTION\n${question}\n\nReturn the JSON now.` },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.trim() === "") throw new Error("empty response");

    const parsed = JSON.parse(content) as { answer?: unknown; topics?: unknown };
    const answer = typeof parsed.answer === "string" ? parsed.answer.trim().slice(0, 600) : "";
    if (answer.length < 5) throw new Error("unusable answer");

    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.filter((id): id is string => typeof id === "string" && HELP_KB.some((entry) => entry.id === id))
      : [];

    return { answer, topics, model: MODEL, fallback: false };
  } catch (error) {
    logger.warn({ err: error }, "Ask AURA fell back to keyword matching");
    return keywordAnswer(question, lang);
  }
}
