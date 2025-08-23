import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface UpdateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

interface EditUserForm {
  email: string;
  name: string;
  role: string;
}

export function UpdateUserDialog({ open, onOpenChange, user, onSuccess }: UpdateUserDialogProps) {
  const [editUser, setEditUser] = useState<EditUserForm>({
    email: "",
    name: "",
    role: "user",
  });

  const { trigger: updateUser, isMutating } = useSWRMutation(
    user ? `update-user-${user.id}` : null,
    async () => {
      if (!user) return;
      
      // Update role
      if (editUser.role !== user.role) {
        await authClient.admin.setRole({
          userId: user.id,
          role: editUser.role as "user" | "admin",
        });
      }
      
      // Update user info via API
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          email: editUser.email,
          name: editUser.name,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      
      return response.json();
    },
    {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error updating user:", error);
      },
    }
  );

  useEffect(() => {
    if (user) {
      setEditUser({
        email: user.email,
        name: user.name || "",
        role: user.role || "user",
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information for {user.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
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
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="col-span-3"
                type="email"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({ ...editUser, role: value })}
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
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}