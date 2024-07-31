import type { Generated, Selectable, Insertable, Updateable } from "kysely";

export interface PermissionTypeTable {
  prtId: Generated<number>;
  prtName: string;
}

export type PermissionType = Selectable<PermissionTypeTable>;
export type NewPermissionType = Insertable<PermissionTypeTable>;
export type PermissionTypeUpdate = Updateable<PermissionTypeTable>;
