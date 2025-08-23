import {
  Ban,
  Edit,
  Key,
  MoreVertical,
  Search,
  UserPlus,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { auth } from "~/lib/auth";
import { authClient } from "~/lib/auth-client";
import { useDebounce } from "~/lib/hooks/use-debounce";
import { useThrottledCallback } from "~/lib/hooks/use-debounced-callback";

// Initialize auth client with admin plugin

export async function loader(args: LoaderFunctionArgs) {
  const session = await auth.api.getSession({
    headers: args.request.headers,
  });

  if (!session?.user) {
    throw Response.json({ message: "Please login first" }, { status: 401 });
  }

  // Check if user has admin access
  const isAdmin = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        user: ["list"],
      },
    },
  });

  if (!isAdmin.success) {
    throw Response.json(
      { message: "Insufficient permissions" },
      { status: 403 }
    );
  }

  // Check specific permissions for different actions
  const canCreateUser = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        user: ["create"],
      },
    },
  });

  const canEditUser = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        user: ["set-role", "set-password"],
      },
    },
  });

  const canDeleteUser = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        user: ["delete"],
      },
    },
  });

  const canBanUser = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: {
        user: ["ban"],
      },
    },
  });
  console.log({
    user: session.user,
    permissions: {
      canCreateUser: canCreateUser.success || false,
      canEditUser: canEditUser.success || false,
      canDeleteUser: canDeleteUser.success || false,
      canBanUser: canBanUser.success || false,
      canSetPassword: canEditUser.success || false, // Same as edit user
    },
  });
  return {
    user: session.user,
    permissions: {
      canCreateUser: canCreateUser.success || false,
      canEditUser: canEditUser.success || false,
      canDeleteUser: canDeleteUser.success || false,
      canBanUser: canBanUser.success || false,
      canSetPassword: canEditUser.success || false, // Same as edit user
    },
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
}

export default function AdminUsers() {
  const loaderData = useLoaderData<typeof loader>();
  const { permissions } = loaderData;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "user",
  });
  const [editUser, setEditUser] = useState({
    email: "",
    name: "",
    role: "user",
  });
  const [newPassword, setNewPassword] = useState("");
  const [banReason, setBanReason] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authClient.admin.listUsers({
        query: {
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
          searchValue: searchTerm,
          searchField: "email",
          searchOperator: "contains",
        },
      });

      if (response.data) {
        setUsers(response.data.users);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      }
    } catch (error) {
      toast.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = useThrottledCallback(async () => {
    if (!permissions.canCreateUser) {
      toast.error("You don't have permission to create users");
      return;
    }

    try {
      const response = await authClient.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
      });

      if (response.data) {
        toast.success("User created successfully");
        setShowCreateDialog(false);
        setNewUser({ email: "", name: "", password: "", role: "user" });
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to create user");
      console.error("Error creating user:", error);
    }
  }, 1000);

  const handleUpdateUser = useThrottledCallback(async () => {
    if (!selectedUser) return;

    if (!permissions.canEditUser) {
      toast.error("You don't have permission to edit users");
      return;
    }

    try {
      // Update role using setRole endpoint
      if (editUser.role !== selectedUser.role) {
        await authClient.admin.setRole({
          userId: selectedUser.id,
          role: editUser.role as "user" | "admin",
        });
      }

      // Update email and name using custom API endpoint
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          email: editUser.email,
          name: editUser.name,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("User updated successfully");
        setShowEditDialog(false);
        fetchUsers();
      } else {
        toast.error(result.error || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error updating user:", error);
    }
  }, 1000);

  const handleDeleteUser = useThrottledCallback(async () => {
    if (!selectedUser) return;

    if (!permissions.canDeleteUser) {
      toast.error("You don't have permission to delete users");
      return;
    }

    try {
      const response = await authClient.admin.removeUser({
        userId: selectedUser.id,
      });

      if (response.data) {
        toast.success("User deleted successfully");
        setShowDeleteDialog(false);
        fetchUsers();
      }
    } catch (error) {
      toast.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  }, 1000);

  const handleBanUser = useThrottledCallback(async () => {
    if (!selectedUser) return;

    if (!permissions.canBanUser) {
      toast.error("You don't have permission to ban/unban users");
      return;
    }

    try {
      if (selectedUser.banned) {
        await authClient.admin.unbanUser({
          userId: selectedUser.id,
        });
        toast.success("User unbanned successfully");
      } else {
        await authClient.admin.banUser({
          userId: selectedUser.id,
          banReason: banReason || "No reason provided",
        });
        toast.success("User banned successfully");
      }
      setShowBanDialog(false);
      setBanReason("");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to ban/unban user");
      console.error("Error banning/unbanning user:", error);
    }
  }, 1000);

  const handleSetPassword = useThrottledCallback(async () => {
    if (!selectedUser) return;

    if (!permissions.canSetPassword) {
      toast.error("You don't have permission to set user passwords");
      return;
    }

    try {
      await authClient.admin.setUserPassword({
        userId: selectedUser.id,
        newPassword: newPassword,
      });

      toast.success("Password updated successfully");
      setShowPasswordDialog(false);
      setNewPassword("");
    } catch (error) {
      toast.error("Failed to update password");
      console.error("Error updating password:", error);
    }
  }, 1000);

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      name: user.name || "",
      role: user.role || "user",
    });
    setShowEditDialog(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const openBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanReason(user.banReason || "");
    setShowBanDialog(true);
  };

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowPasswordDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        {permissions.canCreateUser && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.banned ? "destructive" : "outline"}
                        >
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
                              <DropdownMenuItem
                                onClick={() => openEditDialog(user)}
                              >
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
                              <DropdownMenuItem
                                onClick={() => openBanDialog(user)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                {user.banned ? "Unban" : "Ban"} User
                              </DropdownMenuItem>
                            )}
                            {permissions.canBanUser &&
                              permissions.canDeleteUser && (
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
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="col-span-3"
                type="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="col-span-3"
                type="password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) =>
                  setEditUser({ ...editUser, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                value={editUser.email}
                onChange={(e) =>
                  setEditUser({ ...editUser, email: e.target.value })
                }
                className="col-span-3"
                type="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select
                value={editUser.role}
                onValueChange={(value) =>
                  setEditUser({ ...editUser, role: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set New Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                New Password
              </Label>
              <Input
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="col-span-3"
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSetPassword}>Set Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.banned ? "Unban User" : "Ban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.banned
                ? `Are you sure you want to unban ${selectedUser?.email}?`
                : `Are you sure you want to ban ${selectedUser?.email}? This will prevent them from accessing the system.`}
            </AlertDialogDescription>
            {!selectedUser?.banned && (
              <div className="mt-4">
                <Label htmlFor="ban-reason">Reason (optional)</Label>
                <Input
                  id="ban-reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter ban reason..."
                />
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser}>
              {selectedUser?.banned ? "Unban" : "Ban"} User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.email}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
