import express from "express";

import { authRouter, handleAuthentication } from "@/features/auth";
import { userRouter } from "@/features/user";

const router = express.Router();

router.use(authRouter);

router.use(handleAuthentication);

router.use("/users", userRouter);

export default router;
