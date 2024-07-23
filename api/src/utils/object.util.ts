import { Id } from "@/utils/types.util";

/**
 * Picks a set of properties from the object.
 *
 * @param obj The object to pick properties from
 * @param props A set of properties of the object
 * @returns The object with only the given properties
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  props: Readonly<K[]>
): Id<Pick<T, K>> => {
  const filteredObj = {} as Pick<T, K>;

  for (const prop of props) {
    if (Object.hasOwn(obj, prop)) {
      filteredObj[prop] = obj[prop];
    }
  }

  return filteredObj;
};
