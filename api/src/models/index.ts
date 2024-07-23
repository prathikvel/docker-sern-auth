import { PermissibleTable } from "@/features/permissible";
import { PermissionTable } from "@/features/permission";
import { RoleTable } from "@/features/role";
import { RolePermissionTable } from "@/features/role-permission";
import { UserTable } from "@/features/user";
import { UserPermissionTable } from "@/features/user-permission";
import { UserRoleTable } from "@/features/user-role";

export interface Database {
  permissible: PermissibleTable;
  user: UserTable;
  role: RoleTable;
  userRole: UserRoleTable;
  permission: PermissionTable;
  rolePermission: RolePermissionTable;
  userPermission: UserPermissionTable;
}
