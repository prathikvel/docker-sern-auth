import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

export interface UserTable {
  usrId: number;
  usrName: string;
  usrEmail: string;
  usrPassword: string;
  usrCreated: ColumnType<Date, Date | undefined, never>;
}

export type User = Selectable<UserTable>;
export type UserIds = Pick<User, "usrId">;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
