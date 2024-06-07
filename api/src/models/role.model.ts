import type {
  ColumnType,
  Generated,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

export interface RoleTable {
  rol_id: Generated<number>;
  rol_name: string;
  rol_created: ColumnType<Date, string | undefined, never>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;
