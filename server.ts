import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || (process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0");

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseio.com",
        "wss://*.firebaseio.com",
      ],
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://accounts.google.com"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === "production"
    ? { maxAge: 31_536_000 }
    : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));
app.use(express.json({ limit: "256kb" }));

const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many AI requests. Please try again later." },
});
app.use("/api/ai", aiRateLimit);

// Helper to get GenAI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "HOREMOW Assignment Tracker API" });
});

// AI Spiritual Companion endpoint
app.post("/api/ai/companion", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { prompt, context, roleMode } = body;

    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 4000) {
      res.status(400).json({ error: "Prompt must be a non-empty string of at most 4000 characters." });
      return;
    }

    if (roleMode !== undefined && (typeof roleMode !== "string" || roleMode.length > 80)) {
      res.status(400).json({ error: "Role mode must be a string of at most 80 characters." });
      return;
    }

    if (JSON.stringify(context ?? {}).length > 20_000) {
      res.status(400).json({ error: "Context is too large." });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(503).json({ error: "Gemini API key is not configured on the server." });
      return;
    }

    const systemInstruction = `You are the HOREMOW Spiritual Study & Assignment Companion, an AI assistant strictly grounded in Holiness Revival Movement Worldwide (HOREMOW) doctrines, Pastor Paul Rika's books (e.g., 'Restitution: The Highway to Heaven', 'Maintaining the Garments of Purity', 'Escaping Hell Fire'), and Biblical holiness.

STRICT DOCTRINAL GUARDRAILS:
1. You MUST ONLY provide answers and guidance aligned with HOREMOW preachings, Pastor Paul Rika's books, conference messages, and Biblical holiness, righteousness, restitution, and soul-winning.
2. You MUST NOT give answers or opinions that contradict or fall outside HOREMOW doctrines or true holiness.
3. If asked about non-doctrinal, worldly, or unbiblical topics, politely bring the focus back to holiness, restitution, Bible study, prayer, and soul winning as taught in HOREMOW.
4. The user is currently operating in '${roleMode || "General Member"}' assignment mode.

Context of user's current progress:
${JSON.stringify(context || {})}

Provide clear, scriptural, uplifting, and practical guidance. Format your response cleanly with bullet points or paragraphs when appropriate. Keep responses focused and encouraging.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error("Error in AI companion endpoint:", err);
    res.status(500).json({
      error: "Unable to process spiritual assistant request right now.",
    });
  }
});

// AI Report Summary endpoint
app.post("/api/ai/report-summary", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { reportData } = body;

    if (!reportData || typeof reportData !== "object" || Array.isArray(reportData)
      || JSON.stringify(reportData).length > 30_000) {
      res.status(400).json({ error: "A valid report payload of at most 30000 characters is required." });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(503).json({ error: "Gemini API key is not configured on the server." });
      return;
    }

    const systemInstruction = `You are a Senior HOREMOW Assignment Reviewer & Spiritual Mentor.
You are generating a formal, encouraging 2-paragraph spiritual summary and assessment of a member's HOREMOW assignment completion report.
Analyze their progress across Bible Reading, HOREMOW Books, Sermon Messages, Soul Winning, and Prayer & Fasting.
Highlight strengths, offer a customized verse of encouragement, and suggest one practical step for their continued spiritual fervor.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Please generate a spiritual summary review for this assignment report:\n${JSON.stringify(reportData, null, 2)}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    res.json({ summary: response.text });
  } catch (err: any) {
    console.error("Error in AI report summary endpoint:", err);
    res.status(500).json({
      error: "Unable to generate AI report summary right now.",
    });
  }
});

// AI Document Assignment Parser endpoint
app.post("/api/ai/parse-assignment", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { documentText } = body;

    if (typeof documentText !== "string" || !documentText.trim() || documentText.length > 100_000) {
      res.status(400).json({ error: "Document text must be non-empty and at most 100000 characters." });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(503).json({ error: "Gemini API key is not configured on the server." });
      return;
    }

    const systemInstruction = `You are a HOREMOW Document Assignment Assistant.
Your task is to analyze raw HOREMOW assignment guidelines, conference announcements, or syllabus documents and extract structured assignment targets into JSON.

Respond ONLY with valid JSON with the following structure:
{
  "conferenceType": "women" | "ministers" | "youth" | "december" | "annual",
  "conferenceName": string,
  "requiredBibleBooks": string[],
  "targetMessages": number,
  "targetBooks": number,
  "targetPrayerHours": number,
  "targetFastingDays": number,
  "targetSouls": number
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Parse this assignment document into the JSON schema:\n${documentText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ result: parsed });
  } catch (err: any) {
    console.error("Error in AI assignment parser endpoint:", err);
    res.status(500).json({
      error: "Unable to parse assignment document right now.",
    });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found." });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (["sw.js", "registerSW.js", "manifest.webmanifest"].includes(path.basename(filePath))) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`HOREMOW App server listening on ${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start HOREMOW server:", error);
  process.exitCode = 1;
});
