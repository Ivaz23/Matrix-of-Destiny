import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function normalizeModelName(model?: string): string {
  if (!model) return 'gemini-3.7-flash';
  if (model.includes('tts')) return 'gemini-3.1-flash-tts-preview';
  if (model.includes('image')) return 'gemini-3.1-flash-lite-image';
  if (model.includes('pro')) return 'gemini-3.7-flash';
  if (model.includes('lite')) return 'gemini-3.1-flash-lite';
  if (model.includes('flash')) return 'gemini-3.7-flash';
  return 'gemini-3.7-flash';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // CORS and security headers for external PWA scanners (PWABuilder, Google Play verification)
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    next();
  });

  // Explicit PWA manifest and service worker routes with required headers
  const publicDir = path.join(process.cwd(), 'public');
  
  app.get('/manifest.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(publicDir, 'manifest.json'));
  });

  app.get('/sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(publicDir, 'sw.js'));
  });

  // Serve static assets from public folder directly
  app.use(express.static(publicDir));

  // Health check endpoint for Cloud Run
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Server-side Gemini API proxy endpoint
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { model: requestedModel, contents, config } = req.body;
      const model = normalizeModelName(requestedModel);
      const ai = getAI();

      // Check if search tool was requested
      const hasSearchTool = config?.tools?.some((t: any) => t && 'googleSearch' in t);

      let response;
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config
        });
      } catch (firstErr: any) {
        const errMsg = firstErr?.message || String(firstErr);
        // If search tool failed (location unsupported 400 or other tool error), fallback without search tool
        if (hasSearchTool || errMsg.includes('location') || errMsg.includes('tool') || errMsg.includes('FAILED_PRECONDITION')) {
          console.warn("Search tool / primary request failed, falling back without search tools:", errMsg);
          const cleanConfig = { ...config };
          if (cleanConfig.tools) {
            delete cleanConfig.tools;
          }
          response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents,
            config: cleanConfig
          });
        } else {
          throw firstErr;
        }
      }

      res.json({
        text: response.text || "",
        candidates: response.candidates || [],
        usageMetadata: response.usageMetadata
      });
    } catch (error: any) {
      console.error("Server Gemini API Error:", error?.message || error);
      const statusCode = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED') ? 429 : 500;
      res.status(statusCode).json({
        error: error?.message || "Gemini API generation error",
        status: error?.status || statusCode,
        details: error?.details || null
      });
    }
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
