import { Ban, Edit, Key, MoreVertical, UserX } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { AnimatedPagination } from "~/components/ui/animated-pagination";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { authClient } from "~/lib/auth-client";

export const BOUserTable = (permissions) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const fetchUsers = authClient.admin.listUsers({
    query: {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      searchValue: searchTerm,
      searchField: "email",
      searchOperator: "contains",
    },
  });
  const { data, isLoading } = useSWR(
    `fetch-users-${currentPage}-${searchTerm}`,
    () => fetchUsers
  );
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : data?.data?.users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            data?.data?.users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.name || "N/A"}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role || "user"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.banned ? "destructive" : "outline"}>
                    {user.banned ? "Banned" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {permissions.canEditUser && (
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {permissions.canSetPassword && (
                        <DropdownMenuItem
                          onClick={() => openPasswordDialog(user)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Set Password
                        </DropdownMenuItem>
                      )}
                      {(permissions.canEditUser ||
                        permissions.canSetPassword) &&
                        (permissions.canBanUser ||
                          permissions.canDeleteUser) && (
                          <DropdownMenuSeparator />
                        )}
                      {permissions.canBanUser && (
                        <DropdownMenuItem onClick={() => openBanDialog(user)}>
                          <Ban className="mr-2 h-4 w-4" />
                          {user.banned ? "Unban" : "Ban"} User
                        </DropdownMenuItem>
                      )}
                      {permissions.canBanUser && permissions.canDeleteUser && (
                        <DropdownMenuSeparator />
                      )}
                      {permissions.canDeleteUser && (
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
                          className="text-destructive"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          {Math.min((currentPage - 1) * pageSize + 1, data?.data?.total || 0)}{" "}
          to {Math.min(currentPage * pageSize, data?.data?.total || 0)} of{" "}
          {data?.data?.total || 0} users
        </div>
        <AnimatedPagination
          currentPage={currentPage}
          totalPages={Math.max(
            1,
            Math.ceil((data?.data?.total || 0) / pageSize)
          )}
          onPageChange={setCurrentPage}
          maxVisiblePages={7}
          showPreviousNext={true}
          showFirstLast={false}
        />
      </div>
    </div>
  );
};
