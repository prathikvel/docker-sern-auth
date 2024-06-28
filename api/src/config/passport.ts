import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { verify, serializeUser, deserializeUser } from "@/features/auth";

export const config = () => {
  passport.use(new LocalStrategy({ usernameField: "email" }, verify));
  passport.serializeUser(serializeUser);
  passport.deserializeUser(deserializeUser);
};
