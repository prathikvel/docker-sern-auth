import express from "express";

import { authRouter, handleAuthentication } from "@/features/auth";
import { roleRouter } from "@/features/role";
import { rolePermissionRouter } from "@/features/role-permission";
import { userRouter } from "@/features/user";
import { userPermissionRouter } from "@/features/user-permission";
import { userRoleRouter } from "@/features/user-role";

const router = express.Router();

router.use(authRouter);

router.use(handleAuthentication);

router.use("/users", userRouter);
router.use("/roles", roleRouter);
router.use("/user-roles", userRoleRouter);
router.use("/role-permissions", rolePermissionRouter);
router.use("/user-permissions", userPermissionRouter);

export default router;
