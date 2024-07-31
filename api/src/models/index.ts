import { EntitySetTable } from "@/features/entity-set";
import { PermissibleTable } from "@/features/permissible";
import { PermissionTypeTable, PermissionTable } from "@/features/permission";
import { RoleTable } from "@/features/role";
import { RolePermissionTable } from "@/features/role-permission";
import { UserTable } from "@/features/user";
import { UserPermissionTable } from "@/features/user-permission";
import { UserRoleTable } from "@/features/user-role";

export interface Database {
  entitySet: EntitySetTable;
  permissible: PermissibleTable;
  user: UserTable;
  role: RoleTable;
  userRole: UserRoleTable;
  permissionType: PermissionTypeTable;
  permission: PermissionTable;
  rolePermission: RolePermissionTable;
  userPermission: UserPermissionTable;
}
