import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import fileUpload from "express-fileupload";
import { pool } from "../server/db";
import { registerRoutes } from "../server/routes";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const app = express();
app.set("trust proxy", 1);

app.use(
  express.json({
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

app.use(
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true })
);

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "find-and-hire-me-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

let initPromise: Promise<void> | null = null;

async function initApp(): Promise<void> {
  await registerRoutes(null as any, app);
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) return next(err);
    return res.status(status).json({ message });
  });
}

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = initApp();
  }
  return initPromise;
}

export default async function handler(req: any, res: any): Promise<void> {
  await ensureInit();
  return new Promise((resolve) => {
    app(req, res);
    res.on("finish", resolve);
    res.on("close", resolve);
  });
}
