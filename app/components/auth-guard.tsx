import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "~/lib/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = false,
  redirectTo = "/",
}: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // 如果已登录且访问登录/注册页面，跳转到首页
    if (
      user &&
      (location.pathname === "/sign-in" || location.pathname === "/sign-up")
    ) {
      navigate("/");
      return;
    }

    // 如果需要认证但未登录，跳转到登录页
    if (requireAuth && !user) {
      navigate("/sign-in");
      return;
    }
  }, [user, isLoading, requireAuth, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
