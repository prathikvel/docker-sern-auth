import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface RolePermissionTable {
  rlp_rol_id: number;
  rlp_per_id: number;
  rlp_created: ColumnType<Date, Date | undefined, never>;
}

export type RolePermission = Selectable<RolePermissionTable>;
export type NewRolePermission = Insertable<RolePermissionTable>;
export type RolePermissionUpdate = Updateable<RolePermissionTable>;
