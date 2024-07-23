import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";

import type { Id, Override } from "@/utils/types.util";

export interface RoleTable {
  rolId: number;
  rolName: string;
  rolCreated: ColumnType<Date, Date | undefined, never>;
}

export type Role = Selectable<RoleTable>;
export type NewRole = Insertable<RoleTable>;
export type RoleUpdate = Updateable<RoleTable>;
export type NewRoleGenId = Id<Override<NewRole, { rolId?: number }>>;
