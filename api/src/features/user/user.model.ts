import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

import type { Id, Override } from "@/utils/types.util";

export interface UserTable {
  usrId: number;
  usrName: string;
  usrEmail: string;
  usrPassword: string;
  usrCreated: ColumnType<Date, Date | undefined, never>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
export type NewUserGenId = Id<Override<NewUser, { usrId?: number }>>;
