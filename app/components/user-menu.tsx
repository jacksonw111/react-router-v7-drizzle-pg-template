import type { User } from "better-auth";
import { LogOut, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { authClient } from "~/lib/auth-client";

export function UserMenu({ user }: { user?: User | null }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      authClient.admin
        .hasPermission({
          userId: user.id,
          permission: {
            customer: ["read"],
          },
        })
        .then((res) => {
          console.log(res)
          setHasPermission(res.data?.success || false);
        });
    }
  }, []);

  const [hasPermission, setHasPermission] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      navigate("/");
      toast.success("已成功退出登录");
    } catch (error) {
      toast.error("退出登录失败");
    }
  };
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link to="/login">登录</Link>
        </Button>
        <Button asChild>
          <Link to="/register">注册</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium text-sm">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>账户设置</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {hasPermission && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/bo/dashboard" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>后台管理</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
