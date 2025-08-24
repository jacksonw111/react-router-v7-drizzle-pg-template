import type { User } from "better-auth";
import { LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, type LoaderFunctionArgs } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { userContext } from "~/context";
import { authClient } from "~/lib/auth-client";

export function loader({ context }: LoaderFunctionArgs) {
  return context.get(userContext);
}
export function UserMenu({ user }: { user?: User | null }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data } = useSWR(user ? user.id : null, (id) =>
    authClient.admin.hasPermission({
      userId: id,
      permission: {
        system: ["access"],
      },
    })
  );
  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" asChild>
          <Link to="/login">{t("auth.login")}</Link>
        </Button>
        <Button asChild>
          <Link to="/register">{t("auth.register")}</Link>
        </Button>
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      navigate("/");
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
        {data?.data?.success && (
          <DropdownMenuItem asChild>
            <Link to="/bo/dashboard" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>后台管理</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />

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
