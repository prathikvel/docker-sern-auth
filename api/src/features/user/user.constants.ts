export const CONFIG = {
  pwdMinLength: 12,
  pwdSaltRounds: 10,
} as const;

export const ERROR_MESSAGES = {
  usrId: "Please enter an integer",
  usrName: "Please enter a string that only contains letters",
  usrEmail: "Please enter a valid email address",
  usrPassword: "Please enter a string of at least 12 characters",
  oldUsrPassword: "Please enter a non-empty string",
  newUsrPassword: "Please enter a string of at least 12 characters",
  invalidCredentials: "Invalid user ID and/or password",
} as const;
