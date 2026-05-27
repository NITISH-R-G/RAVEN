import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import { setupRoutes } from "./src/server/routes.js";

// Load environment variables
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy load Gemini Client
let _ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      console.log(`[RAVEN] Initializing server-side Gemini client with key.`);
      _ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.warn("[RAVEN] No valid GEMINI_API_KEY found in process.env. Falling back to heuristic/simulation analyzer.");
    }
  }
  return _ai;
}

// Setup APIs
setupRoutes(app, upload, getGeminiClient);

// Vite & Static Server Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[RAVEN] Starting Vite Developer Mode server (Port ${PORT})...`);
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log(`[RAVEN] Starting Production compiled server (Port ${PORT})...`);
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from the 'dist' directory
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RAVEN Engine ready on http://0.0.0.0:${PORT}]`);
  });
}

startServer();
