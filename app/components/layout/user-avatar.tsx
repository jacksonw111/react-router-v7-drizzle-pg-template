import type { User } from "better-auth";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

interface UserAvatarProps {
  user: User;
}

export function UserAvatar({ user }: UserAvatarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsDropdownOpen(false);

    try {
      // 调用退出登录 API
      await authClient.signOut();
    } catch (error) {
      console.error("退出登录异常:", error);
      // 即使 API 调用失败，我们也继续清理本地状态
    } finally {
      // 无论 API 调用是否成功，都跳转到首页
      // 这样可以确保用户界面状态的一致性
      navigate("/");
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 rounded-full"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </div>
        )}
      </Button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-background border rounded-md shadow-lg z-20">
            <div className="p-3 border-b">
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="p-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
