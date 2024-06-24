import express from "express";

import { authRouter } from "@/features/auth";

const router = express.Router();

router.use(authRouter);

export default router;
