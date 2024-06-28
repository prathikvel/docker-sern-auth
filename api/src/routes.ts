import express from "express";

import { authRouter, authenticationHandler } from "@/features/auth";
import { userRouter } from "@/features/user";

const router = express.Router();

router.use(authRouter);

router.use(authenticationHandler);

router.use("/users", userRouter);

export default router;
