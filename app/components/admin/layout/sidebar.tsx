import { Home, LogOut, Menu, Users, ChevronDown } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { authClient } from "~/lib/auth-client";

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
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
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
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white",
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
  user,
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
        "bg-gray-900 border-r border-gray-800 transition-all duration-300 h-screen flex flex-col text-white",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600" />
            <span className="font-bold text-lg text-white">Admin</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
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

      <div className="border-t border-gray-800 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8 border-2 border-gray-700">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "A"}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
              
              {!isCollapsed && (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-gray-900 border-gray-800 text-white"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-white">
                  {user?.name}
                </p>
                <p className="text-xs leading-none text-gray-400">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 hover:text-white focus:bg-gray-800 focus:text-white">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              className="text-red-400 hover:bg-red-950 hover:text-red-300 focus:bg-red-950 focus:text-red-300"
              onClick={async () => await authClient.signOut()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
