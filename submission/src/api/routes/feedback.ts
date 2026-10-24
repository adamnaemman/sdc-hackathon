/**
 * FEEDBACK
 * ========
 * The app stores nothing about a person — but it does need to know whether it
 * worked. This endpoint appends one line of JSON per submission to a local file
 * (no database, no accounts, no cookies), and exposes only aggregate counts.
 *
 * Deliberately no contact field: asking for an email would contradict the privacy
 * claim printed in the sidebar.
 */

import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Router, type IRouter } from "express";
import { z } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "feedback.jsonl");

const FeedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  role: z.string().max(80).catch(""),
  worked: z.string().max(1200).catch(""),
  improve: z.string().max(1200).catch(""),
  lang: z.enum(["en", "bm"]).catch("en"),
});

type FeedbackRow = z.infer<typeof FeedbackSchema> & { at: string };

async function readAll(): Promise<FeedbackRow[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as FeedbackRow;
        } catch {
          return null;
        }
      })
      .filter((row): row is FeedbackRow => row !== null);
  } catch {
    return [];
  }
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string, now: number): boolean {
  const recent = (requestLog.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  recent.push(now);
  requestLog.set(key, recent);
  return recent.length > MAX_PER_WINDOW;
}

router.post("/feedback", async (request, response) => {
  if (isRateLimited(request.ip ?? "unknown", Date.now())) {
    response.status(429).json({ error: "rate_limited", message: "Too many submissions. Try again later." });
    return;
  }

  const parsed = FeedbackSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ error: "invalid_input", message: "A rating from 1 to 5 is required." });
    return;
  }

  const row: FeedbackRow = { ...parsed.data, at: new Date().toISOString() };

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(DATA_FILE, `${JSON.stringify(row)}\n`, "utf8");
    response.status(201).json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, "POST /feedback failed");
    response.status(503).json({ error: "unavailable", message: "Feedback could not be saved just now." });
  }
});

router.get("/feedback/summary", async (_request, response) => {
  const rows = await readAll();
  const total = rows.length;
  const average = total === 0 ? 0 : rows.reduce((sum, row) => sum + row.rating, 0) / total;
  const distribution = [1, 2, 3, 4, 5].map((score) => ({
    score,
    count: rows.filter((row) => row.rating === score).length,
  }));

  response.json({ total, average: Number(average.toFixed(2)), distribution });
});

export default router;
