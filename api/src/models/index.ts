import { RoleTable } from "./role.model";
import { UserTable } from "./user.model";
import { UserRoleTable } from "./userRole.model";

export interface Database {
  user: UserTable;
  role: RoleTable;
  user_role: UserRoleTable;
}

export { Role, NewRole, RoleUpdate } from "./role.model";
export { User, NewUser, UserUpdate } from "./user.model";
export { UserRole, NewUserRole, UserRoleUpdate } from "./userRole.model";
