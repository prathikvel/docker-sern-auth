import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface RolePermissionTable {
  rlpRolId: number;
  rlpPerId: number;
  rlpCreated: ColumnType<Date, Date | undefined, never>;
}

export type RolePermission = Selectable<RolePermissionTable>;
export type NewRolePermission = Insertable<RolePermissionTable>;
export type RolePermissionUpdate = Updateable<RolePermissionTable>;
