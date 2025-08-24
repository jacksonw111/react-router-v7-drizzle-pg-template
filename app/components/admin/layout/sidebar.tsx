import { Home, LogOut, Menu, UserCircle, Users } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  href?: string;
  children?: MenuItem[];
  permissions?: string[];
}

interface SidebarProps {
  userPermissions: string[];
  menuItems?: MenuItem[];
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/bo/dashboard",
    permissions: ["dashboard:view"],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    href: "/bo/users",
    permissions: ["user:read"],
  },
];

interface MenuItemProps {
  item: MenuItem;
  level: number;
  userPermissions: string[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  isCollapsed: boolean;
}

function MenuItemComponent({
  item,
  level,
  userPermissions,
  isExpanded,
  onToggle,
  isCollapsed,
}: MenuItemProps) {
  // const hasPermission =
  //   !item.permissions ||
  //   item.permissions.some((p) => userPermissions.includes(p));

  // if (!hasPermission) return null;

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    // const hasChildrenPermission = item.children.some(
    //   (child) =>
    //     !child.permissions ||
    //     child.permissions.some((p) => userPermissions.includes(p))
    // );
    //   // if (!hasChildrenPermission) return null;
    // return (
    //   <Collapsible
    //     open={isExpanded}
    //     onOpenChange={() => onToggle(item.id)}
    //     className="group"
    //   >
    //     {/* <CollapsibleTrigger className="w-full">
    //       <div
    //         className={cn(
    //           "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/50 transition-colors",
    //           isCollapsed && "justify-center px-2"
    //         )}
    //       >
    //         <div
    //           className={cn("flex items-center gap-3", isCollapsed && "gap-0")}
    //         >
    //           {Icon && <Icon className="h-4 w-4" />}
    //           {!isCollapsed && <span>{item.label}</span>}
    //         </div>
    //         {!isCollapsed && (
    //           <ChevronRight
    //             className={cn(
    //               "h-4 w-4 transition-transform",
    //               isExpanded && "rotate-90"
    //             )}
    //           />
    //         )}
    //       </div>
    //     </CollapsibleTrigger> */}
    //     {/* {!isCollapsed && (
    //       <CollapsibleContent>
    //         <div className="ml-4 space-y-1">
    //           {item.children?.map((child) => (
    //             <MenuItemComponent
    //               key={child.id}
    //               item={child}
    //               level={level + 1}
    //               userPermissions={userPermissions}
    //               isExpanded={false}
    //               onToggle={onToggle}
    //               isCollapsed={isCollapsed}
    //             />
    //           ))}
    //         </div>
    //       </CollapsibleContent>
    //     )} */}
    //   </Collapsible>
    // );
  }

  return (
    <NavLink
      to={item.href!}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "hover:bg-accent/50 text-muted-foreground",
          level > 0 && "ml-4",
          isCollapsed && "justify-center px-2 gap-0"
        )
      }
    >
      {Icon && <Icon className="h-4 w-4" />}
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export function AdminSidebar({
  userPermissions,
  menuItems = defaultMenuItems,
  isCollapsed = false,
  onToggle,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // const filteredMenuItems = menuItems.filter((item) => {
  //   if (item.children) {
  //     return item.children.some(
  //       (child) =>
  //         !child.permissions ||
  //         child.permissions.some((p) => userPermissions.includes(p))
  //     );
  //   }
  //   return (
  //     !item.permissions ||
  //     item.permissions.some((p) => userPermissions.includes(p))
  //   );
  // });

  return (
    <aside
      className={cn(
        "bg-card border-r transition-all duration-300 h-screen flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary/10" />
            <span className="font-bold text-lg">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {defaultMenuItems.map((item) => (
            <MenuItemComponent
              key={item.id}
              item={item}
              level={0}
              userPermissions={userPermissions}
              isExpanded={expandedItems.has(item.id)}
              onToggle={handleToggle}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t p-2">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">
                admin@example.com
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 justify-start"
            onClick={() => console.log("Logout clicked")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        )}
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full mt-2"
            onClick={() => console.log("Logout clicked")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}
