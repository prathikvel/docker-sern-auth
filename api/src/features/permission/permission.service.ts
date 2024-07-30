import { Permission } from "./permission.model";
import { createPermission } from "./permission.repository";

/**
 * Generates create, read, update, delete, and share permissions for the given
 * entity set.
 *
 * @param name The entity set to generate permissions for
 */
export const generateEntitySetPermissions = async (name: string) => {
  const types = ["create", "read", "update", "delete", "share"];

  const permissions: (Permission | undefined)[] = [];
  for (const type of types) {
    const perName = `${name}:${type}`;
    permissions.push(await createPermission({ perName, perPblId: null }));
  }

  return permissions;
};

/**
 * Generates read, update, delete, and share permissions for the given entity.
 *
 * @param name The entity set to generate permissions for
 * @param id The entity's `id` to generate permissions for
 */
export const generateEntityPermissions = async (name: string, id: number) => {
  const types = ["read", "update", "delete", "share"];

  const permissions: (Permission | undefined)[] = [];
  for (const type of types) {
    const perName = `${name}:${type}`;
    permissions.push(await createPermission({ perName, perPblId: id }));
  }

  return permissions;
};
