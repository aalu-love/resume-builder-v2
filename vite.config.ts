import path from 'path';
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { renderResumePdf } from "./server/render-pdf.js";

const MAX_BODY_BYTES = 1024 * 1024;
const STYLES = ['classic', 'clean', 'banded', 'sidebar'] as const;
const COLOR_THEMES = ['terracotta', 'ink', 'ocean', 'forest', 'plum'] as const;
const TEXT_SIZES = ['small', 'medium', 'large'] as const;

// Falls back to the default when the client sends an unknown value.
function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

// POST /api/resume-pdf  { "source", "style", "colorTheme", "textSize" }  ->  application/pdf
function resumePdfEndpoint() {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url !== '/api/resume-pdf') return next();

    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', async () => {
      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      if (typeof payload.source !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Expected "source" to be a string' }));
        return;
      }

      try {
        const pdfBytes = await renderResumePdf(`http://${req.headers.host}`, {
          source: payload.source,
          style: pick(payload.style, STYLES, 'classic'),
          colorTheme: pick(payload.colorTheme, COLOR_THEMES, 'terracotta'),
          textSize: pick(payload.textSize, TEXT_SIZES, 'medium'),
          fit: payload.fit === true,
        });
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
          'Content-Length': pdfBytes.length,
        });
        res.end(Buffer.from(pdfBytes));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to generate PDF' }));
        console.error(error);
      }
    });
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'resume-pdf-endpoint',
      configureServer(server) {
        server.middlewares.use(resumePdfEndpoint());
      },
      configurePreviewServer(server) {
        server.middlewares.use(resumePdfEndpoint());
      },
    },
  ],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
  root: path.resolve(import.meta.dirname),
});
