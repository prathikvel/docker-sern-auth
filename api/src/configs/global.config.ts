import type { Database } from "@/models";

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

export const AUTH = {};

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

export const USER = {};
