import express from "express";
import { checkExact, checkSchema } from "express-validator";

import { handleValidation } from "@/middlewares/validator.middleware";
import { handlers } from "@/utils/routes.util";
import { isValidPermissions } from "@/utils/validator.util";

import { handleEntitySetAuthorization } from "../auth";
import {
  getUserPermissionByUsrId,
  getUserPermissionsByUsrIds,
  getUserPermissionByPerId,
  getUserPermissionsByPerIds,
  addUserPermission,
  removeUserPermission,
} from "./user-permission.controller";
import {
  isValidUrpUsrId,
  isValidUrpUsrIds,
  isValidUrpPerId,
  isValidUrpPerIds,
  isValidAddUserPermission,
} from "./user-permission.validator";

export const userPermissionRouter = express.Router();

// ------------------------------- GET ------------------------------

userPermissionRouter.get(
  "/users/:urpUsrId(\\w+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrpUsrId),
        checkSchema(isValidPermissions),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionByUsrId,
  })
);

userPermissionRouter.get(
  "/users/:urpUsrIds([\\w,]+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrpUsrIds),
        checkSchema(isValidPermissions),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionsByUsrIds,
  })
);

userPermissionRouter.get(
  "/permissions/:urpPerId(\\w+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrpPerId),
        checkSchema(isValidPermissions),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionByPerId,
  })
);

userPermissionRouter.get(
  "/permissions/:urpPerIds([\\w,]+)",
  handlers({
    validation: [
      checkExact([
        checkSchema(isValidUrpPerIds),
        checkSchema(isValidPermissions),
      ]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "read"),
    controller: getUserPermissionsByPerIds,
  })
);

// ------------------------------ POST ------------------------------

userPermissionRouter.post(
  "/",
  handlers({
    validation: [
      checkExact(checkSchema(isValidAddUserPermission)),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "create"),
    controller: addUserPermission,
  })
);

// ----------------------------- DELETE -----------------------------

userPermissionRouter.delete(
  "/users/:urpUsrId/permissions/:urpPerId",
  handlers({
    validation: [
      checkExact([checkSchema(isValidUrpUsrId), checkSchema(isValidUrpPerId)]),
      handleValidation,
    ],
    middleware: handleEntitySetAuthorization("userPermission", "delete"),
    controller: removeUserPermission,
  })
);
