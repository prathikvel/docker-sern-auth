import express from "express";
import passport from "passport";
import session from "express-session";
import mySqlSession from "express-mysql-session";

import { pool } from "@/config/database";
import * as pp from "@/config/passport";

// ----------------------------- CONFIG -----------------------------

pp.config();

// --------------------------- MIDDLEWARE ---------------------------

const app = express();
const MySQLStore = mySqlSession(session as any);

app.use(
  session({
    name: "sessionId",
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
    cookie: { httpOnly: true, sameSite: true, secure: "auto" },
    store:
      process.env.NODE_ENV === "production"
        ? new MySQLStore({}, pool)
        : new session.MemoryStore(),
  })
);
app.use(passport.session());

// ----------------------------- ROUTES -----------------------------

app.get("/api", (req, res) => {
  res.json({ message: "Hello world!" });
});

export default app;
