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
  role?: string;
}

interface SetRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function SetRoleDialog({ open, onOpenChange, user, onSuccess }: SetRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState("user");

  const { trigger: setRole, isMutating } = useSWRMutation(
    user ? `set-role-${user.id}` : null,
    () => {
      if (!user) return;
      return authClient.admin.setRole({
        userId: user.id,
        role: selectedRole,
      });
    },
    {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error setting role:", error);
      },
    }
  );

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || "user");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole();
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="col-span-4">
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
              {isMutating ? "Setting..." : "Set Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}