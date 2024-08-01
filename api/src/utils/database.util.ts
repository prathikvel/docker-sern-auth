import { convertCamelToSnake, convertSnakeToCamel } from "@/utils/string.util";

/** A custom record with string keys. */
type CustomRecord = Record<string, unknown>;

/**
 * Converts the property for the given object from camelCase to snake_case.
 *
 * @param obj The object with the property
 * @param prop The property name to convert
 * @returns The given object with the given property converted to snake_case
 */
export const convertPropForDb = <T extends CustomRecord, K extends keyof T>(
  obj: T,
  prop: K
) => {
  if (typeof obj?.[prop] === "string") {
    obj[prop] = convertCamelToSnake(obj[prop] as string) as T[K];
  }

  return obj;
};

/**
 * Converts the property for the given object from snake_case to camelCase.
 *
 * @param obj The object with the property
 * @param prop The property name to convert
 * @returns The given object with the given property converted to camelCase
 */
export const convertPropForJs = <T extends CustomRecord, K extends keyof T>(
  obj: T | undefined,
  prop: K
) => {
  if (typeof obj?.[prop] === "string") {
    obj[prop] = convertSnakeToCamel(obj[prop] as string) as T[K];
  }

  return obj;
};
