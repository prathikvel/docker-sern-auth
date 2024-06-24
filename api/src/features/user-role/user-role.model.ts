import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface UserRoleTable {
  urlUsrId: number;
  urlRolId: number;
  urlCreated: ColumnType<Date, Date | undefined, never>;
}

export type UserRole = Selectable<UserRoleTable>;
export type NewUserRole = Insertable<UserRoleTable>;
export type UserRoleUpdate = Updateable<UserRoleTable>;
