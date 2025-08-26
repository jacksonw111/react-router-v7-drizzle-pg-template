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
import { authClient } from "~/lib/auth-client";

interface User {
  id: string;
  email: string;
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ open, onOpenChange, user, onSuccess }: DeleteUserDialogProps) {
  const { trigger: deleteUser, isMutating } = useSWRMutation(
    user ? `delete-user-${user.id}` : null,
    () => {
      if (!user) return;
      return authClient.admin.removeUser({
        userId: user.id,
      });
    },
    {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        console.error("Error deleting user:", error);
      },
    }
  );

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {user.email}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              deleteUser();
            }}
            className="bg-destructive"
            disabled={isMutating}
          >
            {isMutating ? "Deleting..." : "Delete User"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}