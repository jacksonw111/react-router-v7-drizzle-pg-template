import { useState } from "react";
import useSWRMutation from "swr/mutation";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  email: string;
  banned?: boolean;
  banReason?: string;
}

interface BanUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function BanUserDialog({ open, onOpenChange, user, onSuccess }: BanUserDialogProps) {
  const [banReason, setBanReason] = useState("");

  const { trigger: banUser, isMutating } = useSWRMutation(
    user ? `ban-user-${user.id}` : null,
    () => {
      if (!user) return;
      
      if (user.banned) {
        return authClient.admin.unbanUser({
          userId: user.id,
        });
      } else {
        return authClient.admin.banUser({
          userId: user.id,
          banReason: banReason || "No reason provided",
        });
      }
    },
    {
      onSuccess: () => {
        setBanReason("");
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error banning/unbanning user:", error);
      },
    }
  );

  const handleBan = () => {
    banUser();
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {user.banned ? "Unban User" : "Ban User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {user.banned
              ? `Are you sure you want to unban ${user.email}?`
              : `Are you sure you want to ban ${user.email}? This will prevent them from accessing the system.`}
          </AlertDialogDescription>
          {!user.banned && (
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
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleBan();
            }}
            disabled={isMutating}
          >
            {isMutating ? "Processing..." : (user.banned ? "Unban" : "Ban") + " User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}