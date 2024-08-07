import type {
  ColumnType,
  Generated,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

export interface PermissionTable {
  perId: Generated<number>;
  perSet: string;
  perType: string;
  perEntity: number | null;
  perCreated: ColumnType<Date, Date | undefined, never>;
}

export type Permission = Selectable<PermissionTable>;
export type NewPermission = Insertable<PermissionTable>;
export type PermissionUpdate = Updateable<PermissionTable>;
