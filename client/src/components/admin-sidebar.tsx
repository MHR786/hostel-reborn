import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BedDouble,
  CreditCard,
  Wallet,
  Receipt,
  DollarSign,
  UserCog,
  HandCoins,
  Utensils,
  CalendarCheck,
  Megaphone,
  Settings,
  Building2,
  Clock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const menuItems = [
  {
    group: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    group: "Student Management",
    items: [
      { title: "Students", url: "/admin/students", icon: GraduationCap },
      { title: "Seat Allocation", url: "/admin/seats", icon: BedDouble },
    ],
  },
  {
    group: "Financial",
    items: [
      { title: "Student Payments", url: "/admin/payments/students", icon: CreditCard },
      { title: "Vendor Payments", url: "/admin/payments/vendors", icon: Wallet },
      { title: "Expenses", url: "/admin/expenses", icon: Receipt },
    ],
  },
  {
    group: "Employee & Payroll",
    items: [
      { title: "Employees", url: "/admin/employees", icon: UserCog },
      { title: "Salary", url: "/admin/salary", icon: HandCoins },
    ],
  },
  {
    group: "Mess & Attendance",
    items: [
      { title: "Meal Management", url: "/admin/meals", icon: Utensils },
      { title: "Attendance", url: "/admin/attendance", icon: CalendarCheck },
    ],
  },
  {
    group: "System",
    items: [
      { title: "Notices", url: "/admin/notices", icon: Megaphone },
      { title: "Complaints", url: "/admin/complaints", icon: Users },
      { title: "Blocks & Rooms", url: "/admin/blocks", icon: Building2 },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">HMS Admin</span>
            <span className="text-xs text-muted-foreground">Management System</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location === item.url || 
                    (item.url !== "/admin" && location.startsWith(item.url));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="w-full"
                      >
                        <Link href={item.url} data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{user?.name || "Admin"}</span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
