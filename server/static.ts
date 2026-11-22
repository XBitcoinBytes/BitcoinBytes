import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Hashed build assets never change: cache them for a year. Everything else revalidates.
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      immutable: true,
      maxAge: "365d",
      fallthrough: false,
    }),
  );
  app.use(express.static(distPath, { maxAge: "1h", index: false }));

  // Unknown API routes get a JSON 404 instead of the SPA shell.
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  // SPA fallback. Unknown paths still get the app (it renders the branded 404 page) but with a
  // real 404 status so search engines don't index soft 404s.
  app.use("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.status(isClientRoute(req.originalUrl) ? 200 : 404);
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

/** Paths the client router serves (keep in sync with client/src/App.tsx). */
export const CLIENT_ROUTES = new Set([
  "/", "/methodology", "/fees", "/beginners", "/learn", "/legal", "/data-status", "/prices",
]);

export function isClientRoute(url: string): boolean {
  const pathname = (url.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  return CLIENT_ROUTES.has(pathname.toLowerCase());
}
