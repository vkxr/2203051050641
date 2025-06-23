"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = require("crypto");
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const LOG_URL = "http://20.244.56.144/evaluation-service/logs";
const db = new Map();
function Log(stack, level, pkg, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, node_fetch_1.default)(LOG_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stack, level, package: pkg, message })
            });
        }
        catch (e) {
            console.error("Log error", e);
        }
    });
}
function generateShortcode(length = 6) {
    return (0, crypto_1.randomBytes)(length).toString("base64url").slice(0, length);
}
app.post("/shorturls", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url, validity = 30, shortcode } = req.body;
    if (!url || typeof url !== "string") {
        yield Log("backend", "error", "handler", "Invalid or missing URL");
        res.status(400).json({ error: "URL is required and must be a string" });
    }
    let code = shortcode || generateShortcode();
    if (db.has(code)) {
        yield Log("backend", "error", "handler", "Shortcode already exists");
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
    yield Log("backend", "info", "service", `Shortened URL for ${url} with code ${code}`);
    res.status(201).json({
        shortLink: `${BASE_URL}/${code}`,
        expiry: new Date(now + validity * 60 * 1000).toISOString()
    });
}));
// Redirect to long URL
app.get("/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const record = db.get(req.params.code);
    if (!record || Date.now() > record.expiry) {
        yield Log("backend", "warn", "route", "Shortcode not found or expired");
        res.status(410).json({ error: "Link expired or invalid" });
        return;
    }
    record.clicks.push({ timestamp: Date.now(), referrer: req.headers.referer });
    res.redirect(record.originalUrl);
}));
// Get stats
app.get("/shorturls/:code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const record = db.get(req.params.code);
    if (!record) {
        yield Log("backend", "error", "handler", "Stats requested for nonexistent shortcode");
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
}));
app.listen(PORT, () => {
    console.log(`URL Shortener running at ${BASE_URL}`);
});
