import type { Generated, Selectable, Insertable, Updateable } from "kysely";

export interface PermissibleTable {
  pblId: Generated<number>;
}

export type Permissible = Selectable<PermissibleTable>;
export type NewPermissible = Insertable<PermissibleTable>;
export type PermissibleUpdate = Updateable<PermissibleTable>;
