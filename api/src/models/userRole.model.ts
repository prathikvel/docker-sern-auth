import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface UserRoleTable {
  url_usr_id: number;
  url_rol_id: number;
  url_created: ColumnType<Date, string | undefined, never>;
}

export type UserRole = Selectable<UserRoleTable>;
export type NewUserRole = Insertable<UserRoleTable>;
export type UserRoleUpdate = Updateable<UserRoleTable>;
