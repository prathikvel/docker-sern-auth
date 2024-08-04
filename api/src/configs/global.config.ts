import type { Database } from "@/models";

// ----------------------------- ERRORS -----------------------------

export const ERRORS = {
  500: "Internal Server Error",
};

// --------------------------- ENTITY SETS --------------------------

export const ENTITY_SET = {
  ENTITY_SET_NAMES: [
    "entitySet",
    "permissible",
    "user",
    "role",
    "userRole",
    "permissionType",
    "permission",
    "rolePermission",
    "userPermission",
  ] as const satisfies (keyof Database)[],
};

export type EntitySet = (typeof ENTITY_SET.ENTITY_SET_NAMES)[number];

// ------------------------------ AUTH ------------------------------

export const AUTH = {
  PWD_MIN_LENGTH: 12,
  PWD_SALT_ROUNDS: 10,
};

// --------------------------- PERMISSION ---------------------------

export const PERMISSION = {
  PERMISSION_TYPE_NAMES: [
    "create",
    "read",
    "update",
    "delete",
    "share",
  ] as const,
};

export type PermissionType = (typeof PERMISSION.PERMISSION_TYPE_NAMES)[number];

// ------------------------------ ROLE ------------------------------

export const ROLE = {};

// ------------------------------ USER ------------------------------

export const USER = {
  ERRORS: {
    USR_ID: "Please enter an integer",
    USR_NAME: "Please enter a string that only contains letters",
    USR_EMAIL: "Please enter a valid email address",
    USR_PASSWORD: "Please enter a string of at least 12 characters",
    OLD_USR_PASSWORD: "Please enter a non-empty string",
    NEW_USR_PASSWORD: "Please enter a string of at least 12 characters",
    INVALID_CREDENTIALS: "Invalid user ID and/or password",
  },
};
