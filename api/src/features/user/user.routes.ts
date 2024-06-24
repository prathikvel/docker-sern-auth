import express from "express";

import {
  getCurrentUser,
  getUserById,
  getUsers,
  addUser,
  editUser,
  editUserPassword,
  removeUser,
} from "./user.controller";

export const userRouter = express.Router();

userRouter.get("/current", getCurrentUser);
userRouter.get("/:id", getUserById);
userRouter.get("/", getUsers);
userRouter.post("/", addUser);
userRouter.put(
  "/:id",
  (req, res, next) => {
    const hasOwn = (...props: string[]) => {
      return props.every((v) => Object.hasOwn(req.body, v));
    };
    return hasOwn("oldUsrPassword", "newUsrPassword") ? next("route") : next();
  },
  editUser
);
userRouter.put("/:id", editUserPassword);
userRouter.delete("/:id", removeUser);
