/**
 * AURA GREETING
 * =============
 * One short line from the guide character, generated once per language and
 * cached, so opening the page does not cost a model call every refresh.
 *
 * The persona is deliberately small: a warm, slightly cheeky Malaysian career
 * guide. It may only invite the visitor to try the planner. It must not promise
 * outcomes, cite numbers, or name a course — those belong to the grounded flows.
 */

import { logger } from "./logger";

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const TIMEOUT_MS = 12_000;
const CACHE_MS = 10 * 60 * 1000;

export type Greeting = { line: string; model: string };

const FALLBACK: Record<"en" | "bm", string[]> = {
  bm: [
    "Awak mesti tengah fikir nak tukar haluan, kan? Jom, saya susun laluan reskilling untuk awak.",
    "Kerja sekarang dah tak sama macam dulu. Mari saya petakan kemahiran awak ke peranan baharu.",
    "Tak tahu nak mula dari mana? Empat checkpoint, satu halaman. Saya pandu.",
  ],
  en: [
    "Feeling stuck where you are? Let me map a reskilling path that fits your week.",
    "Your role is changing. Shall we see which skills carry over, and where to?",
    "Not sure where to start? Four checkpoints, one page. I'll walk you through it.",
  ],
};

const cache = new Map<string, { at: number; value: Greeting }>();

function systemPrompt(lang: "en" | "bm"): string {
  return `You are AURA, the guide inside a career-transition app for Malaysian workers.

Write ONE spoken line, maximum 22 words, spoken directly to the visitor ("awak" / "you").
Tone: warm, calm, slightly cheeky — a helpful friend, never a salesperson.
It must invite them to start with their profile or the four checkpoints.
Do not promise a job, a salary, a timeline or an outcome. Do not cite numbers. Do not name a course or provider. No emoji, no markdown, no quotation marks.
${lang === "bm" ? "Write in Bahasa Malaysia, conversational." : "Write in English, conversational."}
Return JSON only: {"line":""}`;
}

function fallbackFor(lang: "en" | "bm"): Greeting {
  const options = FALLBACK[lang];
  return {
    line: options[Math.floor(Math.random() * options.length)] ?? options[0]!,
    model: "fallback",
  };
}

export async function getGreeting(lang: "en" | "bm"): Promise<Greeting> {
  const hit = cache.get(lang);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value;

  const apiKey = process.env["DEEPSEEK_API_KEY"];
  if (!apiKey) return fallbackFor(lang);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        max_tokens: 120,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt(lang) },
          { role: "user", content: "Write the line now." },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("empty response");

    const parsed = JSON.parse(content) as { line?: unknown };
    const line = typeof parsed.line === "string" ? parsed.line.trim().replace(/^["“]|["”]$/g, "").slice(0, 180) : "";
    if (line.length < 10) throw new Error("unusable line");

    const value: Greeting = { line, model: MODEL };
    cache.set(lang, { at: Date.now(), value });
    return value;
  } catch (error) {
    logger.warn({ err: error }, "Greeting fell back to a canned line");
    return fallbackFor(lang);
  }
}
