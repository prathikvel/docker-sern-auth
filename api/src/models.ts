import { PermissionTable } from "@/features/permission";
import { RoleTable } from "@/features/role";
import { RolePermissionTable } from "@/features/role-permission";
import { UserTable } from "@/features/user";
import { UserRoleTable } from "@/features/user-role";

export interface Database {
  user: UserTable;
  role: RoleTable;
  user_role: UserRoleTable;
  permission: PermissionTable;
  role_permission: RolePermissionTable;
}
