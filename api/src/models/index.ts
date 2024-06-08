import { PermissionTable } from "./permission.model";
import { RoleTable } from "./role.model";
import { RolePermissionTable } from "./rolePermission.model";
import { UserTable } from "./user.model";
import { UserRoleTable } from "./userRole.model";

export interface Database {
  user: UserTable;
  role: RoleTable;
  user_role: UserRoleTable;
  permission: PermissionTable;
  role_permission: RolePermissionTable;
}

export {
  Permission,
  NewPermission,
  PermissionUpdate,
} from "./permission.model";
export { Role, NewRole, RoleUpdate } from "./role.model";
export {
  RolePermission,
  NewRolePermission,
  RolePermissionUpdate,
} from "./rolePermission.model";
export { User, NewUser, UserUpdate } from "./user.model";
export { UserRole, NewUserRole, UserRoleUpdate } from "./userRole.model";
