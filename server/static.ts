import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { ROUTE_META, BASE_URL, fullTitle } from "../shared/routeMeta";

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
  const shell = fs.readFileSync(path.resolve(distPath, "index.html"), "utf8");
  const rendered = new Map<string, string>();
  app.use("*", (req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    const known = isClientRoute(req.originalUrl);
    res.status(known ? 200 : 404);
    const key = known ? normalizePath(req.originalUrl) : "404";
    let html = rendered.get(key);
    if (!html) { html = renderShell(shell, key); rendered.set(key, html); }
    res.type("html").send(html);
  });
}

/** Paths the client router serves (keep in sync with client/src/App.tsx). */
export const CLIENT_ROUTES = new Set([
  "/", "/methodology", "/fees", "/beginners", "/learn", "/legal", "/data-status", "/prices",
]);

export function normalizePath(url: string): string {
  return ((url.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/").toLowerCase();
}

export function isClientRoute(url: string): boolean {
  return CLIENT_ROUTES.has(normalizePath(url));
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Writes the route's title, description, canonical and share-card tags into the HTML shell,
 * so link previews (X, iMessage, LinkedIn) and crawlers that don't run JS get the right card.
 * Only fixed strings from ROUTE_META are written; nothing from the request is echoed.
 */
export function renderShell(shell: string, routeKey: string): string {
  const meta = ROUTE_META[routeKey];
  if (!meta) {
    return shell
      .replace(/<title>[\s\S]*?<\/title>/, "<title>Page not found | BitcoinBytes</title>")
      .replace(/<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex" />');
  }
  const title = esc(fullTitle(meta.title));
  const desc = esc(meta.description);
  const url = `${BASE_URL}${routeKey === "/" ? "/" : routeKey}`;
  const set = (html: string, re: RegExp, tag: string) => (re.test(html) ? html.replace(re, tag) : html);
  let html = shell;
  html = set(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = set(html, /<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${desc}" />`);
  html = set(html, /<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
  html = set(html, /<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${title}" />`);
  html = set(html, /<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${desc}" />`);
  html = set(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${title}" />`);
  html = set(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${desc}" />`);
  html = set(html, /<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${url}" />`);
  // Crawlable fallback for non-JS clients.
  // In <noscript> so JS visitors never see it replaced (no layout shift).
  html = html.replace('<div id="root"></div>', `<div id="root"></div><noscript><main style="max-width:40rem;margin:6rem auto;padding:0 1rem;color:#fff;font-family:system-ui"><h1>${esc(meta.title)}</h1><p>${esc(meta.summary)}</p><p>BitcoinBytes needs JavaScript for live comparisons.</p></main></noscript>`);
  return html;
}
