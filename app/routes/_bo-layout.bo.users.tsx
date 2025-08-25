import { Ban, Edit, Key, UserX } from "lucide-react";
import type { LoaderFunctionArgs } from "react-router";
import { CreateUserDialog } from "~/components/bo/users";
import { BOUserTable } from "~/components/bo/users/table-list";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { userContext } from "~/context";
// import type { user } from "~/db/schemas/auth-schema";
import { auth } from "~/lib/auth";
import type { Route } from "./+types/_bo-layout.bo.users";

export async function loader({ context }: LoaderFunctionArgs) {
  // Add loader logic here if needed
  const user = context.get(userContext);
  const listPermission = await auth.api.userHasPermission({
    body: {
      userId: user?.id,
      permission: {
        user: ["list"],
      },
    },
  });
  const userManagerPermission = await auth.api.userHasPermission({
    body: {
      userId: user?.id,
      permission: {
        user: ["list", "create", "update", "ban"],
      },
    },
  });

  const adminPermission = await auth.api.userHasPermission({
    body: {
      userId: user?.id,
      permission: {
        user: [
          "list",
          "create",
          "update",
          "ban",
          "set-role",
          "delete",
          "set-password",
        ],
      },
    },
  });

  return {
    user,
    permission: {
      list: listPermission.success,
      create: userManagerPermission.success,
      update: userManagerPermission.success,
      edit: userManagerPermission.success,
      ban: userManagerPermission.success,
      set_role: adminPermission.success,
      delete: adminPermission.success,
      set_password: adminPermission.success,
    },
  };
}

const BOUsers = ({ loaderData }: Route.ComponentProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across your system
        </p>
      </div>
      <div>
        {loaderData.permission.create && <CreateUserDialog />}
        <BOUserTable>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {loaderData.permission.edit && (
              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {loaderData.permission.set_password && (
              <DropdownMenuItem onClick={() => openPasswordDialog(user)}>
                <Key className="mr-2 h-4 w-4" />
                Set Password
              </DropdownMenuItem>
            )}
            {(loaderData.permission.edit ||
              loaderData.permission.set_password) &&
              (loaderData.permission.ban || loaderData.permission.delete) && (
                <DropdownMenuSeparator />
              )}
            {loaderData.permission.ban && (
              <DropdownMenuItem onClick={() => openBanDialog(user)}>
                <Ban className="mr-2 h-4 w-4" />
                {loaderData.user?.banned ? "Unban" : "Ban"} User
              </DropdownMenuItem>
            )}
            {loaderData.permission.ban && loaderData.permission.delete && (
              <DropdownMenuSeparator />
            )}
            {loaderData.permission.delete && (
              <DropdownMenuItem
                onClick={() => openDeleteDialog(user)}
                className="text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </BOUserTable>
      </div>
    </div>
  );
};
export default BOUsers;
