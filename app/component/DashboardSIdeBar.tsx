
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
import { LucideIcon } from "lucide-react";
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
    { name: "My Profile", url: "/Dashboard/owner/myprofile", icon: User },
  ],
};
export function DashboardSideBar() {
  const { data: session, isPending } = authClient.useSession();
     const role = session?.user?.role as UserRole | undefined;
     console.log("Session:", session);
console.log("User Role:", role);

const menuItems = role ? menuItemsbyRole[role] : [];
  return (
    <Sidebar>
      <SidebarHeader >
      <SidebarHeader>
  <p>Name: {session?.user?.name || "No user found"}</p>
  <p>Email: {session?.user?.email || "No email found"}</p>
  <p>Role: {role || "No role found"}</p>
</SidebarHeader>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
        <SidebarGroup>
 <SidebarMenu>
  {menuItems.map((item: MenuItem)=> (
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