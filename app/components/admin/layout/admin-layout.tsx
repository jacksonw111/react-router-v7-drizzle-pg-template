import { useState } from "react";
import { Outlet } from "react-router";
import { AdminHeader } from "./header";
import { AdminSidebar } from "./sidebar";

interface AdminLayoutProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    permissions: string[];
  };
}

export function AdminLayout({ user }: AdminLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          userPermissions={user?.permissions || []}
          isCollapsed={isSidebarCollapsed}
          onToggle={handleToggleSidebar}
        />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={handleToggleMobileMenu}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
            <AdminSidebar
              userPermissions={user?.permissions || []}
              onToggle={handleToggleMobileMenu}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleSidebar={handleToggleMobileMenu} user={user} />

        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
