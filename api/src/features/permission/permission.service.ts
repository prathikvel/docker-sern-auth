import {
  PERMISSION,
  EntitySetName,
  PermissionTypeName,
} from "@/configs/global.config";

import { Permission } from "./permission.model";
import { createPermission } from "./permission.repository";

/**
 * Generates create, read, update, delete, and share permissions for the given
 * entity set.
 *
 * @param set The entity set to generate permissions for
 */
export const generateEntitySetPermissions = async (set: EntitySetName) => {
  const permissions: (Permission | undefined)[] = [];
  for (const type of PERMISSION.TYPE.NAMES) {
    permissions.push(
      await createPermission({ perSet: set, perType: type, perEntity: null })
    );
  }

  return permissions;
};

/**
 * Generates read, update, delete, and share permissions for the given entity.
 *
 * @param set The entity set to generate permissions for
 * @param id The entity's `id` to generate permissions for
 */
export const generateEntityPermissions = async (
  set: EntitySetName,
  id: number
) => {
  const types: PermissionTypeName[] = ["read", "update", "delete", "share"];

  const permissions: (Permission | undefined)[] = [];
  for (const type of types) {
    permissions.push(
      await createPermission({ perSet: set, perType: type, perEntity: id })
    );
  }

  return permissions;
};
