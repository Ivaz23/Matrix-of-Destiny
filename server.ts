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
  if (model.includes('image')) return 'gemini-3.1-flash-image';
  if (model === 'gemini-3.1-flash-lite' || model.includes('lite')) return 'gemini-3.1-flash-lite';
  if (model === 'gemini-2.5-flash' || model.includes('2.5')) return 'gemini-2.5-flash';
  return 'gemini-3.7-flash';
}

const TEXT_FALLBACK_MODELS = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash'];
const IMAGE_FALLBACK_MODELS = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'imagen-3.0-generate-002'];

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

  // Server-side Gemini API proxy endpoint with resilient multi-model fallback
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { model: requestedModel, contents, config } = req.body;
      const initialModel = normalizeModelName(requestedModel);
      const ai = getAI();

      // Check if search tool was requested
      const hasSearchTool = config?.tools?.some((t: any) => t && 'googleSearch' in t);

      // Construct model priority list starting with requested model
      const candidateModels = [
        initialModel,
        ...TEXT_FALLBACK_MODELS.filter(m => m !== initialModel)
      ];

      let lastError: any = null;
      let response: any = null;

      // Try candidate models in order
      for (const model of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model,
            contents,
            config
          });
          if (response) break;
        } catch (err: any) {
          lastError = err;
          const errMsg = err?.message || String(err);
          
          // If search tool failed, retry immediately without search tools on fallback
          if (hasSearchTool || errMsg.includes('location') || errMsg.includes('tool') || errMsg.includes('FAILED_PRECONDITION')) {
            try {
              const cleanConfig = { ...config };
              if (cleanConfig.tools) delete cleanConfig.tools;
              response = await ai.models.generateContent({
                model,
                contents,
                config: cleanConfig
              });
              if (response) break;
            } catch (innerErr: any) {
              lastError = innerErr;
            }
          }
        }
      }

      if (!response && lastError) {
        throw lastError;
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

  // Dedicated endpoint for AI Image Generation (Magic Avatars, Sacred Wallpapers, Talismans)
  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio = "1:1", imageSize = "1K" } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt is required and must be a string" });
      }

      const ai = getAI();
      let response: any = null;
      let usedModel = 'gemini-3.1-flash-image';

      // Iterate through supported image models
      for (const model of IMAGE_FALLBACK_MODELS) {
        try {
          usedModel = model;
          response = await ai.models.generateContent({
            model,
            contents: {
              parts: [{ text: prompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: aspectRatio as any,
                imageSize: imageSize as any
              }
            }
          });
          if (response?.candidates?.[0]?.content?.parts?.some((p: any) => p.inlineData)) {
            break;
          }
        } catch (err: any) {
          // Continue to next image model fallback
          console.warn(`Model ${model} image attempt failed:`, err?.message || err);
        }
      }

      let imageUrl: string | null = null;
      let description = "";

      if (response?.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
          } else if (part.text) {
            description += part.text + " ";
          }
        }
      }

      if (!imageUrl) {
        return res.json({
          fallback: true,
          message: "AI image model quota reached, procedural sacred talisman activated.",
          description: description.trim() || response?.text || "",
          model: usedModel
        });
      }

      res.json({
        imageUrl,
        description: description.trim(),
        model: usedModel,
        timestamp: Date.now()
      });
    } catch (error: any) {
      console.warn("Server Image Generation Handled Error:", error?.message || error);
      res.json({
        fallback: true,
        message: "Image generation falling back to procedural talisman.",
        error: error?.message
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
