import type {
  ColumnType,
  Generated,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

export interface PermissionTable {
  perId: Generated<number>;
  perName: string;
  perCreated: ColumnType<Date, Date | undefined, never>;
}

export type Permission = Selectable<PermissionTable>;
export type PermissionIds = Pick<Permission, "perId">;
export type NewPermission = Insertable<PermissionTable>;
export type PermissionUpdate = Updateable<PermissionTable>;
