import { Link } from "react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useAuth } from "~/lib/use-auth";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { Settings, LogOut, User } from "lucide-react";

export function UserMenu() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link to="/sign-in">登录</Link>
        </Button>
        <Button asChild>
          <Link to="/sign-up">注册</Link>
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("已成功退出登录");
    } catch (error) {
      toast.error("退出登录失败");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && (
              <p className="font-medium text-sm">{user.name}</p>
            )}
            {user.email && (
              <p className="w-[200px] truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>账户设置</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="flex items-center cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}