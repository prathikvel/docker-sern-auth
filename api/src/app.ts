import express from "express";
import passport from "passport";
import session from "express-session";
import mySqlSession from "express-mysql-session";

import { pool } from "@/configs/database.config";
import * as pp from "@/configs/passport.config";
import handleError from "@/middlewares/error.middleware";
import routes from "@/routes";

// ----------------------------- CONFIG -----------------------------

pp.config();

// --------------------------- MIDDLEWARE ---------------------------

const app = express();
const MySQLStore = mySqlSession(session as any);

app.use(express.json());
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

app.use("/api", routes);
app.use(handleError);

// ----------------------------- EXPORT -----------------------------

export default app;
