import express, { type Express } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "@workspace/db";
import router from "./routes";

const PgSession = connectPgSimple(session);

const app: Express = express();
app.set("trust proxy", 1);

const ALLOWED_ORIGINS = [
  /\.replit\.dev$/,
  /\.spock\.replit\.dev$/,
  /localhost/,
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.some((p) => p.test(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cookie, Authorization, X-Requested-With");
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new PgSession({
    pool: pool as any,
    createTableIfMissing: true,
    tableName: "session",
  }),
  secret: process.env.SESSION_SECRET || (process.env.DATABASE_URL ? "felosak-dev-" + process.env.DATABASE_URL.slice(-8) : "felosak-dev-fallback"),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || !!process.env.REPLIT_DEV_DOMAIN,
    sameSite: process.env.REPLIT_DEV_DOMAIN ? "none" as const : "lax" as const,
  },
  proxy: true,
}));

app.use("/api", router);

app.use("/uploads", express.static("uploads"));

export default app;
