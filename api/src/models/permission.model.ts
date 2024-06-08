import type {
  ColumnType,
  Generated,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

export interface PermissionTable {
  per_id: Generated<number>;
  per_name: string;
  per_created: ColumnType<Date, string | undefined, never>;
}

export type Permission = Selectable<PermissionTable>;
export type NewPermission = Insertable<PermissionTable>;
export type PermissionUpdate = Updateable<PermissionTable>;
