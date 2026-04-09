import express, { type Request, type Response, type NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import fileUpload from "express-fileupload";
import type { IncomingMessage, ServerResponse } from "http";
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

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const app = express();
app.set("trust proxy", 1);

app.use(
  express.json({
    verify: (req: Request, _res: Response, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false }));

app.use(
  fileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true })
);

app.use("/uploads", express.static("uploads"));

const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

app.use((req: Request, res: Response, next: NextFunction) => {
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
  await registerRoutes(null, app);
  app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response, next: NextFunction) => {
    const status = (err as { status?: number }).status || (err as { statusCode?: number }).statusCode || 500;
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

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  await ensureInit();
  app(req, res);
}
