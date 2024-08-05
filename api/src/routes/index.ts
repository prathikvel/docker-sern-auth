import express from "express";

import { authRouter, handleAuthentication } from "@/features/auth";
import { roleRouter } from "@/features/role";
import { userRouter } from "@/features/user";

const router = express.Router();

router.use(authRouter);

router.use(handleAuthentication);

router.use("/roles", roleRouter);
router.use("/users", userRouter);

export default router;
