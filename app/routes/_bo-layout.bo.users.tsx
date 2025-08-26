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

import { useState } from "react";
import { mutate } from "swr";
import {
  BanUserDialog,
  DeleteUserDialog,
  SetPasswordDialog,
  UpdateUserDialog,
} from "~/components/bo/users";

const BOUsers = ({ loaderData }: Route.ComponentProps) => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [unbanDialogOpen, setUnbanDialogOpen] = useState(false);

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const openPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const openBanDialog = (user: any) => {
    setSelectedUser(user);
    if (user.banned) {
      setUnbanDialogOpen(true);
    } else {
      setBanDialogOpen(true);
    }
  };

  const refreshUsers = () => {
    mutate((key) => typeof key === "string" && key.startsWith("fetch-users"));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="pb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions across your system
        </p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          {loaderData.permission.create && <CreateUserDialog />}
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <BOUserTable>
            {(user: any) => (
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
                  (loaderData.permission.ban ||
                    loaderData.permission.delete) && <DropdownMenuSeparator />}
                {loaderData.permission.ban && (
                  <DropdownMenuItem onClick={() => openBanDialog(user)}>
                    <Ban className="mr-2 h-4 w-4" />
                    {user.banned ? "Unban" : "Ban"} User
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
            )}
          </BOUserTable>
        </div>

        {/* Dialogs */}
        <UpdateUserDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          user={selectedUser}
          onSuccess={refreshUsers}
        />
        <SetPasswordDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
          user={selectedUser}
          onSuccess={refreshUsers}
        />
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={selectedUser}
          onSuccess={refreshUsers}
        />
        <BanUserDialog
          open={banDialogOpen}
          onOpenChange={setBanDialogOpen}
          user={selectedUser}
          onSuccess={refreshUsers}
        />
      </div>
    </div>
  );
};
export default BOUsers;
