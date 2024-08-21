import type { Database } from "@/models";

// ----------------------------- ERRORS -----------------------------

export const ERRORS = {
  ID: "Please enter a number",
  IDS: "Please enter comma-separated numbers",
  PERMISSIONS: 'Please enter "true" or "false"',
};

// ------------------------------ AUTH ------------------------------

export const AUTH = {
  PWD_MIN_LENGTH: 12,
  PWD_SALT_ROUNDS: 10,
};

// --------------------------- ENTITY SET ---------------------------

export const ENTITY_SET = {
  NAMES: [
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

export type EntitySetName = (typeof ENTITY_SET.NAMES)[number];

// --------------------------- PERMISSION ---------------------------

export const PERMISSION = {
  ERRORS: {
    PER_ID: "Please enter an integer",
  },
  TYPE: {
    NAMES: ["create", "read", "update", "delete", "share"] as const,
  },
};

export type PermissionTypeName = (typeof PERMISSION.TYPE.NAMES)[number];

// ------------------------------ ROLE ------------------------------

export const ROLE = {
  ERRORS: {
    ROL_NAME: "Please enter a name that only contains letters and/or numbers",
  },
};

// ------------------------- ROLE-PERMISSION ------------------------

export const ROLE_PERMISSION = {
  ERRORS: {
    RLP_ROL_ID: "Please enter an integer",
    RLP_PER_ID: "Please enter an integer",
  },
};

// ------------------------------ USER ------------------------------

export const USER = {
  ERRORS: {
    USR_NAME: "Please enter a name that only contains letters",
    USR_EMAIL: "Please enter a valid email address",
    USR_PASSWORD:
      "Please enter a password that is at least" +
      ` ${AUTH.PWD_MIN_LENGTH} characters long`,
    CURR_USR_PASSWORD: "Please enter a password",
    INVALID_CREDENTIALS: "Invalid user ID and/or password",
  },
};

// ------------------------- USER-PERMISSION ------------------------

export const USER_PERMISSION = {
  ERRORS: {
    URP_USR_ID: "Please enter an integer",
    URP_PER_ID: "Please enter an integer",
  },
};

// ---------------------------- USER-ROLE ---------------------------

export const USER_ROLE = {
  ERRORS: {
    URL_USR_ID: "Please enter an integer",
    URL_ROL_ID: "Please enter an integer",
  },
};
