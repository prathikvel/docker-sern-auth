/** Identity type to force object expansion */
export type Id<T extends object> = {} & { [P in keyof T]: T[P] };

/** Helper type to override an object property */
export type Override<Type, NewType> = Omit<Type, keyof NewType> & NewType;
