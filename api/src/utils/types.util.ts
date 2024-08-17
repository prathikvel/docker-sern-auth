/** A custom record with string keys */
export type CustomRecord = Record<string, unknown>;

/** Identity type to force object expansion */
export type Id<T extends object> = {} & { [P in keyof T]: T[P] };

/** Helper type to override an object property */
export type Override<Type, NewType> = Id<Omit<Type, keyof NewType> & NewType>;

/** Helper type to pick and require properties */
export type PickAndNonNull<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>;
};
