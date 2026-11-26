import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./static";
import { enhancedRateLimiter } from "./rateLimiter";
import { httpsRedirect } from "./security";

const app = express();

// Behind Railway/Replit/Fly proxies: trust the first hop so req.ip and req.secure are correct.
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(httpsRedirect);

// Cheap liveness probe for the host's health check (no upstream calls, no rate limit).
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason instanceof Error ? reason.message : reason);
});

// Security will be handled by helmet middleware from security.ts

// Enhanced rate limiting for API endpoints
app.use('/api', enhancedRateLimiter.middleware());

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      // Log method, path, status and duration only — never response bodies.
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = Number(err?.status || err?.statusCode) || 500;
    // Never leak internal error details or stack traces to clients.
    const message = status < 500 && typeof err?.message === "string" ? err.message : "Internal Server Error";
    if (status >= 500) console.error("Request error:", err?.stack || err);
    if (res.headersSent) return;
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serves both the API and the client. Hosts like Railway/Render/Fly inject PORT;
  // default to 5000 (the Replit-mapped port) when it is not set.
  const port = Number.parseInt(process.env.PORT ?? "", 10) || 5000;
  // No reusePort: a stale process must not silently share the port with a new one.
  server.listen({ port, host: "0.0.0.0" }, () => {
    log(`serving on port ${port}`);
  });

  // logger.ts registers SIGTERM/SIGINT listeners for logging, which disables Node's default
  // exit-on-signal; close the server and exit so restarts and redeploys are clean.
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), 8000).unref();
    });
  }
})();
