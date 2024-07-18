import express from "express";
import passport from "passport";

import { handleAuthentication } from "./auth.middleware";

export const authRouter = express.Router();

authRouter.post(
  "/login",
  passport.authenticate("local", { failWithError: true }),
  (req, res) => {
    res.status(204).json({ data: null });
  }
);

authRouter.use(handleAuthentication);

authRouter.post("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.status(204).json({ data: null });
  });
});
