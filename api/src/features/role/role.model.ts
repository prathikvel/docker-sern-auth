import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface RoleTable {
  rolId: number;
  rolName: string;
  rolCreated: ColumnType<Date, Date | undefined, never>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;
