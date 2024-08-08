import type {
  ColumnType,
  Generated,
  Selectable,
  Insertable,
  Updateable,
} from "kysely";

export interface RoleTable {
  rolId: Generated<number>;
  rolName: string;
  rolCreated: ColumnType<Date, Date | undefined, never>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;
