import type { Generated, Selectable, Insertable, Updateable } from "kysely";

export interface EntitySetTable {
  setId: Generated<number>;
  setName: string;
}

export type EntitySet = Selectable<EntitySetTable>;
export type NewEntitySet = Insertable<EntitySetTable>;
export type EntitySetUpdate = Updateable<EntitySetTable>;
