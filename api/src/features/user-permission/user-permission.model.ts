import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface UserPermissionTable {
  urpUsrId: number;
  urpPerId: number;
  urpCreated: ColumnType<Date, Date | undefined, never>;
}

export type UserPermission = Selectable<UserPermissionTable>;
export type NewUserPermission = Insertable<UserPermissionTable>;
export type UserPermissionUpdate = Updateable<UserPermissionTable>;
