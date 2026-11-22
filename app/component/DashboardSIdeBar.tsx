"use client";

import { authClient } from "@/lib/auth-client";
import {
  CalendarCheck,
  ClipboardList,
  Heart,
  Package,
  PackageCheck,
  PlusCircle,
  User,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type MenuItem = {
  name: string;
  url: string;
  icon: LucideIcon;
};

type UserRole = "customer" | "admin" | "owner";

const menuItemsbyRole: Record<UserRole, MenuItem[]> = {
  customer: [
    { name: "My Rentals", url: "/Dashboard/customer/rentals", icon: ClipboardList },
    { name: "Favorites", url: "/Dashboard/customer/favorites", icon: Heart },
    { name: "Profile", url: "/Dashboard/customer/profile", icon: User },
  ],
  admin: [
    { name: "All Users", url: "/Dashboard/admin/users", icon: Users },
    { name: "All Equipment", url: "/Dashboard/admin/equipment", icon: PackageCheck },
    { name: "All Rentals", url: "/Dashboard/admin/rentals", icon: ClipboardList },
    { name: "My Profile", url: "/Dashboard/admin/profile", icon: User },
  ],
  owner: [
    { name: "Add Equipment", url: "/Dashboard/owner/addEquipment", icon: PlusCircle },
    { name: "My Equipment", url: "/Dashboard/owner/myEquiment", icon: Package },
    { name: "My Equipment Rental", url: "/Dashboard/owner/myEquipmentRental", icon: CalendarCheck },
    { name: "My Profile", url: "/Dashboard/owner/myProfile", icon: User },
  ],
};

export function DashboardSideBar() {
  const { data: session, isPending } = authClient.useSession();

  // Role normalize kora hoy jate unknown/case-different role e menu crash na kore.
  const rawRole = String(session?.user?.role ?? "").toLowerCase();
  const role: UserRole | undefined =
    rawRole === "customer" || rawRole === "admin" || rawRole === "owner"
      ? rawRole
      : undefined;
  const menuItems = role ? menuItemsbyRole[role] : [];

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarHeader>
          <p>Name: {session?.user?.name || (isPending ? "Loading..." : "No user found")}</p>
          <p>Email: {session?.user?.email || (isPending ? "Loading..." : "No email found")}</p>
          <p>Role: {role || (isPending ? "Loading..." : "No role found")}</p>
        </SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton render={<Link href={item.url} />}>
                  <item.icon />
                  <span>{item.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarGroupContent></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
