import { Schema } from "express-validator";

import { AUTH, USER } from "@/configs/global.config";

/** The validation schema to add a user. */
export const isValidAddUser = {
  usrName: {
    errorMessage: USER.ERRORS.USR_NAME,
    isAlpha: true,
    in: "body",
  },
  usrEmail: {
    errorMessage: USER.ERRORS.USR_EMAIL,
    isEmail: true,
    in: "body",
  },
  usrPassword: {
    errorMessage: USER.ERRORS.USR_PASSWORD,
    isLength: { options: { min: AUTH.PWD_MIN_LENGTH } },
    in: "body",
  },
} satisfies Schema;

/** The validation schema to edit a user. */
export const isValidEditUser = {
  usrName: { ...isValidAddUser.usrName, optional: true },
  usrEmail: { ...isValidAddUser.usrEmail, optional: true },
} satisfies Schema;

/** The validation schema to edit a user's password. */
export const isValidEditPassword = {
  usrPassword: {
    errorMessage: USER.ERRORS.CURR_USR_PASSWORD,
    notEmpty: true,
    in: "body",
  },
  newUsrPassword: isValidAddUser.usrPassword,
} satisfies Schema;

/** The validation schema to filter users. */
export const isValidFilterUsers = {
  usrName: { ...isValidAddUser.usrName, optional: true, in: "params" },
  usrEmail: { ...isValidAddUser.usrEmail, optional: true, in: "params" },
} satisfies Schema;
