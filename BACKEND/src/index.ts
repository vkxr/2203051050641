import express from "express";
import { randomBytes } from "crypto";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const LOG_URL = "http://20.244.56.144/evaluation-service/logs";

const db = new Map<string, {
  originalUrl: string,
  expiry: number,
  createdAt: number,
  clicks: { timestamp: number; referrer?: string }[]
}>();


async function Log(stack: "backend" | "frontend", level: string, pkg: string, message: string) {
  try {
    await fetch(LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });
  } catch (e) {
    console.error("Log error", e);
  }
}


function generateShortcode(length = 6): string {
  return randomBytes(length).toString("base64url").slice(0, length);
}


app.post("/shorturls", async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || typeof url !== "string") {
    await Log("backend", "error", "handler", "Invalid or missing URL");
    res.status(400).json({ error: "URL is required and must be a string" });
    return;
  }

  let code = shortcode || generateShortcode();
  if (db.has(code)) {
    await Log("backend", "error", "handler", "Shortcode already exists");
    res.status(400).json({ error: "Shortcode already exists" });
    return;
  }

  const now = Date.now();
  db.set(code, {
    originalUrl: url,
    createdAt: now,
    expiry: now + validity * 60 * 1000,
    clicks: []
  });

   await Log("backend", "info", "service", `Shortened URL for ${url} with code ${code}`);
   res.status(201).json({
    shortLink: `${BASE_URL}/${code}`,
    expiry: new Date(now + validity * 60 * 1000).toISOString()
  });
});


app.get("/:code", async (req, res) => {
  const record = db.get(req.params.code);
  if (!record || Date.now() > record.expiry) {
    await Log("backend", "warn", "route", "Shortcode not found or expired");
    res.status(410).json({ error: "Link expired or invalid" });
    return;
  }

  record.clicks.push({ timestamp: Date.now(), referrer: req.headers.referer });
  res.redirect(record.originalUrl);
});

app.get("/shorturls/:code", async (req, res) => {
  const record = db.get(req.params.code);
  if (!record) {
    await Log("backend", "error", "handler", "Stats requested for nonexistent shortcode");
    res.status(404).json({ error: "Shortcode not found" });
    return;
  }

  res.json({
    originalUrl: record.originalUrl,
    createdAt: new Date(record.createdAt).toISOString(),
    expiry: new Date(record.expiry).toISOString(),
    totalClicks: record.clicks.length,
    clicks: record.clicks
  });
});

app.listen(PORT, () => {
  console.log(`URL Shortener running at ${BASE_URL}`);
});
