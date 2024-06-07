import { RoleTable } from "./role.model";
import { UserTable } from "./user.model";
import { UserRoleTable } from "./userRole.model";

export interface Database {
  user: UserTable;
  role: RoleTable;
  user_role: UserRoleTable;
}
